const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const load = (file) =>
  import(
    pathToFileURL(
      path.resolve(__dirname, "../../front/src/components/Profile/" + file),
    ).href
  );

test("Drug Profile keeps seven native headings independently of query range length", async () => {
  const { drugProfileColumns } = await load("drugProfileFormat.js");
  assert.deepEqual(
    drugProfileColumns("2024-02-27").map(([, title]) => title),
    [
      "ลำดับ",
      "ชื่อยา",
      "เวลา",
      "27/02/2024",
      "28/02/2024",
      "29/02/2024",
      "01/03/2024",
      "02/03/2024",
      "03/03/2024",
      "04/03/2024",
    ],
  );
  assert.equal(drugProfileColumns("2025-12-30").at(-1)[1], "05/01/2026");
  const upperBound = drugProfileColumns("9999-12-30");
  assert.equal(upperBound.length, 10);
  assert.deepEqual(
    upperBound.slice(3).map(([, title]) => title),
    ["30/12/9999", "31/12/9999", "", "", "", "", ""],
  );
});

test("Drug Profile preserves duplicate and distant-day records, suppresses only consecutive names and leaves daily cells blank", async () => {
  const { drugProfileRows } = await load("drugProfileFormat.js");
  const items = [
    {
      orderitemname: "Drug A",
      frequencyTimedesc: "08:00",
      takedate: "2025-06-01",
      orderqty: 0,
      voiddatetime: "2025-06-01",
    },
    {
      orderitemname: "Drug A",
      frequencyTimedesc: "12:00",
      takedate: "2025-06-01",
      orderqty: 2,
      holddatetime: "2025-06-01",
    },
    {
      orderitemname: "Drug B",
      frequencyTimedesc: null,
      takedate: "2025-06-09",
    },
    {
      orderitemname: "Drug A",
      frequencyTimedesc: "08:00",
      takedate: "2025-06-10",
    },
    {
      orderitemname: "Drug A",
      frequencyTimedesc: "08:00",
      takedate: "2025-06-10",
    },
  ];
  const before = structuredClone(items);
  const rows = drugProfileRows(items);
  assert.equal(rows.length, 5);
  assert.deepEqual(
    rows.map((r) => r._index),
    [1, 2, 3, 4, 5],
  );
  assert.deepEqual(
    rows.map((r) => r.orderitemname),
    ["Drug A", "", "Drug B", "Drug A", ""],
  );
  assert.deepEqual(
    rows.map((r) => r.frequencyTimedesc),
    ["08:00", "12:00", "", "08:00", "08:00"],
  );
  assert.ok(rows.every((r) => Object.keys(r).length === 3));
  assert.deepEqual(items, before);
  assert.deepEqual(drugProfileRows([]), []);
});

test("Drug Profile shared dates handle leap days, year boundaries and SQL upper bound", async () => {
  const { addProfileDays, validProfileDate } = await load(
    "drugProfileDates.js",
  );
  assert.equal(addProfileDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addProfileDays("2025-12-30", 6), "2026-01-05");
  assert.equal(addProfileDays("9999-12-30", 6), "9999-12-31");
  for (const value of [
    "",
    "2025-02-29",
    "2025-13-01",
    "1752-12-31",
    "10000-01-01",
    null,
  ])
    assert.equal(validProfileDate(value), false);
});
