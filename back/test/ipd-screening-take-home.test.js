const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const home = require("../services/ipdScreeningTakeHome");

test("Take-home preserves three native cutoffs before/at 08:00, old dates, leap years and pinned rounds", () => {
  for (const [day, pin, now, startDay, wardEnd, headerEnd, end] of [
    [
      "2026-10-18",
      undefined,
      "2026-10-18T00:59:59Z",
      "2026-10-17",
      "2026-10-18 07:59:00",
      "2026-10-18 07:59:00",
      "2026-10-18 07:59:59",
    ],
    [
      "2026-10-18",
      undefined,
      "2026-10-18T01:00:00Z",
      "2026-10-18",
      "2026-10-19 07:59:00",
      "2026-10-18 23:59:00",
      "2026-10-19 07:59:59",
    ],
    [
      "2024-03-01",
      undefined,
      "2026-10-18T00:59:59Z",
      "2024-02-29",
      "2024-03-01 07:59:00",
      "2024-03-01 07:59:00",
      "2024-03-01 07:59:59",
    ],
    [
      "2026-01-01",
      undefined,
      "2026-10-18T00:59:59Z",
      "2025-12-31",
      "2026-01-01 07:59:00",
      "2026-01-01 07:59:00",
      "2026-01-01 07:59:59",
    ],
    [
      "2026-10-18",
      "2026-10-17",
      "2026-10-18T05:00:00Z",
      "2026-10-17",
      "2026-10-18 07:59:00",
      "2026-10-18 07:59:00",
      "2026-10-18 07:59:59",
    ],
  ]) {
    const round = home.takeHomeWindow(day, pin, new Date(now));
    assert.equal(round.workdate, startDay);
    assert.equal(round.start, startDay + " 08:00:00");
    assert.equal(round.wardEnd, wardEnd);
    assert.equal(round.headerEnd, headerEnd);
    assert.equal(round.end, end);
  }
});

test("Take-home SQL retains stage-specific native eligibility and scopes saved medication rows without hardware generation", () => {
  for (const text of [
    home.takeHomeWardsSql,
    home.takeHomeHeadersSql,
    home.takeHomeItemsSql,
  ]) {
    assert.match(
      text,
      /@mode = 'take-home-wait' AND p.genorderdatetime IS NULL/,
    );
    assert.match(
      text,
      /@mode = 'take-home-finished' AND p.genorderdatetime IS NOT NULL/,
    );
    assert.match(text, /AND p.ordertype = '1'/);
    assert.match(
      text,
      /BETWEEN CAST\(@start AS datetime\) AND CAST\(@end AS datetime\)/,
    );
    assert.match(text, /room.roomcode = @roomCode/);
    assert.match(text, /@roomCode = 'all' OR EXISTS/);
    assert.ok(
      !/p.ordertype <>|wardcode = '31'|\b(INSERT|UPDATE|DELETE|MERGE|EXEC)\b/i.test(
        text,
      ),
    );
    assert.ok(!text.includes("holddatetime IS NULL"));
  }
  assert.match(home.takeHomeWardsSql, /COUNT\(DISTINCT p.prescriptionno\)/);
  assert.match(
    home.takeHomeWardsSql,
    /ISNULL\(p.frequencycode, ''\) NOT IN \('S', 'E', 'STAT'\)/,
  );
  assert.ok(!home.takeHomeWardsSql.includes("wardstatus"));
  assert.ok(!home.takeHomeWardsSql.includes("voiddatetime IS NULL"));
  assert.match(home.takeHomeHeadersSql, /p.wardcode = @wardCode/);
  assert.match(home.takeHomeHeadersSql, /wardstatus = 'Y'/);
  assert.ok(!home.takeHomeHeadersSql.includes("frequencycode"));
  assert.ok(!home.takeHomeHeadersSql.includes("voiddatetime IS NULL"));
  assert.match(home.takeHomeItemsSql, /NOT IN \('S', 'E', 'STAT'\)/);
  assert.match(home.takeHomeItemsSql, /p.voiddatetime IS NULL/);
  assert.match(
    home.takeHomeItemsSql,
    /p.wardcode = @wardCode AND p.prescriptionno = @prescriptionno/,
  );
  assert.match(home.takeHomeItemsSql, /p.hn = @hn AND p.an = @an/);
  assert.match(
    home.takeHomeItemsSql,
    /room.roomcode = l.roomcode AND p.fromlocationname/,
  );
});

test("entering either Take-home page resets stale room/search/selection to all rooms and keeps the calendar date", async () => {
  const { allTakeHomeWardsQuery } = await import(
    "../../front/src/components/screening/screeningNavigation.js"
  );
  for (const mode of ["take-home-wait", "take-home-finished"]) {
    const result = allTakeHomeWardsQuery(
      new URLSearchParams(
        "mode=screen-all&roomCode=001&orderdate=2026-10-18&search=DEMO&wardCode=1&rx=DEMO&workdate=2026-10-17&screenStatus=all&orderType=1",
      ),
      mode,
    );
    assert.equal(result.get("mode"), mode);
    assert.equal(result.get("roomCode"), "all");
    assert.equal(result.get("orderdate"), "2026-10-18");
    for (const key of [
      "search",
      "wardCode",
      "rx",
      "workdate",
      "screenStatus",
      "orderType",
    ])
      assert.equal(result.has(key), false);
  }
  assert.throws(() =>
    allTakeHomeWardsQuery(new URLSearchParams(), "stat-wait"),
  );
});

test("Take-home all-room requests keep ward/rx/server identity scoping and derive location from each prescription source room", async () => {
  for (const mode of ["take-home-wait", "take-home-finished"]) {
    const { repo, calls } = fixture();
    const scope = { ...filters, mode };
    await repo.getScreeningWards({ roomCode: "all" }, scope);
    await repo.getScreeningPrescriptions({ roomCode: "all" }, scope, "2");
    await repo.getScreeningPrescription(
      { roomCode: "all" },
      scope,
      "2",
      "DEMO-HOME",
    );
    for (const call of calls) assert.equal(call.params.roomCode, "all");
    const last = calls.at(-1);
    assert.equal(last.params.wardCode, "2");
    assert.equal(last.params.prescriptionno, "DEMO-HOME");
    assert.equal(last.params.hn, "server-hn");
    assert.equal(last.params.an, "server-an");
    assert.equal(last.text, home.takeHomeItemsSql);
  }
});

function fixture(
  headers = [{ prescriptionno: "DEMO-HOME", hn: "server-hn", an: "server-an" }],
  items = [
    { itemindex: "DEMO-I", dosage: 0, orderqty: 0, holddatetime: "2026-10-18" },
  ],
) {
  const calls = [],
    module = { exports: {} };
  const pool = {
    connect: async () => {},
    request: () => {
      const params = {},
        q = {
          input: (key, _type, value) => {
            params[key] = value;
            return q;
          },
          query: async (text) => {
            calls.push({ text, params });
            return {
              recordset:
                text === home.takeHomeHeadersSql
                  ? headers
                  : text === home.takeHomeItemsSql
                    ? items
                    : [{ code: "2", prescriptionCount: 1 }],
            };
          },
        };
      return q;
    },
  };
  vm.runInNewContext(
    fs.readFileSync(
      require.resolve("../repositories/ipdScreeningRepository"),
      "utf8",
    ),
    {
      module,
      require: (id) =>
        id === "../models/db"
          ? { pool, sql: { VarChar: () => null, NVarChar: () => null } }
          : require(id),
    },
  );
  return { repo: module.exports, calls };
}
const context = { roomCode: "002" },
  filters = {
    mode: "take-home-wait",
    search: "DEMO-HOME",
    window: home.takeHomeWindow("2026-10-18", "2026-10-18"),
  };

test("Take-home repository routes each stage independently, freezes the round and uses server patient identity", async () => {
  const { repo, calls } = fixture();
  await repo.getScreeningWards(context, filters);
  assert.equal(calls[0].text, home.takeHomeWardsSql);
  assert.equal(calls[0].params.end, "2026-10-19 07:59:00");
  await repo.getScreeningPrescriptions(context, filters, "2");
  assert.equal(calls[1].text, home.takeHomeHeadersSql);
  assert.equal(calls[1].params.end, "2026-10-18 23:59:00");
  const detail = await repo.getScreeningPrescription(
    context,
    filters,
    "2",
    "DEMO-HOME",
  );
  assert.equal(calls[2].text, home.takeHomeHeadersSql);
  assert.equal(calls[2].params.end, "2026-10-18 23:59:00");
  const last = calls.at(-1);
  assert.equal(last.text, home.takeHomeItemsSql);
  assert.equal(last.params.end, "2026-10-19 07:59:59");
  assert.equal(last.params.hn, "server-hn");
  assert.equal(last.params.an, "server-an");
  assert.equal(last.params.prescriptionno, "DEMO-HOME");
  assert.equal(detail.items[0].dosage, 0);
  assert.equal(detail.items[0].orderqty, 0);
  assert.ok(detail.items[0].holddatetime);
  for (const call of calls) {
    assert.equal(call.params.roomCode, "002");
    assert.equal(call.params.search, "DEMO-HOME");
    assert.equal(call.params.start, "2026-10-18 08:00:00");
  }
  for (const call of calls.slice(1)) assert.equal(call.params.wardCode, "2");
});

test("Take-home allows a valid Stat/Off-only header with no eligible drugs, refuses a missing header and rejects ambiguous patients", async () => {
  for (const mode of ["take-home-wait", "take-home-finished"]) {
    const modeFilters = { ...filters, mode };
    const empty = fixture(undefined, []);
    const result = await empty.repo.getScreeningPrescription(
      context,
      modeFilters,
      "2",
      "DEMO-HOME",
    );
    assert.equal(result.header.prescriptionno, "DEMO-HOME");
    assert.equal(result.items.length, 0);
    const missing = fixture([]);
    assert.equal(
      await missing.repo.getScreeningPrescription(
        context,
        modeFilters,
        "2",
        "DEMO-HOME",
      ),
      null,
    );
    assert.equal(missing.calls.length, 1);
    const ambiguous = fixture([
      { hn: "one", an: "one" },
      { hn: "two", an: "two" },
    ]);
    await assert.rejects(
      ambiguous.repo.getScreeningPrescription(
        context,
        modeFilters,
        "2",
        "DEMO-HOME",
      ),
      { code: "SCREENING_IDENTITY" },
    );
    assert.equal(ambiguous.calls.length, 1);
  }
});

test("Take-home finished uses its own mode at all levels and the three native windows instead of Continue/Stat cutoffs", async () => {
  for (const [pin, headerEnd, wardEnd, itemEnd] of [
    [
      "2026-10-18",
      "2026-10-18 23:59:00",
      "2026-10-19 07:59:00",
      "2026-10-19 07:59:59",
    ],
    [
      "2026-10-17",
      "2026-10-18 07:59:00",
      "2026-10-18 07:59:00",
      "2026-10-18 07:59:59",
    ],
  ]) {
    const { repo, calls } = fixture();
    const scope = {
      ...filters,
      mode: "take-home-finished",
      window: home.takeHomeWindow("2026-10-18", pin),
    };
    await repo.getScreeningWards(context, scope);
    assert.equal(calls[0].text, home.takeHomeWardsSql);
    assert.equal(calls[0].params.end, wardEnd);
    await repo.getScreeningPrescriptions(context, scope, "2");
    assert.equal(calls[1].text, home.takeHomeHeadersSql);
    assert.equal(calls[1].params.end, headerEnd);
    await repo.getScreeningPrescription(context, scope, "2", "DEMO-HOME");
    assert.equal(calls[2].text, home.takeHomeHeadersSql);
    assert.equal(calls[2].params.end, headerEnd);
    assert.equal(calls[3].text, home.takeHomeItemsSql);
    assert.equal(calls[3].params.end, itemEnd);
    assert.equal(calls[3].params.hn, "server-hn");
    assert.equal(calls[3].params.an, "server-an");
    for (const call of calls) {
      assert.equal(call.params.mode, "take-home-finished");
      assert.equal(call.params.roomCode, "002");
      assert.equal(call.params.search, "DEMO-HOME");
    }
  }
});

test("Take-home patient navigation returns to the same room/ward/date/search/prescription and round", async () => {
  const { screeningPatientPath, screeningReturnPath } = await import(
    "../../front/src/components/screening/screeningNavigation.js"
  );
  for (const mode of ["take-home-wait", "take-home-finished"]) {
    const target = new URL(
      screeningPatientPath(
        { an: "DEMO-AN", prescriptionno: "DEMO-HOME", currentWardCode: "3" },
        {
          mode,
          roomCode: "002",
          wardCode: "2",
          orderdate: "2026-10-18",
          workdate: "2026-10-17",
          search: "DEMO-HOME",
        },
      ),
      "http://localhost",
    );
    assert.equal(target.searchParams.get("wardCode"), "3");
    const back = new URL(
      screeningReturnPath(target.searchParams),
      "http://localhost",
    );
    assert.equal(back.pathname, "/ipd/screening");
    for (const [key, value] of Object.entries({
      mode,
      roomCode: "002",
      wardCode: "2",
      orderdate: "2026-10-18",
      workdate: "2026-10-17",
      search: "DEMO-HOME",
      rx: "DEMO-HOME",
    }))
      assert.equal(back.searchParams.get(key), value);
  }
});
