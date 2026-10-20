const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const spec = import(
  pathToFileURL(
    path.resolve(
      __dirname,
      "../../front/src/components/screening/screeningColumns.js",
    ),
  ).href
);
const { screeningDisplayRows } = require("../services/ipdScreeningDisplay");
const now = new Date("2026-10-19T03:00:00Z");
const item = {
  itemindex: "SYNTHETIC",
  seq: 1,
  dosage: 1,
  orderqty: 3,
  timecode: "PC",
  frequencycode: "TID",
  sendmachine: "Y",
  freetext1: "saved time",
  freetext2: "saved usage",
  orderitemcode: "FAKE",
  orderitemname: "fake medicine",
  printstatus: "0",
};
const times = [
  {
    timecode: "PC",
    timetype: "1",
    timedetailcode: "0800",
    timedetailTH: "morning",
  },
  {
    timecode: "PC",
    timetype: "1",
    timedetailcode: "1600",
    timedetailTH: "afternoon",
  },
  {
    timecode: "PC",
    timetype: "1",
    timedetailcode: "2000",
    timedetailTH: "night",
  },
];

test("all eight grids use the visible native Designer columns and original order without extra debug fields", async () => {
  const { screeningColumns: columns } = await spec;
  const common = [
    "",
    "วันที่",
    "ประเภท",
    "ใบสั่งยา",
    "HN",
    "AN",
    "ชื่อ - นามสกุล",
    "หอผู้ป่วย",
    "STS",
    "สถานะใบสั่งยา",
  ];
  for (const mode of [
    "stat-wait",
    "stat-finished",
    "continue-wait",
    "continue-finished",
  ]) {
    assert.deepEqual(
      columns(mode).headers.map((c) => c[1]),
      [...common, "ห้อง"],
    );
    assert.deepEqual(
      columns(mode).items.map((c) => c[1]),
      [
        "",
        "วันที่กินยา",
        "เวลารับประทาน",
        "รหัสยา",
        "ชื่อยา",
        "Dose",
        "QTY",
        "รหัสวิธีใช้",
        "คำอธิบายวิธีใช้",
        "ที่เก็บยา",
        "Print",
        "ห้อง",
      ],
    );
  }
  for (const mode of ["take-home-wait", "take-home-finished"]) {
    assert.deepEqual(
      columns(mode).headers.map((c) => c[1]),
      common,
    );
    assert.deepEqual(
      columns(mode).items.map((c) => c[1]),
      [
        "",
        "เวลารับประทาน",
        "รหัสยา",
        "ชื่อยา",
        "Dose",
        "QTY",
        "รหัสวิธีใช้",
        "คำอธิบายวิธีใช้",
        "STS",
        "ที่เก็บยา",
        "Print",
      ],
    );
  }
  assert.deepEqual(
    columns("robot-wait").headers.map((c) => c[1]),
    common,
  );
  assert.deepEqual(
    columns("screen-all").headers.map((c) => c[1]),
    [
      "",
      "ใบสั่งยา",
      "วันที่",
      "ประเภท",
      "HN",
      "AN",
      "ชื่อ - นามสกุล",
      "หอผู้ป่วย",
      "สถานะใบสั่งยา",
    ],
  );
  for (const mode of ["robot-wait", "screen-all"])
    assert.deepEqual(columns(mode).items, []);
  assert.deepEqual(
    columns("stat-wait").wards.map((c) => c[1]),
    ["", "หอผู้ป่วย", "จำนวน"],
  );
});

test("native STS stays empty; Robot follows genOCS presence as รอ Screen and zeros stay visible", async () => {
  const { screeningValue: value } = await spec;
  assert.equal(value({ screenDay: null }, "_status"), "รอ Screen");
  assert.equal(value({ screenDay: "2026-10-19" }, "_status"), "Screen แล้ว");
  assert.equal(value({ statuscode: "X" }, "_blank"), "");
  assert.equal(value({ orderqty: 0 }, "orderqty"), 0);
  assert.equal(value({}, "orderqty"), "");
  assert.equal(
    value({ code: "2", name: "Synthetic ward" }, "_ward"),
    "[ 2 ]Synthetic ward",
  );
});

test("manual and production rows display saved time/code/usage/quantities; Print is native preview flag", () => {
  const manual = { ...item, sendmachine: "N", orderqty: 0, dosage: 0 };
  const rows = screeningDisplayRows(
    [
      manual,
      { ...manual, configuredLocation: "cabinet", configuredLocationCode: "1" },
      { ...manual, sendmix: "Y", printstatus: "2" },
    ],
    [],
    "stat-wait",
    now,
  );
  assert.equal(rows.length, 3);
  assert.equal(rows[0].administrationText, "saved time");
  assert.equal(rows[0].displayPrint, true);
  assert.equal(rows[0].displayDose, 0);
  assert.equal(rows[0].orderqty, 0);
  assert.equal(rows[1].displayPrint, false);
  assert.equal(rows[2].locationName, "ส่งผลิด");
  assert.equal(rows[2].displayPrint, true);
  assert.equal(manual.orderqty, 0);
});

test("regular JVM display uses master times, native before-15:00 date shift and saved total QTY per row", () => {
  const rows = screeningDisplayRows([item], times, "continue-finished", now);
  assert.equal(rows.length, 3);
  assert.deepEqual(
    rows.map((r) => r.displayTimeCode),
    ["1600", "2000", "0800"],
  );
  assert.deepEqual(
    rows.map((r) => r.displayTakeDate),
    ["2026-10-19", "2026-10-19", "2026-10-20"],
  );
  assert.ok(
    rows.every(
      (r) =>
        r.orderqty === 3 &&
        r.displayDose === 1 &&
        r.locationName === "JVM" &&
        !r.displayPrint,
    ),
  );
  assert.equal(rows[0].administrationText, "[16:00] afternoon");
  assert.equal(
    screeningDisplayRows(
      [{ ...item, frequencycode: "OD" }],
      times,
      "stat-wait",
      now,
    )[0].displayTakeDate,
    "2026-10-19",
  );
  assert.equal(
    screeningDisplayRows(
      [{ ...item, frequencycode: "E24" }],
      times,
      "stat-wait",
      now,
    )[0].displayTakeDate,
    "2026-10-19",
  );
});

test("Take-home uses its separate time-only grid and no Stat/Continue next-day conversion", () => {
  for (const mode of ["take-home-wait", "take-home-finished"]) {
    const rows = screeningDisplayRows([item], times, mode, now);
    assert.deepEqual(
      rows.map((r) => r.displayTimeCode),
      ["0800", "1600", "2000"],
    );
    assert.ok(rows.every((r) => r.displayTakeDate === "2026-10-19"));
  }
});

test("PRN and time-master PRN reproduce native row count and text without sending anything", () => {
  const rows = screeningDisplayRows(
    [
      {
        ...item,
        frequencycode: "Q4PRN",
        dosage: 2,
        orderqty: 5,
        timedesc: "as needed",
      },
    ],
    [],
    "stat-wait",
    now,
  );
  assert.equal(rows.length, 4);
  assert.ok(
    rows.every(
      (r) =>
        r.displayTimeCode === "0007" &&
        r.administrationText === "[ PRN ] as needed",
    ),
  );
  const prn = screeningDisplayRows(
    [item],
    [
      {
        timecode: "PC",
        timetype: "2",
        timedetailcode: "0006",
        timedetailTH: "PRN text",
      },
    ],
    "continue-wait",
    now,
  );
  assert.equal(prn.length, 1);
  assert.equal(prn[0].administrationText, "[ PRN ] PRN text");
});

test("varying doses use saved comma-separated meal doses and only eligible cumulative quantities", () => {
  const rows = screeningDisplayRows(
    [
      {
        ...item,
        varymeal: "1,2,3",
        varymealtime: "0800,1600,2000",
        orderqty: 3,
      },
    ],
    times,
    "take-home-wait",
    now,
  );
  assert.deepEqual(
    rows.map((r) => r.displayDose),
    ["1", "2"],
  );
  assert.ok(rows.every((r) => r.orderqty === 3));
  assert.throws(
    () =>
      screeningDisplayRows(
        [{ ...item, varymeal: "1,2", varymealtime: "0800,1600" }],
        times,
        "continue-wait",
        now,
      ),
    { code: "SCREENING_DISPLAY_DATA" },
  );
});

test("Stat/Continue saved time-end sequence uses saved takedate and handles time wrap; AW enables preview Print", () => {
  const rows = screeningDisplayRows(
    [
      {
        ...item,
        statustimeend: "Y",
        takedate: "2026-10-17",
        varymealtime: "2000,0800",
        instructioncode: "AW",
      },
    ],
    times,
    "continue-wait",
    now,
  );
  assert.deepEqual(
    rows.map((r) => r.displayTakeDate),
    ["2026-10-17", "2026-10-18"],
  );
  assert.ok(rows.every((r) => r.displayPrint));
  assert.equal(
    screeningDisplayRows([item], [], "continue-wait", now).length,
    0,
  );
  assert.throws(
    () =>
      screeningDisplayRows(
        [{ ...item, statustimeend: "Y", varymealtime: "bad" }],
        times,
        "continue-wait",
        now,
      ),
    { code: "SCREENING_DISPLAY_DATA" },
  );
});
