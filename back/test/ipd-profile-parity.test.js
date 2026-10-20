const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const load = (name) =>
  import(
    pathToFileURL(
      path.resolve(__dirname, `../../front/src/components/Profile/${name}.js`),
    ).href
  );
const {
  prescriptionStatusWindow,
} = require("../services/ipdPrescriptionDisplay");
const { reconcileUnits } = require("../services/ipdReconcileUnits");

test("Medication Profile matches all 60 native headings and excludes native-hidden and extra metadata", async () => {
  const { medicationColumns } = await load("medicationProfileFormat");
  assert.deepEqual(
    medicationColumns.map(([, title]) => title),
    [
      "สถานะ",
      "",
      "group",
      "L",
      "M",
      "V",
      "C",
      "T",
      "ใบอนุมัติ",
      "DUE Online",
      "MRC",
      "Type",
      "ชื่อยา",
      "",
      "วิธีคำนวน",
      "คำนวน",
      "จำนวนที่ใช้",
      "หน่วย",
      "วิธีใช้",
      "ความถี่",
      "เวลา",
      "จำนวนจ่าย",
      "หน่วยขาย",
      "Firstdose",
      "วันที่เริ่ม",
      "วันสุดท้ายที่หยุดยา",
      "จำนวนวัน",
      "ราคาต่อหน่วย",
      "ราคารวม",
      "วิธีใช้ยา",
      "สถานะหยุดยา",
      "timecount",
      "ผู้สั่ง",
      "varymealtime",
      "voiddatetime",
      "วันที่กิน",
      "statusevent",
      "tmtcode",
      "pricetype",
      "dediluentcode",
      "dediluentstatus",
      "displaycolour",
      "varymealstatus",
      "AddUpto",
      "odddatetime",
      "วันเว้นวัน",
      "freetext3",
      "paytype",
      "firstdosestatus",
      "ordercreatedatetime",
      "firsttimecount",
      "DIDcode",
      "continuestatus",
      "holddatetime",
      "doctorcode",
      "doctorname",
      "สถานะเวลาหยุดยา",
      "เวลาเริ่ม",
      "เวลาหยุดยา",
      "วัน",
    ],
  );
  for (const hidden of [
    "highalert",
    "protocolcode",
    "protocolname",
    "orderitemcode",
    "meditemindex",
    "approvalReason",
    "orderqty",
    "_index",
  ])
    assert.ok(!medicationColumns.some(([key]) => key === hidden));
});

test("prescription history has its own 61-column grid and six-column list, distinct from Medication Profile", async () => {
  const { prescriptionColumns, prescriptionHeaderLabels, interactionColumns } =
    await load("prescriptionHistoryFormat");
  assert.deepEqual(prescriptionHeaderLabels, [
    "ใบสั่งยา",
    "Type",
    "วันที่สั่ง",
    "เวลา",
    "ผู้บันทึก",
    "สถานะการจัดยา",
  ]);
  assert.deepEqual(
    prescriptionColumns.map(([, title]) => title),
    [
      "สถานะ",
      "",
      "L",
      "M",
      "V",
      "C",
      "T",
      "ใบอนุมัติ",
      "Type",
      "ชื่อยา",
      "",
      "วิธีคำนวน",
      "คำนวน",
      "จำนวนที่ใช้",
      "หน่วย",
      "วิธีใช้",
      "ความถี่",
      "เวลา",
      "จำนวนจ่าย",
      "หน่วยขาย",
      "Firstdose",
      "วันที่เริ่ม",
      "วันสุดท้ายที่หยุดยา",
      "จำนวนวัน",
      "ราคาต่อหน่วย",
      "ราคารวม",
      "วิธีใช้ยา",
      "สถานะหยุดยา",
      "ผู้สั่ง",
      "language ",
      "highalert ",
      "shelfzone",
      "shelfname",
      "varymealtime",
      "voiddatetime",
      "วันที่กิน",
      "itemindex",
      "statusevent",
      "tmtcode",
      "ใบสั่งยา",
      "pricetype",
      "dediluentcode",
      "dediluentstatus",
      "displaycolour",
      "meditemindex",
      "varymealstatus",
      "AddUpto",
      "odddatetime",
      "คำนวนวันใช้ยา",
      "freetext3",
      "paytype",
      "firsttimecount",
      "DIDcode",
      "continuestatus",
      "holddatetime",
      "doctorcode",
      "doctorname",
      "สถานะเวลาหยุด",
      "เวลาเริ่ม",
      "เวลาหยุดยา",
      "วัน",
    ],
  );
  assert.deepEqual(
    interactionColumns.map(([, title]) => title),
    ["คู่ยา Drug Intereaction", "ผู้คีย์ยา", "screenusername"],
  );
  assert.equal(
    prescriptionColumns.filter(([, , kind]) => kind === "flag").length,
    6,
  );
});

test("prescription display preserves saved quantities, applies only native Off/name/flags and keeps native empty prescription cell", async () => {
  const { prescriptionView, prescriptionText } = await load(
    "prescriptionHistoryFormat",
  );
  const source = {
    orderitemname: "Recorded",
    orderitemENname: "Master",
    orderqty: 7,
    dosage: 0,
    varymeal: 0,
    printstatus: "1",
    sendmachine: "Y",
    sendmix: "N",
    sendchemo: "Y",
    startdate: "2026-10-20",
    enddate: "2026-10-22",
    holddatetime: "2026-10-20",
    prescriptionno: "RX",
    firsttimecount: 0,
  };
  const held = prescriptionView(source, "2026-10-20");
  assert.equal(held.orderitemnameView, "Recorded");
  assert.equal(held.orderqtyView, 7); // this native viewer only zeros Off, not Hold
  assert.equal(held.varymealView, 0);
  assert.equal(held.elapsedDays, -1);
  assert.equal(held.printView, true);
  assert.equal(held.sendmix, false);
  assert.equal(held.sendchemo, true);
  assert.equal(held.prescriptionnoView, "");
  assert.equal(held.statusevent, "EDIT");
  const off = prescriptionView(
    { ...source, voiddatetime: "2026-10-20" },
    "2026-10-20",
  );
  assert.equal(off.orderitemnameView, "[OFF] Recorded");
  assert.equal(off.orderqtyView, 0);
  assert.equal(off.printView, false);
  assert.equal(off.rowStyle.backgroundColor, "#d3d3d3");
  assert.equal(source.orderqty, 7);
  const approvedHold = prescriptionView(
    { ...source, approvalStatus: "Hold" },
    "2026-10-20",
  );
  assert.equal(approvedHold.machineView, false);
  assert.equal(approvedHold.printView, false);
  assert.equal(prescriptionText({ value: null }, ["value"]), "");
  assert.equal(prescriptionText({ value: 0 }, ["value"]), "0");
});

test("Reconcile uses native 11 history-drug columns and four history columns; recorded values differ by source", async () => {
  const {
    reconcileColumns,
    reconcileHistoryHeaders,
    reconcileView,
    reconcileDoctor,
  } = await load("medicalReconcileFormat");
  assert.deepEqual(
    reconcileColumns.map(([, title]) => title),
    [
      "สถานะ",
      "",
      "รหัสยา",
      "ชื่อยา",
      "วิธีใช้ยา",
      "จำนวนจ่าย",
      "หน่วย",
      "สถานะหยุดยา",
      "ผู้สั่ง",
      "varymealstatus",
      "firstdosestatus",
    ],
  );
  assert.deepEqual(reconcileHistoryHeaders, [
    "วันที่รับยา",
    "AN/VN",
    "สถานะ",
    "[ชื่อแพทย์]",
  ]);
  const raw = {
    orderitemname: "Recorded",
    orderitemENname: "English",
    orderqty: 0,
    recorder: "Saved user",
    firstdosestatus: "1",
    varymealstatus: "N",
  };
  assert.equal(reconcileView(raw, "OPD").orderitemnameView, "Recorded");
  assert.equal(reconcileView(raw, "MRC").recorderView, "");
  assert.equal(reconcileView(raw, "IPD").recorderView, "Saved user");
  assert.equal(reconcileView(raw, "IPD").orderitemnameView, "English");
  assert.equal(reconcileView(raw, "IPD").firstdosestatusView, "");
  assert.equal(
    reconcileView({ ...raw, voiddatetime: "2026-10-20", orderqty: 8 }, "MRC")
      .orderqtyView,
    0,
  );
  assert.equal(
    reconcileDoctor({ source: "IPD", doctorname: "Must remain hidden" }),
    "",
  );
  assert.equal(
    reconcileDoctor({ source: "OPD", doctorCode: "X", doctorname: "Doctor" }),
    "[X]Doctor",
  );
});

test("sidebar LAB uses the eight native headings and recorded flag while sidebar DRP reuses all 29 native saved fields", async () => {
  const { sidebarLabColumns } = await load("patientSidebarFormat");
  const { drpColumns } = await load("pharmcareFields");
  assert.deepEqual(
    sidebarLabColumns.map(([, title]) => title),
    [
      "date_result",
      "lab_name",
      "result",
      "",
      "unit",
      "minresult",
      "maxresult",
      "remark",
    ],
  );
  assert.equal(sidebarLabColumns[3][2], "lab-flag");
  assert.equal(drpColumns.length, 29);
  assert.ok(drpColumns.some(([key]) => key === "No"));
  assert.ok(drpColumns.some(([key]) => key === "ProblemOccurCd"));
});

test("native display dates retain calendar day, full seconds, blanks and leap boundaries", async () => {
  const { nativeDate } = await load("nativeProfileFormat");
  assert.equal(
    nativeDate("2026-10-20 00:00:00", "datetime"),
    "20/10/2026 00:00:00",
  );
  assert.equal(nativeDate("2024-02-29T23:59:59Z", "time"), "23:59:59");
  assert.equal(nativeDate("2026-10-20T08:00:00Z", "iso-date"), "2026-10-20");
  assert.equal(nativeDate(null), "");
  assert.equal(nativeDate("2025-02-29"), "");
});

test("prescription arranged-status preview uses native current-day and pre-08:00 01:00 cutoff", () => {
  assert.deepEqual(prescriptionStatusWindow(new Date("2026-01-01T00:59:59Z")), {
    start: "2025-12-31 01:00:00",
    end: "2026-01-01 07:59:00",
  });
  assert.deepEqual(prescriptionStatusWindow(new Date("2026-01-01T01:00:00Z")), {
    start: "2026-01-01 08:00:00",
    end: "2026-01-02 07:59:00",
  });
});

test("Reconcile units lookup is batched, preserves repeated records/null units, and never replaces codes or names", async () => {
  const input = [
    { orderitemcode: "A", orderunit: "old", orderitemname: "Recorded" },
    { orderitemcode: "A", orderunit: "old" },
    { orderitemcode: "B", orderunit: "fallback" },
    { orderitemcode: "C", orderunit: "old" },
  ];
  const seen = [];
  const rows = await reconcileUnits(input, async (codes) => {
    seen.push(codes);
    return [
      { code: "A", orderunit: "Master unit" },
      { code: "C", orderunit: null },
    ];
  });
  assert.deepEqual(seen, [["A", "B", "C"]]);
  assert.deepEqual(
    rows.map((row) => row.orderunit),
    ["Master unit", "Master unit", "fallback", null],
  );
  assert.equal(rows[0].orderitemname, "Recorded");
  assert.equal(input[0].orderunit, "old");
  const calls = [];
  await reconcileUnits(
    Array.from({ length: 1001 }, (_, index) => ({
      orderitemcode: String(index),
    })),
    async (codes) => {
      calls.push(codes.length);
      return [];
    },
  );
  assert.deepEqual(calls, [500, 500, 1]);
  await assert.rejects(
    reconcileUnits(input, async () => {
      throw new Error("unavailable");
    }),
    /unavailable/,
  );
});
