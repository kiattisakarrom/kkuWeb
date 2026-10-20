const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const load = (name) =>
  import(
    pathToFileURL(
      path.resolve(
        __dirname,
        `../../front/src/components/quickorder/${name}.js`,
      ),
    ).href
  );

test("ER Quick Order matches the three native grids and hides native rd1/bed/technical columns", async () => {
  const {
    quickOrderColumns,
    quickOrderWardColumns,
    quickOrderPreviewColumns,
    quickOrderTypes,
    quickOrderStatuses,
  } = await load("quickOrderFormat");
  assert.deepEqual(
    quickOrderColumns.map(([, title]) => title),
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
  assert.deepEqual(quickOrderWardColumns, ["", "หอผู้ป่วย", "จำนวน"]);
  assert.deepEqual(quickOrderPreviewColumns, ["เลขที่ใบสั่งยา", "ลบ"]);
  assert.deepEqual(
    quickOrderTypes.map(([code]) => code),
    ["all", "0", "3", "stat"],
  );
  assert.deepEqual(
    quickOrderStatuses.map(([code]) => code),
    ["all", "pending", "screened"],
  );
  assert.ok(
    !quickOrderColumns.some(([key]) =>
      ["bedcode", "screenDay", "itemindex", "fromlocationname"].includes(key),
    ),
  );
});

test("Quick Order shows native header day/status, retains zero and blank without adding STS", async () => {
  const { quickOrderValue } = await load("quickOrderFormat");
  assert.equal(
    quickOrderValue({ orderDay: "2026-10-20" }, "orderDay"),
    "20/10/2026",
  );
  assert.equal(quickOrderValue({ screenDay: null }, "_status"), "รอ Screen");
  assert.equal(
    quickOrderValue({ screenDay: "2026-10-20" }, "_status"),
    "Screen แล้ว",
  );
  assert.equal(quickOrderValue({ ordertype: 0 }, "ordertype"), "0");
  assert.equal(quickOrderValue({ patientname: null }, "patientname"), "");
});

test("Quick Order initial all wards differs from explicitly unchecking all; multi-ward selection preserves every grouped header", async () => {
  const { quickOrderVisibleRows } = await load("quickOrderFormat");
  const rows = [
    { wardcode: "1", prescriptionno: "RX-A" },
    { wardcode: "2", prescriptionno: "RX-B" },
    { wardcode: "2", prescriptionno: "RX-B", screenDay: "2026-10-20" },
    { wardcode: "3", prescriptionno: "RX-C" },
  ];
  assert.equal(quickOrderVisibleRows(rows, null), rows);
  assert.deepEqual(quickOrderVisibleRows(rows, []), []);
  assert.deepEqual(quickOrderVisibleRows(rows, ["2"]), rows.slice(1, 3));
  assert.deepEqual(quickOrderVisibleRows(rows, ["1", "3"]), [rows[0], rows[3]]);
  assert.deepEqual(quickOrderVisibleRows(rows, ["unknown"]), []);
});

test("Quick Order preview preserves repeated native basket IDs in order and never turns them into a business action", async () => {
  const { quickOrderPreview } = await load("quickOrderNavigation");
  assert.deepEqual(
    quickOrderPreview(
      new URLSearchParams(
        "previewRx=RX-A&previewRx=RX-A&previewRx=RX-B&previewRx=bad%27code",
      ),
    ),
    ["RX-A", "RX-A", "RX-B"],
  );
  assert.deepEqual(quickOrderPreview(new URLSearchParams()), []);
});

test("Quick Order opens selected patient prescription and returns room/date/round/multiple wards/preview/filters to its own page", async () => {
  const { quickOrderPatientPath, quickOrderReturnPath } = await load(
    "quickOrderNavigation",
  );
  const query = new URLSearchParams(
    "wardSelection=selected&selectedWard=1&selectedWard=2&previewRx=RX-A&previewRx=RX-A&previewRx=RX-B",
  );
  const pathToPatient = quickOrderPatientPath(
    { an: "AN A", currentWardCode: "5", prescriptionno: "RX-A" },
    query,
    {
      orderdate: "2026-01-01",
      roomCode: "004",
      screenStatus: "all",
      orderType: "stat",
      workdate: "2025-12-31",
    },
  );
  const url = new URL(pathToPatient, "http://local.test");
  assert.equal(url.pathname, "/ipd/patients/AN%20A");
  assert.equal(url.searchParams.get("wardCode"), "5");
  assert.equal(url.searchParams.get("view"), "prescriptions");
  assert.equal(url.searchParams.get("rxDate"), "2025-12-31");
  assert.equal(url.searchParams.get("rx"), "RX-A");
  const back = new URL(
    quickOrderReturnPath(url.searchParams),
    "http://local.test",
  );
  assert.equal(back.pathname, "/ipd/quick-order");
  for (const [key, value] of Object.entries({
    roomCode: "004",
    orderdate: "2026-01-01",
    workdate: "2025-12-31",
    screenStatus: "all",
    orderType: "stat",
    wardSelection: "selected",
    rx: "RX-A",
  }))
    assert.equal(back.searchParams.get(key), value);
  assert.deepEqual(back.searchParams.getAll("selectedWard"), ["1", "2"]);
  assert.deepEqual(back.searchParams.getAll("previewRx"), [
    "RX-A",
    "RX-A",
    "RX-B",
  ]);
});

test("Quick Order cannot open a patient without a current ward or invalid prescription and only constructs internal return routes", async () => {
  const { quickOrderPatientPath, quickOrderReturnPath, quickOrderReturnQuery } =
    await load("quickOrderNavigation");
  assert.equal(
    quickOrderPatientPath(
      { an: "A", prescriptionno: "RX-A" },
      new URLSearchParams(),
      {},
    ),
    "",
  );
  assert.equal(
    quickOrderPatientPath(
      { an: "A", currentWardCode: "1", prescriptionno: "bad'code" },
      new URLSearchParams(),
      {},
    ),
    "",
  );
  assert.equal(
    quickOrderReturnPath(new URLSearchParams("fromScreening=screen-all")),
    "",
  );
  const query = new URLSearchParams({
    fromQuickOrder: "1",
    quickReturn: "https://outside.test/collect?token=secret",
  });
  assert.equal(quickOrderReturnPath(query), "/ipd/quick-order?");
  assert.equal(
    quickOrderReturnQuery(
      new URLSearchParams(
        "roomCode=004&token=secret&hn=spoofed&url=https://outside.test",
      ),
    ).toString(),
    "roomCode=004",
  );
});
