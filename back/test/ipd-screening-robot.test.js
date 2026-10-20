const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const robot = require("../services/ipdScreeningRobot");
const other = require("../services/ipdScreening");
function fixture(
  headers = [
    { prescriptionno: "DEMO-ROBOT", hn: "server-hn", an: "server-an" },
  ],
  items = [
    {
      itemindex: "same-item",
      itemidentify: "packet-08",
      frequencyTime: "0800",
    },
    {
      itemindex: "same-item",
      itemidentify: "packet-12",
      frequencyTime: "1200",
    },
  ],
) {
  const calls = [];
  const module = { exports: {} };
  const pool = {
    connect: async () => {},
    request: () => {
      const params = {};
      const q = {
        input: (key, _type, value) => {
          params[key] = value;
          return q;
        },
        query: async (text) => {
          calls.push({ text, params });
          return {
            recordset:
              text === robot.robotHeadersSql
                ? headers
                : text === robot.robotItemsSql
                  ? items
                  : [
                      {
                        code: "1",
                        name: "Synthetic ward",
                        prescriptionCount: 1,
                      },
                    ],
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
const filters = {
  mode: "robot-wait",
  search: "DEMO-ROBOT",
  window: other.screeningWindow("2026-10-18", "2026-10-17"),
};

test("clicking Robot again clears an old room, search and pinned round while preserving the selected calendar date", async () => {
  const { allRobotWardsQuery } = await import(
    "../../front/src/components/screening/screeningNavigation.js"
  );
  const next = allRobotWardsQuery(
    new URLSearchParams(
      "mode=robot-wait&orderdate=2026-10-18&roomCode=001&search=DEMO&wardCode=1&rx=DEMO&workdate=2026-10-17",
    ),
  );
  assert.equal(next.get("mode"), "robot-wait");
  assert.equal(next.get("roomCode"), "all");
  assert.equal(next.get("orderdate"), "2026-10-18");
  for (const key of ["search", "wardCode", "rx", "workdate"])
    assert.equal(next.has(key), false);
});
test("Robot queries read saved packagemaster eligibility without imposing Stat, Continue or active-ward criteria", () => {
  for (const sql of Object.values(robot)) {
    assert.match(sql, /FROM dbo\.packagemaster p/);
    assert.match(sql, /@roomCode = 'all' OR EXISTS/);
    assert.ok(!/dbo\.prescription\b/.test(sql));
    for (const condition of [
      "p.locationcode = '1'",
      "p.dosage > 0",
      "p.orderqty > 0",
      "p.instructioncode NOT IN ('PAY')",
      "p.printstatus = 0",
      "p.voiddatetime IS NULL",
      "p.holddatetime IS NULL",
      "p.genOCSdatetime IS NULL",
      "room.roomcode = @roomCode",
    ])
      assert.ok(sql.includes(condition), condition);
    assert.ok(!sql.includes("ISNULL(p.instructioncode"));
    assert.ok(
      !/p\.ordertype\s*<>|p\.frequencycode.*(?:NOT )?IN|p\.genorderdatetime|prioritycode NOT LIKE/.test(
        sql,
      ),
    );
    assert.ok(!/\b(INSERT|UPDATE|DELETE|MERGE|EXEC)\b/i.test(sql));
  }
});
test("Robot repository selects independent SQL at every level, binds the selected round and preserves every stored time row", async () => {
  const { repo, calls } = fixture();
  const context = { roomCode: "002" };
  await repo.getScreeningWards(context, filters);
  assert.equal(calls[0].text, robot.robotWardsSql);
  assert.equal(calls[0].params.end, "2026-10-18 07:59:00");
  await repo.getScreeningPrescriptions(context, filters, "1");
  assert.equal(calls[1].text, robot.robotHeadersSql);
  const detail = await repo.getScreeningPrescription(
    context,
    filters,
    "1",
    "DEMO-ROBOT",
  );
  assert.deepEqual(
    detail.items.map((r) => r.itemidentify),
    ["packet-08", "packet-12"],
  );
  const last = calls.at(-1);
  assert.equal(last.text, robot.robotItemsSql);
  assert.equal(last.params.hn, "server-hn");
  assert.equal(last.params.an, "server-an");
  assert.equal(last.params.prescriptionno, "DEMO-ROBOT");
  assert.equal(last.params.wardCode, "1");
  assert.equal(last.params.end, "2026-10-18 07:59:59");
  for (const call of calls) {
    assert.equal(call.params.roomCode, "002");
    assert.equal(call.params.search, "DEMO-ROBOT");
    assert.equal(call.params.start, "2026-10-17 08:00:00");
  }
});
test("Robot detail refuses ambiguous patient identity and missing or removed packets", async () => {
  const ambiguous = fixture([
    { hn: "one", an: "one" },
    { hn: "two", an: "two" },
  ]);
  await assert.rejects(
    ambiguous.repo.getScreeningPrescription(
      { roomCode: "001" },
      filters,
      "1",
      "DEMO-ROBOT",
    ),
    { code: "SCREENING_IDENTITY" },
  );
  assert.equal(ambiguous.calls.length, 1);
  const missing = fixture([]);
  assert.equal(
    await missing.repo.getScreeningPrescription(
      { roomCode: "001" },
      filters,
      "1",
      "DEMO-ROBOT",
    ),
    null,
  );
  assert.equal(missing.calls.length, 1);
  const removed = fixture([{ hn: "one", an: "one" }], []);
  assert.equal(
    await removed.repo.getScreeningPrescription(
      { roomCode: "001" },
      filters,
      "1",
      "DEMO-ROBOT",
    ),
    null,
  );
});
test("Robot patient navigation preserves room, date, search, prescription and round when returning", async () => {
  const { screeningPatientPath, screeningReturnPath } = await import(
    "../../front/src/components/screening/screeningNavigation.js"
  );
  const target = new URL(
    screeningPatientPath(
      { an: "DEMO-AN", currentWardCode: "2", prescriptionno: "DEMO-ROBOT" },
      {
        mode: "robot-wait",
        roomCode: "002",
        orderdate: "2026-10-18",
        workdate: "2026-10-17",
        search: "DEMO-ROBOT",
        wardCode: "1",
      },
    ),
    "http://localhost",
  );
  assert.equal(target.searchParams.get("wardCode"), "2");
  const back = new URL(
    screeningReturnPath(target.searchParams),
    "http://localhost",
  );
  for (const [key, value] of Object.entries({
    mode: "robot-wait",
    roomCode: "002",
    orderdate: "2026-10-18",
    workdate: "2026-10-17",
    search: "DEMO-ROBOT",
    wardCode: "1",
    rx: "DEMO-ROBOT",
  }))
    assert.equal(back.searchParams.get(key), value);
});
