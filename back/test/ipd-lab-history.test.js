const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  createLabHistoryReader,
  labCalendarBounds,
} = require("../services/ipdLabHistory");

test("LAB follows native calendar 00:00 through 23:59:00, independently of the IPD round", () => {
  assert.deepEqual(labCalendarBounds("2024-02-29", "2024-03-01"), {
    start: "2024-02-29 00:00:00",
    end: "2024-03-01 23:59:00",
  });
  assert.equal(
    labCalendarBounds("9999-12-31", "9999-12-31").end,
    "9999-12-31 23:59:00",
  );
  for (const pair of [
    ["2025-02-29", "2025-03-01"],
    ["2026-10-19", "2026-10-18"],
    ["", "2026-10-18"],
    [["2026-10-18"], "2026-10-18"],
    ["1752-12-31", "1753-01-01"],
  ]) {
    assert.throws(() => labCalendarBounds(...pair), { code: "LAB_DATES" });
  }
});

test("LAB dates bind HN and both range bounds without narrowing to the current AN", async () => {
  const expected = [{ date: "2026-10-18" }, { date: "2026-10-17" }];
  const reader = createLabHistoryReader(async (query, params) => {
    assert.ok(query.sql.includes("FROM view_lab_result"));
    assert.ok(query.sql.includes("GROUP BY LEFT(l.date_result, 10)"));
    assert.ok(query.sql.includes("ORDER BY date DESC"));
    assert.deepEqual(params, [
      "synthetic-hn' OR 1=1 --",
      "2026-10-11 00:00:00",
      "2026-10-18 23:59:00",
    ]);
    assert.ok(!query.sql.includes(params[0]));
    assert.ok(!query.sql.includes("l.an"));
    return [expected];
  });
  assert.deepEqual(
    await reader.getPatientLabDates(
      { hn: "synthetic-hn' OR 1=1 --", an: "CURRENT" },
      { from: "2026-10-11", to: "2026-10-18" },
    ),
    expected,
  );
});

test("LAB results preserve textual findings, null, numeric zero, flags and multiline reports", async () => {
  const rows = [
    {
      lab_name: "Synthetic LAB A",
      result: "<5",
      type_result: "L",
      minresult: null,
      result_obj: "รายงานสมมติ\n" + "ก".repeat(500),
      remark: "ไม่แปลงเป็น HTML <script>test</script>",
    },
    {
      lab_name: "Synthetic LAB B",
      result: 0,
      type_result: "H",
      maxresult: "0.5",
      result_obj: null,
    },
    { lab_name: "Synthetic LAB C", result: null, type_result: "" },
  ];
  const reader = createLabHistoryReader(async (query, params) => {
    assert.deepEqual(params, [
      "DEMO-HN",
      "2026-10-18 00:00:00",
      "2026-10-18 23:59:00",
    ]);
    assert.match(
      query.sql,
      /CAST\(l.result_obj AS CHAR\(10000\) CHARACTER SET tis620\)/,
    );
    assert.match(query.sql, /ORDER BY l.lab_code/);
    assert.ok(!query.sql.includes("ISNULL"));
    assert.ok(!query.sql.includes("COALESCE"));
    assert.ok(query.timeout <= 10000);
    return [rows];
  });
  assert.deepEqual(
    await reader.getPatientLabResults(
      { hn: "DEMO-HN" },
      { date: "2026-10-18" },
    ),
    rows,
  );
});

test("LAB empty data, unavailable source and invalid dates are separate outcomes", async () => {
  const reader = createLabHistoryReader(async () => [[]]);
  assert.deepEqual(
    await reader.getPatientLabDates(
      { hn: "DEMO" },
      { from: "2026-10-11", to: "2026-10-18" },
    ),
    [],
  );
  const unavailable = createLabHistoryReader(async () => {
    throw Object.assign(new Error("private connection details"), {
      code: "ETIMEDOUT",
    });
  });
  await assert.rejects(
    unavailable.getPatientLabResults({ hn: "DEMO" }, { date: "2026-10-18" }),
    { code: "ETIMEDOUT" },
  );
  const invalid = createLabHistoryReader(async () =>
    assert.fail("Invalid dates must not query MySQL"),
  );
  await assert.rejects(
    invalid.getPatientLabResults({ hn: "DEMO" }, { date: "2026-02-30" }),
    { code: "LAB_DATES" },
  );
});
