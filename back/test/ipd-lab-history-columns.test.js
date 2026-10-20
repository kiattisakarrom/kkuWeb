const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const format = import(
  pathToFileURL(
    path.resolve(
      __dirname,
      "../../front/src/components/Profile/labHistoryFormat.js",
    ),
  ).href
);

test("LAB history shows the 11 visible native columns in order without hidden metadata", async () => {
  const { labHistoryColumns } = await format;
  assert.deepEqual(
    labHistoryColumns.map(([key, label]) => [key, label]),
    [
      ["lab_name", "lab_name"],
      ["result", "ผล"],
      ["type_result", ""],
      ["unit", "unit"],
      ["minresult", "minresult"],
      ["maxresult", "maxresult"],
      ["date_res", "date_res"],
      ["time_res", "time_res"],
      ["remark", "remark"],
      ["result_obj", "result_obj"],
      ["name", "ชื่อ"],
    ],
  );
  assert.equal(
    labHistoryColumns.reduce((total, [, , width]) => total + width, 0),
    1300,
  );
});

test("LAB native H/L indicator uses only the saved flag without deriving it from the result", async () => {
  const { labHistoryFlag } = await format;
  assert.equal(labHistoryFlag("H"), "H");
  assert.equal(labHistoryFlag("L"), "L");
  for (const value of [null, undefined, "", "N", "h", " H ", 0])
    assert.equal(labHistoryFlag(value), "");
});

test("LAB preserves exact numeric text, zero, date strings and multiline reports; null stays blank", async () => {
  const { labHistoryText } = await format;
  for (const value of [
    "<5",
    ">100",
    "001.230",
    "9007199254740993",
    "2025-06-01",
    "08:30:00",
  ])
    assert.equal(labHistoryText(value), value);
  const report = "  รายงานสมมติ\n" + "ก".repeat(1000) + "\nท้ายรายงาน  ";
  assert.equal(labHistoryText(report), report);
  assert.equal(labHistoryText(0), "0");
  assert.equal(labHistoryText(null), "");
  assert.equal(labHistoryText(undefined), "");
});
