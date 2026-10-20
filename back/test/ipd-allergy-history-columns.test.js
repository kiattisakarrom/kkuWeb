const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const format = import(
  pathToFileURL(
    path.resolve(
      __dirname,
      "../../front/src/components/Profile/allergyHistoryFormat.js",
    ),
  ).href
);

test("ADR history has the 14 visible native columns in order, without hidden codes or summary labels", async () => {
  const { allergyHistoryColumns } = await format;
  assert.deepEqual(allergyHistoryColumns, [
    ["createdate", "วันที่ลงข้อมูลในโปรแกรมเก่า"],
    ["typeofadr", "Type of ADR"],
    ["destination", "ข้อมูลประวัติแพ้ยา"],
    ["allergyGroup", "รายการยาที่เกิด"],
    ["startadrddatetime", "วันที่เกิด ADR (เลือกปฏิทิน)"],
    ["adversereactions", "ข้อมูลอาการไม่พึงประสงค์"],
    ["pharmacistnote", "Pharmacist note"],
    ["onsetofadr", "Onset of ADR"],
    ["unitonset", "หน่วยของ Onset"],
    ["naranjoscore", "Naranjo's score"],
    ["propability", "Propability"],
    ["policy", "Policy"],
    ["pharmacyname", "เภสัชผู้ประเมิน"],
    ["username", "ผู้บันทึกข้อมูล"],
  ]);
});

test("ADR history uses native Thai Buddhist d-MM-yyyy dates without shifting stored dates or years", async () => {
  const { allergyHistoryDate, allergyHistoryCell } = await format;
  assert.equal(allergyHistoryDate("2025-06-01T23:30:00Z"), "1-06-2568");
  assert.equal(allergyHistoryDate("2024-02-29T00:00:00Z"), "29-02-2567");
  assert.equal(allergyHistoryDate("1999-12-31"), "31-12-2542");
  assert.equal(allergyHistoryDate("2026-01-01"), "1-01-2569");
  assert.equal(allergyHistoryDate("2025-06-01 00:00:00"), "1-06-2568");
  assert.equal(allergyHistoryDate("2025-12-31 23:59:00"), "31-12-2568");
  assert.equal(allergyHistoryDate("2025-02-31 00:00:00"), "");
  for (const value of [null, undefined, "", "invalid"])
    assert.equal(allergyHistoryDate(value), "");
  assert.equal(
    allergyHistoryCell({ createdate: "2025-06-01" }, "createdate"),
    "1-06-2568",
  );
});

test("ADR history keeps raw classifications, separate onset units, score zero and complete saved text", async () => {
  const { allergyHistoryCell } = await format;
  const note = "  อาการสมมติ\n" + "ก".repeat(1000) + "\nท้ายข้อความ  ";
  const row = {
    typeofadr: "ADR Type A",
    typeLabel: "มี S/E จากยา",
    naranjoscore: 0,
    onsetofadr: 0,
    unitonset: "วัน",
    adversereactions: note,
    allergyGroup: null,
  };
  assert.equal(allergyHistoryCell(row, "typeofadr"), "ADR Type A");
  assert.equal(allergyHistoryCell(row, "naranjoscore"), "0");
  assert.equal(allergyHistoryCell(row, "onsetofadr"), "0");
  assert.equal(allergyHistoryCell(row, "unitonset"), "วัน");
  assert.equal(allergyHistoryCell(row, "adversereactions"), note);
  assert.equal(allergyHistoryCell(row, "allergyGroup"), "");
  assert.equal(allergyHistoryCell(row, "pharmacistnote"), "");
});
