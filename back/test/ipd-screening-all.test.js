const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  screeningAllWindow,
  allWardsSql,
  allHeadersSql,
} = require("../services/ipdScreeningAll");
const fs = require("node:fs");
const vm = require("node:vm");

test("All uses the native same-day 23:59:00 cutoff or previous-day round before 08:00, including leap days and pinned rounds", () => {
  for (const [day, pin, now, start, end] of [
    [
      "2026-10-18",
      undefined,
      "2026-10-18T00:59:59Z",
      "2026-10-17 08:00:00",
      "2026-10-18 07:59:00",
    ],
    [
      "2026-10-18",
      undefined,
      "2026-10-18T01:00:00Z",
      "2026-10-18 08:00:00",
      "2026-10-18 23:59:00",
    ],
    [
      "2024-03-01",
      undefined,
      "2026-10-18T00:00:00Z",
      "2024-02-29 08:00:00",
      "2024-03-01 07:59:00",
    ],
    [
      "2026-01-01",
      undefined,
      "2026-10-18T00:00:00Z",
      "2025-12-31 08:00:00",
      "2026-01-01 07:59:00",
    ],
    [
      "2026-10-18",
      "2026-10-17",
      "2026-10-18T06:00:00Z",
      "2026-10-17 08:00:00",
      "2026-10-18 07:59:00",
    ],
    [
      "2025-06-01",
      "2025-06-01",
      "2026-10-18T00:00:00Z",
      "2025-06-01 08:00:00",
      "2025-06-01 23:59:00",
    ],
  ]) {
    const result = screeningAllWindow(day, pin, new Date(now));
    assert.equal(result.start, start);
    assert.equal(result.end, end);
    assert.equal(result.wardEnd, end);
  }
});

test("All has its own readonly SQL: active wards, independent status/type filters, literal room-code substring and optional selected ward", () => {
  for (const sql of [allWardsSql, allHeadersSql]) {
    assert.match(sql, /wardstatus = 'Y'/);
    assert.match(
      sql,
      /@screenStatus = 'pending' AND p.genorderdatetime IS NULL/,
    );
    assert.match(
      sql,
      /@screenStatus = 'screened' AND p.genorderdatetime IS NOT NULL/,
    );
    assert.match(sql, /@screenStatus = 'all'/);
    assert.match(sql, /p.ordertype = @orderTypeCode/);
    assert.match(
      sql,
      /@orderType = 'stat' AND ISNULL\(p.frequencycode, ''\) IN \('S', 'E', 'STAT'\)/,
    );
    assert.match(sql, /LIKE '%' \+ @roomPattern \+ '%' ESCAPE '~'/);
    assert.ok(
      !/p.ordertype <>|voiddatetime IS NULL|holddatetime IS NULL|prioritycode NOT LIKE|\b(INSERT|UPDATE|DELETE|MERGE|EXEC)\b/i.test(
        sql,
      ),
    );
  }
  assert.match(allHeadersSql, /@wardCode IS NULL OR p.wardcode = @wardCode/);
});

test("All repository chooses independent queries, binds filters and literal LIKE pattern, and never falls through to Stat medication details", async () => {
  const calls = [],
    module = { exports: {} };
  const fakeRows = [
    { prescriptionno: "DEMO-ALL", wardcode: "2", screenDay: null },
  ];
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
            return { recordset: fakeRows };
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
  const filters = {
    mode: "screen-all",
    search: "DEMO-ALL",
    screenStatus: "all",
    orderType: "1",
    window: screeningAllWindow("2026-10-18", "2026-10-18"),
  };
  const context = { roomCode: "A_1%[" };
  await module.exports.getScreeningWards(context, filters);
  assert.equal(calls[0].text, allWardsSql);
  await module.exports.getScreeningPrescriptions(context, filters);
  assert.equal(calls[1].text, allHeadersSql);
  assert.equal(calls[1].params.wardCode, null);
  await module.exports.getScreeningPrescriptions(context, filters, "2");
  assert.equal(calls[2].params.wardCode, "2");
  for (const c of calls) {
    assert.equal(c.params.screenStatus, "all");
    assert.equal(c.params.orderType, "1");
    assert.equal(c.params.orderTypeCode, "1");
    assert.equal(c.params.roomPattern, "A~_1~%~[");
    assert.equal(c.params.search, "DEMO-ALL");
    assert.equal(c.params.end, "2026-10-18 23:59:00");
  }
  assert.equal(
    await module.exports.getScreeningPrescription(
      context,
      filters,
      "2",
      "DEMO-ALL",
    ),
    null,
  );
  assert.equal(calls.length, 3);
  for (const orderType of ["all", "stat"]) {
    await module.exports.getScreeningPrescriptions(context, {
      ...filters,
      orderType,
    });
    // Native ordertype is numeric: never bind the words all/stat to its comparison.
    assert.equal(calls.at(-1).params.orderTypeCode, null);
  }
});

test("All patient navigation keeps status/type and all-ward selection on return; Robot removes incompatible All filters", async () => {
  const { screeningPatientPath, screeningReturnPath, allRobotWardsQuery } =
    await import("../../front/src/components/screening/screeningNavigation.js");
  const path = screeningPatientPath(
    { an: "DEMO-AN", prescriptionno: "DEMO-ALL", currentWardCode: "2" },
    {
      mode: "screen-all",
      roomCode: "002",
      orderdate: "2026-10-18",
      workdate: "2026-10-18",
      search: "",
      screenStatus: "screened",
      orderType: "stat",
    },
  );
  const params = new URL(path, "http://localhost").searchParams;
  assert.equal(params.get("wardCode"), "2");
  assert.equal(params.get("view"), "prescriptions");
  assert.equal(params.get("rxDate"), "2026-10-18");
  assert.equal(params.get("rx"), "DEMO-ALL");
  const back = new URL(screeningReturnPath(params), "http://localhost")
    .searchParams;
  for (const [key, value] of Object.entries({
    mode: "screen-all",
    roomCode: "002",
    screenStatus: "screened",
    orderType: "stat",
    rx: "DEMO-ALL",
  }))
    assert.equal(back.get(key), value);
  assert.equal(back.has("wardCode"), false);
  const robot = allRobotWardsQuery(back);
  assert.equal(robot.has("screenStatus"), false);
  assert.equal(robot.has("orderType"), false);
});
