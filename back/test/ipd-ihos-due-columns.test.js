const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const format = import(
  pathToFileURL(
    path.resolve(
      __dirname,
      "../../front/src/components/Profile/ihosDueFormat.js",
    ),
  ).href
);

test("IHOS DUE shows the eight native column headers in order and omits hidden/internal fields", async () => {
  const { ihosDueColumns } = await format;
  assert.deepEqual(
    ihosDueColumns.map(([key, label]) => [key, label]),
    [
      ["datetime", "datetime"],
      ["statusText", "สถานะ"],
      ["drugname", "ชื่อยา"],
      ["confirm_inp_id", "confirm_inp_id"],
      ["confirm", "confirm"],
      ["confirm_date", "confirm_date"],
      ["confirm_note", "confirm_note"],
      ["request_note", "request_note"],
    ],
  );
  assert.equal(
    ihosDueColumns.reduce((sum, [, , width]) => sum + width, 0),
    1170,
  );
});

test("IHOS viewer matches native blank/approved/rejected labels and keeps unexpected codes blank", async () => {
  const { ihosDueText } = await format;
  assert.equal(ihosDueText({ status: "" }, "statusText"), "รออนุมัติ");
  assert.equal(ihosDueText({ status: null }, "statusText"), "รออนุมัติ");
  assert.equal(ihosDueText({ status: 1 }, "statusText"), "อนุมัติ");
  assert.equal(ihosDueText({ status: "2" }, "statusText"), "ไม่อนุมัติ");
  assert.equal(
    ihosDueText({ status: "0", statusText: "ไม่ทราบสถานะ (0)" }, "statusText"),
    "",
  );
  assert.equal(ihosDueText({ status: "other" }, "statusText"), "");
  assert.equal(
    ihosDueText({ confirm: "Do not infer this name" }, "confirm"),
    "",
  );
});

test("IHOS viewer preserves raw dates, zero and complete multiline notes without dash placeholders", async () => {
  const { ihosDueText } = await format;
  const datetime = "2025-06-01 23:30:00";
  const note = "  บรรทัดหนึ่ง\n" + "ก".repeat(500) + "\nท้ายข้อความ  ";
  assert.equal(ihosDueText({ datetime }, "datetime"), datetime);
  assert.equal(ihosDueText({ request_note: note }, "request_note"), note);
  assert.equal(ihosDueText({ confirm_inp_id: 0 }, "confirm_inp_id"), "0");
  assert.equal(ihosDueText({ confirm_note: null }, "confirm_note"), "");
  assert.equal(ihosDueText({ drugname: "" }, "drugname"), "");
});
