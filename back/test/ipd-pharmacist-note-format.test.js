const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const format = import(
  pathToFileURL(
    path.resolve(
      __dirname,
      "../../front/src/components/Profile/pharmacistNoteFormat.js",
    ),
  ).href
);

test("Note displays the four native headers and formats last-update day without time or timezone shift", async () => {
  const { pharmacistNoteColumns, pharmacistNoteDate } = await format;
  assert.deepEqual(pharmacistNoteColumns, [
    "วันที่บันทึก",
    "ปัญหา",
    "เพิ่มเติม",
    "บันทึกโดย",
  ]);
  assert.equal(pharmacistNoteDate("2025-12-31T23:30:00.000Z"), "31-12-2025");
  assert.equal(pharmacistNoteDate("2024-02-29T00:01:00.000Z"), "29-02-2024");
  for (const value of [null, undefined, "", "bad-date"])
    assert.equal(pharmacistNoteDate(value), "");
});

test("Note preserves full saved text, spaces, multiple lines and blank values", async () => {
  const { pharmacistNoteText } = await format;
  const longText = "  ปัญหาสมมติ\r\n" + "ก".repeat(300) + "\nท้ายบันทึก  ";
  assert.equal(pharmacistNoteText(longText), longText);
  assert.equal(pharmacistNoteText(0), "0");
  assert.equal(pharmacistNoteText(null), "");
  assert.equal(pharmacistNoteText(undefined), "");
  assert.equal(pharmacistNoteText(""), "");
});
