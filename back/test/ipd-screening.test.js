const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  screeningWindow,
  screeningWardsSql,
  screeningHeadersSql,
  screeningItemsSql,
} = require("../services/ipdScreening");

test("Screening preserves native before/at-08:00 behavior including past selected dates", () => {
  const before = new Date("2026-10-18T00:59:59Z");
  const at = new Date("2026-10-18T01:00:00Z");
  assert.equal(
    screeningWindow("2026-10-18", undefined, before).workdate,
    "2026-10-17",
  );
  assert.equal(
    screeningWindow("2026-10-18", undefined, at).workdate,
    "2026-10-18",
  );
  assert.equal(
    screeningWindow("2025-06-01", undefined, before).workdate,
    "2025-05-31",
  );
  assert.equal(
    screeningWindow("2024-03-01", undefined, before).workdate,
    "2024-02-29",
  );
  assert.equal(
    screeningWindow("2026-01-01", undefined, before).workdate,
    "2025-12-31",
  );
});

test("Screening freezes the chosen round across 08:00 and keeps separate ward/detail cutoffs", () => {
  const result = screeningWindow(
    "2026-10-18",
    "2026-10-17",
    new Date("2026-10-18T05:00:00Z"),
  );
  assert.equal(result.start, "2026-10-17 08:00:00");
  assert.equal(result.wardEnd, "2026-10-18 07:59:00");
  assert.equal(result.end, "2026-10-18 07:59:59");
  assert.equal(
    screeningWindow("9999-12-30", "9999-12-30").end,
    "9999-12-31 07:59:59",
  );
});

test("Screening preserves eligibility, round and search with pharmacy-scoped headers/items", () => {
  for (const text of [
    screeningWardsSql,
    screeningHeadersSql,
    screeningItemsSql,
  ]) {
    assert.match(text, /p\.genorderdatetime IS NULL/);
    assert.match(text, /p\.genorderdatetime IS NOT NULL/);
    assert.match(text, /IN \('S', 'E', 'STAT'\)/);
    assert.match(
      text,
      /@mode = 'continue-wait' AND p\.genorderdatetime IS NULL\s+AND ISNULL\(p\.frequencycode, ''\) NOT IN \('S', 'E', 'STAT'\)/,
    );
    assert.match(text, /p\.ordertype <> '1'/);
    assert.match(
      text,
      /@mode = 'continue-finished' AND p\.genorderdatetime IS NOT NULL\s+AND ISNULL\(p\.frequencycode, ''\) NOT IN \('S', 'E', 'STAT'\)/,
    );
    assert.match(text, /room\.roomcode = @roomCode/);
    assert.match(
      text,
      /BETWEEN CAST\(@start AS datetime\) AND CAST\(@end AS datetime\)/,
    );
    assert.ok(!/\b(INSERT|UPDATE|DELETE|MERGE)\b/i.test(text));
    assert.ok(!text.includes("voiddatetime IS NULL"));
  }
  assert.match(screeningWardsSql, /COUNT\(DISTINCT p\.prescriptionno\)/);
  assert.ok(!screeningWardsSql.includes("TRY_CONVERT"));
  assert.match(
    screeningWardsSql,
    /@mode <> 'stat-finished' OR p\.prioritycode NOT LIKE '%C%'/,
  );
  assert.ok(!screeningHeadersSql.includes("prioritycode NOT LIKE"));
  assert.match(screeningItemsSql, /p\.hn = @hn AND p\.an = @an/);
  assert.match(
    screeningItemsSql,
    /p\.wardcode = @wardCode AND p\.prescriptionno = @prescriptionno/,
  );
});

test("only Continue-finished ward totals bypass pharmacy like native; headers/items keep exact room and patient scope", () => {
  assert.match(
    screeningWardsSql,
    /AND \(@mode = 'continue-finished' OR EXISTS \(SELECT 1 FROM dbo\.ms_room/,
  );
  assert.match(screeningWardsSql, /COUNT\(DISTINCT p\.prescriptionno\)/);
  assert.match(screeningWardsSql, /GROUP BY p\.wardcode, p\.wardname/);
  assert.doesNotMatch(
    screeningWardsSql,
    /wardstatus|voiddatetime IS NULL|holddatetime IS NULL/,
  );
  assert.match(
    screeningWardsSql,
    /AND \(@search = '' OR p\.an = @search OR p\.hn = @search OR p\.prescriptionno = @search\)/,
  );
  for (const text of [screeningHeadersSql, screeningItemsSql]) {
    assert.doesNotMatch(text, /@mode = 'continue-finished' OR EXISTS/);
    assert.match(text, /AND \(EXISTS \(SELECT 1 FROM dbo\.ms_room/);
    assert.match(text, /room\.roomcode = @roomCode/);
    assert.match(text, /p\.fromlocationname = RTRIM\(room\.roomname\)/);
    assert.match(text, /w\.wardstatus = 'Y'/);
  }
});

test("Continue patient navigation returns to the selected pharmacy and round without using the old prescription ward as the current admission", async () => {
  const { screeningPatientPath, screeningReturnPath } = await import(
    "../../front/src/components/screening/screeningNavigation.js"
  );
  const path = screeningPatientPath(
    { an: "DEMO-AN", prescriptionno: "DEMO-CONT", currentWardCode: "2" },
    {
      mode: "continue-wait",
      roomCode: "002",
      orderdate: "2026-10-18",
      workdate: "2026-10-17",
      wardCode: "1",
      search: "DEMO-CONT",
    },
  );
  const target = new URL(path, "http://localhost");
  assert.equal(target.searchParams.get("wardCode"), "2");
  const back = new URL(
    screeningReturnPath(target.searchParams),
    "http://localhost",
  );
  assert.equal(back.pathname, "/ipd/screening");
  for (const [key, value] of Object.entries({
    mode: "continue-wait",
    roomCode: "002",
    orderdate: "2026-10-18",
    workdate: "2026-10-17",
    wardCode: "1",
    search: "DEMO-CONT",
    rx: "DEMO-CONT",
  }))
    assert.equal(back.searchParams.get(key), value);
  assert.equal(
    screeningReturnPath(new URLSearchParams("fromScreening=toString")),
    "",
  );
});

test("Screening patient navigation uses current admission ward and returns only to the known Screening route", async () => {
  const { screeningPatientPath, screeningReturnPath } = await import(
    "../../front/src/components/screening/screeningNavigation.js"
  );
  const path = screeningPatientPath(
    { an: "DEMO-AN", prescriptionno: "DEMO-RX", currentWardCode: "2" },
    {
      orderdate: "2026-10-18",
      search: "DEMO-AN",
      wardCode: "1",
      workdate: "2026-10-17",
    },
  );
  const target = new URL(path, "http://localhost");
  assert.equal(target.searchParams.get("wardCode"), "2");
  const back = new URL(
    screeningReturnPath(target.searchParams),
    "http://localhost",
  );
  assert.equal(back.pathname, "/ipd/screening");
  assert.equal(back.searchParams.get("wardCode"), "1");
  assert.equal(back.searchParams.get("rx"), "DEMO-RX");
  assert.equal(back.searchParams.get("workdate"), "2026-10-17");
  assert.equal(back.searchParams.get("search"), "DEMO-AN");
  assert.equal(screeningPatientPath({ currentWardCode: null }, {}), "");
  assert.equal(
    screeningReturnPath(
      new URLSearchParams("fromScreening=https://invalid.example"),
    ),
    "",
  );
});

test("Continue finished returns to its selected room, mode, prescription ward and pinned round", async () => {
  const { screeningPatientPath, screeningReturnPath } = await import(
    "../../front/src/components/screening/screeningNavigation.js"
  );
  const target = new URL(
    screeningPatientPath(
      { an: "DEMO-AN", prescriptionno: "DEMO-CONT-DONE", currentWardCode: "2" },
      {
        mode: "continue-finished",
        roomCode: "002",
        orderdate: "2026-10-18",
        workdate: "2026-10-17",
        wardCode: "1",
        search: "DEMO-CONT-DONE",
      },
    ),
    "http://localhost",
  );
  assert.equal(target.searchParams.get("wardCode"), "2");
  const back = new URL(
    screeningReturnPath(target.searchParams),
    "http://localhost",
  );
  assert.equal(back.pathname, "/ipd/screening");
  for (const [key, value] of Object.entries({
    mode: "continue-finished",
    roomCode: "002",
    orderdate: "2026-10-18",
    workdate: "2026-10-17",
    wardCode: "1",
    search: "DEMO-CONT-DONE",
    rx: "DEMO-CONT-DONE",
  }))
    assert.equal(back.searchParams.get(key), value);
});
