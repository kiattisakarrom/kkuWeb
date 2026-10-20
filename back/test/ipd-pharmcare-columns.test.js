const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const load = (file) =>
  import(
    pathToFileURL(
      path.resolve(__dirname, "../../front/src/components/Profile/" + file),
    ).href
  );

test("DRP displays all 29 saved-data columns in native order without edit controls or hidden record IDs", async () => {
  const { pharmcareResources } = await load("pharmcareFields.js");
  assert.deepEqual(
    pharmcareResources.drp.columns.map(([key, title]) => [key, title]),
    [
      ["OrderCreatedate", "Date"],
      ["Time", "Time"],
      ["ProcessCd", "Process"],
      ["No", "No"],
      ["DRP_ProblemCd", "รหัส"],
      ["problem", "DRP"],
      ["OrderItemCaseCode", "รหัสยา"],
      ["causeDrug", "DrugCause"],
      ["OrderItemDispenCode", "รหัสยา"],
      ["dispensedDrug", "DrugDispense"],
      ["ProblemOccurCd", "รหัส"],
      ["problemOccur", "เกิด"],
      ["Severity", "Severity"],
      ["Preventable", "รหัส"],
      ["preventableName", "Preventable"],
      ["CauseOfDRPCd", "รหัส"],
      ["cause", "Cause"],
      ["InterventionCd", "รหัส"],
      ["intervention", "ActionTake"],
      ["InterAcceptCd", "รหัส"],
      ["acceptance", "Acceptance"],
      ["StatusOfproblemCd", "รหัส"],
      ["problemStatus", "Outcome"],
      ["UserCreateCode", "UserID1"],
      ["recorder", "ผู้เกี่ยวข้อง"],
      ["ReporterCd", "UserID2"],
      ["reporter", "ผู้รายงาน"],
      ["PharmacistNote", "Pharmacist Note"],
      ["PlanNote", "Plan"],
    ],
  );
});

test("DUE, ME and Side Effect retain every visible saved field including Admin Date and Correct/Wrong", async () => {
  const { pharmcareResources } = await load("pharmcareFields.js");
  assert.deepEqual(
    pharmcareResources["side-effects"].columns.map(([key]) => key),
    ["sideeffectdate", "sideeffectname", "grade", "detail", "admindate"],
  );
  assert.deepEqual(
    pharmcareResources.me.columns.map(([key]) => key),
    [
      "meerrorcode",
      "meerrordatetime",
      "involvedUser",
      "eventName",
      "mecorrect",
      "mewrong",
      "errorType",
      "errorDetail",
      "levelName",
      "recorder",
    ],
  );
  assert.equal(pharmcareResources.due.fields.length, 18);
  for (const key of [
    "DurationUse",
    "NScor",
    "DrugAmount",
    "Value",
    "Usercreatename",
    "DueForm",
  ])
    assert.ok(pharmcareResources.due.columns.some(([field]) => field === key));
  for (const resource of Object.values(pharmcareResources))
    assert.deepEqual(resource.columns, resource.fields);
});

test("Pharmcare renders native blanks, zero, multiline notes and ISO DRP dates without inventing defaults", async () => {
  const { pharmcareText } = await load("pharmcareFormat.js");
  const field = ["value", "Value"];
  assert.equal(pharmcareText({ value: 0 }, field), "0");
  assert.equal(pharmcareText({ value: null }, field), "");
  assert.equal(pharmcareText({}, field), "");
  assert.equal(
    pharmcareText({ value: "  Line 1\nLine 2  " }, field),
    "Line 1\nLine 2",
  );
  assert.equal(
    pharmcareText({ value: "2025-06-01T00:00:00.000Z" }, [
      "value",
      "Date",
      "iso-date",
    ]),
    "2025-06-01",
  );
  assert.equal(
    pharmcareText({ value: "invalid" }, ["value", "Date", "iso-date"]),
    "",
  );
  assert.equal(pharmcareText({ value: "1" }, ["value", "เพศ", "sex"]), "ชาย");
  assert.equal(pharmcareText({ value: "2" }, ["value", "เพศ", "sex"]), "หญิง");
});

test("Preventable uses only saved native 0/1 codes and does not trust a stale translated label", async () => {
  const { pharmcareText } = await load("pharmcareFormat.js");
  const field = ["preventableName", "Preventable", "preventable"];
  assert.equal(pharmcareText({ Preventable: 0 }, field), "ป้องกันได้");
  assert.equal(pharmcareText({ Preventable: "1 " }, field), "ป้องกันไม่ได้");
  for (const code of [null, undefined, "", "2", "unknown"]) {
    assert.equal(
      pharmcareText(
        { Preventable: code, preventableName: "ป้องกันได้" },
        field,
      ),
      "",
    );
    assert.equal(
      pharmcareText({ Preventable: code }, [
        "Preventable",
        "รหัส",
        "preventable-code",
      ]),
      "",
    );
  }
});
