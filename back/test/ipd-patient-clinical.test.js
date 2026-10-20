const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  clinicalSummary,
  bangkokDate,
} = require("../services/ipdPatientClinical");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const formats = import(
  pathToFileURL(
    path.resolve(
      __dirname,
      "../../front/src/components/Profile/medicationProfileFormat.js",
    ),
  ).href
);
const now = new Date("2026-10-19T02:00:00Z");

test("patient clinical display selects a newer result per analyte and retains newer admission values including zero", () => {
  const row = {
    clinicalUpdatedAt: "2026-10-17T12:00:00Z",
    scr: 2,
    scrLabValue: "1",
    scrLabDate: "2026-10-18T12:00:00Z",
    eGFR: 0,
    eGFRLabValue: "25",
    eGFRLabDate: "2026-10-16T12:00:00Z",
    wbc: null,
    wbcLabValue: "4.5",
    wbcLabDate: "2026-10-15T12:00:00Z",
    Neutrophil: 60,
    BandformNeutrophil: 2,
    patientdob: "1986-10-19",
    sex: "1",
    weight: 72,
    height: 180,
  };
  const result = clinicalSummary(row, now);
  assert.equal(result.scr, "1");
  assert.equal(result.eGFR, 0);
  assert.equal(result.wbc, "4.5");
  assert.equal(result.ANC, 2700); // Native WBC * Neutrophil * 10, no Band term.
  assert.equal(result.bsa, 1.9);
  assert.equal(result.Crcl, 100);
  assert.equal(result.clinicalSources.scr.source, "lab");
  assert.equal(result.clinicalSources.eGFR.source, "stored");
  assert.equal(row.scr, 2);
  assert.equal(Object.hasOwn(result, "scrLabValue"), false);
});

test("native adult female / pediatric boundary and Bangkok birthday work without writing clinical values", () => {
  const base = {
    patientdob: "1986-10-19",
    sex: 2,
    weight: 72,
    height: 150,
    scr: 1,
  };
  assert.equal(clinicalSummary(base, now).Crcl, 85);
  const child = { ...base, patientdob: "2011-10-20" };
  assert.equal(clinicalSummary(child, now).Crcl, 61.95);
  assert.equal(
    clinicalSummary({ ...child, patientdob: "2011-10-19" }, now).Crcl,
    106.25,
  );
  assert.equal(bangkokDate(new Date("2026-10-18T18:00:00Z")), "2026-10-19");
});

test("missing, nonnumeric or zero creatinine never produces infinity or a fabricated ANC zero", () => {
  assert.equal(clinicalSummary(undefined), undefined);
  for (const scr of [null, "", " ", 0, "<0.5", "not numeric"]) {
    const result = clinicalSummary(
      { scr, patientdob: "1986-01-01", sex: "1", weight: 60 },
      now,
    );
    assert.equal(result.Crcl, null);
    assert.equal(result.ANC, null);
  }
  assert.equal(clinicalSummary({ wbc: 0, Neutrophil: 60 }, now).ANC, 0);
  assert.equal(clinicalSummary({ wbc: 4, Neutrophil: 0 }, now).ANC, 0);
  assert.equal(clinicalSummary({ patientdob: "bad" }, now).Crcl, null);
  assert.equal(clinicalSummary({ patientdob: "2030-01-01" }, now).Crcl, null);
});

test("Medication Profile Off/Hold display quantity and indicators do not overwrite saved quantities or first-dose status", async () => {
  const { medicationView } = await formats;
  const original = {
    orderitemname: "saved name",
    orderitemENname: "English name",
    dosage: 2,
    orderqty: 9,
    printstatus: "1",
    sendmachine: "Y",
    firstdosestatus: 1,
    varymeal: "1-2-1",
    startdate: "2026-10-18",
    enddate: "2026-10-19",
    screenPrescriptionNo: "FAKE-RX",
    voiddatetime: "2026-10-19",
    holddatetime: "2026-10-18",
  };
  const row = medicationView(original, "2026-10-18", null, "2026-10-20");
  assert.equal(row.orderitemnameView, "[OFF] English name");
  assert.equal(row.orderqtyView, 0);
  assert.equal(row.orderqty, 9);
  assert.equal(row.firstdosestatus, 1);
  assert.equal(row.varymealView, "1-2-1");
  assert.equal(row.printView, false);
  assert.equal(row.machineView, false);
  assert.equal(row.elapsedDays, 2);
  assert.equal(row.rowStyle.backgroundColor, "#d3d3d3");
  assert.equal(original.orderqty, 9);
});

test("native color priority, local approval and online rejection use distinct statuses", async () => {
  const {
    medicationView,
    medicationCellStyle,
    latestDueByDrug,
    drugNameColor,
  } = await formats;
  const base = {
    orderitemname: "test",
    printstatus: "1",
    startdate: "2026-10-18",
    orderqty: 0,
  };
  assert.equal(
    medicationView(base, "2026-10-17", null, "2026-10-19").rowStyle
      .backgroundColor,
    "#afeeee",
  );
  assert.equal(
    medicationView(base, "2026-10-18", null, "2026-10-19").rowStyle
      .backgroundColor,
    "#ffff80",
  );
  assert.equal(
    medicationView(
      { ...base, screenPrescriptionNo: "RX" },
      "2026-10-18",
      null,
      "2026-10-19",
    ).rowStyle.backgroundColor,
    "#b7ffbc",
  );
  const hold = medicationView(
    { ...base, approvalStatus: "Hold" },
    "2026-10-18",
    null,
    "2026-10-19",
  );
  assert.equal(hold.printView, false);
  assert.equal(hold.rowStyle.backgroundColor, "#ffffff");
  assert.equal(
    medicationCellStyle(hold, "approvalText").backgroundColor,
    "#ff0000",
  );
  const map = latestDueByDrug([
    { drugcode: "A", status: "1", confirm_date: "2026-10-17" },
    { drugcode: "B", status: "", confirm_date: "" },
    { drugcode: "A", status: "2", confirm_date: "2026-10-18" },
  ]);
  assert.equal(map.get("A").status, "2");
  assert.equal(
    medicationCellStyle({ onlineStatus: "2" }, "onlineText").backgroundColor,
    "#ff0000",
  );
  assert.equal(
    medicationCellStyle({ onlineStatus: "" }, "onlineText").backgroundColor,
    "#ffff00",
  );
  assert.equal(drugNameColor("255,255,0,0"), "rgba(255, 0, 0, 1)");
  assert.equal(drugNameColor("0,1,2,3"), "rgba(1, 2, 3, 0)");
  for (const color of ["url(x)", "255,999,0,0", "255,-1,0,0", null])
    assert.equal(drugNameColor(color), undefined);
});
