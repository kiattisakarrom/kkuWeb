const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");
const {
  medTransferWindow,
  medTransferWardsSql,
  medTransferHeadersSql,
  medTransferCartsSql,
  medTransferLookupSql,
  medTransferAllergiesSql,
  transferQuantity,
  medTransferAllergyText,
  assembleMedTransferLookup,
  createMedTransferReader,
} = require("../services/ipdMedTransfer");

test("Med Transfer uses native 08:00 rounds ending 07:59:00, including previous-day, leap and pinned rounds", () => {
  for (const [date, pin, now, workdate, end] of [
    [
      "2026-10-20",
      undefined,
      "2026-10-20T00:59:59Z",
      "2026-10-19",
      "2026-10-20 07:59:00",
    ],
    [
      "2026-10-20",
      undefined,
      "2026-10-20T01:00:00Z",
      "2026-10-20",
      "2026-10-21 07:59:00",
    ],
    [
      "2024-03-01",
      undefined,
      "2026-10-20T00:00:00Z",
      "2024-02-29",
      "2024-03-01 07:59:00",
    ],
    [
      "2026-01-01",
      undefined,
      "2026-10-20T00:00:00Z",
      "2025-12-31",
      "2026-01-01 07:59:00",
    ],
    [
      "2026-10-20",
      "2026-10-19",
      "2026-10-20T12:00:00Z",
      "2026-10-19",
      "2026-10-20 07:59:00",
    ],
  ]) {
    const result = medTransferWindow(date, pin, new Date(now));
    assert.equal(result.workdate, workdate);
    assert.equal(result.start, `${workdate} 08:00:00`);
    assert.equal(result.end, end);
  }
});

test("Med Transfer status retains native package scope, distinct ward totals and timestamp grouping without Screening/Checkout restrictions", () => {
  for (const query of [medTransferWardsSql, medTransferHeadersSql]) {
    assert.match(query, /FROM dbo\.packagemaster pm/);
    assert.match(query, /pm\.medtransferdatetime IS NULL/);
    assert.match(query, /pm\.medtransferdatetime IS NOT NULL/);
    assert.doesNotMatch(
      query,
      /genorderdatetime|checkoutdatetime|wardstatus|@room|voiddatetime|ordertype\s*(?:=|<>)/,
    );
  }
  assert.match(medTransferWardsSql, /COUNT\(DISTINCT pm\.prescriptionno\)/);
  assert.doesNotMatch(medTransferWardsSql, /JOIN/);
  assert.match(medTransferHeadersSql, /LEFT JOIN dbo\.prescription/);
  assert.match(medTransferHeadersSql, /GROUP BY[^;]*pm\.medtransferdatetime/);
  assert.match(medTransferCartsSql, /dbo\.ms_cart/);
  for (const query of [
    medTransferWardsSql,
    medTransferHeadersSql,
    medTransferLookupSql,
    medTransferAllergiesSql,
  ])
    assert.doesNotMatch(query, /\b(?:UPDATE|INSERT|DELETE|MERGE|EXEC)\b/i);
});

const saved = {
  prescriptionno: "SYN-RX",
  hn: "SYN-HN",
  an: "SYN-AN",
  patientname: " Saved name ",
  patientdob: "2000-02-29",
  wardname: " Saved ward ",
  bedcode: "Actual bed not displayed by native",
  rightnameTH: " Thai right ",
  shelfname: "A",
  orderitemcode: "SYN-D",
  orderitemname: "Saved drug",
  orderqty: "1,234.5",
  orderunitcode: "TAB",
  instructioncode: "PO",
  frequencycode: "BID",
  timecode: "0800,1800",
};
const sets = (
  flags = {},
  rows = [saved],
  carts = [{ name: "SYN-CART", wardCode: "1" }],
) => [
  carts,
  [
    {
      packageCount: rows.length,
      alreadyTransferred: 0,
      checkoutPending: 0,
      ...flags,
    },
  ],
  rows,
];
test("Med Transfer lookup keeps package rows ungrouped and source order; patient snapshot, native bed/right fallback and quantities are displayed faithfully", () => {
  const result = assembleMedTransferLookup(
    sets({}, [saved, { ...saved, orderqty: 0 }, { ...saved, orderqty: null }]),
  );
  assert.equal(result.state, "ready");
  assert.equal(result.items.length, 3);
  assert.equal(result.items[0].orderqty, 1234.5);
  assert.equal(result.items[1].orderqty, 0);
  assert.equal(result.items[2].orderqty, 0);
  assert.equal(result.patient.patientname, "Saved name");
  assert.equal(result.patient.wardname, "Saved ward");
  assert.equal(result.patient.bed, "-");
  assert.equal(result.patient.rightname, "Thai right");
  assert.equal(
    assembleMedTransferLookup(
      sets({}, [{ ...saved, rightnameTH: null, patientdob: null }]),
    ).patient.rightname,
    "-",
  );
  assert.equal(result.items[0].hn, undefined);
  assert.equal(result.items[0].orderitembarcode, undefined);
  assert.equal(transferQuantity(""), 0);
  assert.throws(() => transferQuantity("bad"), /Invalid saved/);
  assert.throws(() => transferQuantity("0x10"), /Invalid saved/);
});

test("Med Transfer read states follow native entry guards; partial/void transferred rows block preview and ambiguous/malformed data never mix patients", () => {
  assert.equal(
    assembleMedTransferLookup(sets({}, [], [])).state,
    "invalid-cart",
  );
  assert.equal(
    assembleMedTransferLookup(sets({ alreadyTransferred: 1 })).state,
    "transferred",
  );
  assert.deepEqual(
    assembleMedTransferLookup(sets({ alreadyTransferred: 1 })).items,
    [],
  );
  assert.equal(assembleMedTransferLookup(sets({}, [])).state, "notfound");
  assert.equal(
    assembleMedTransferLookup(sets({ checkoutPending: 1 })).checkoutPending,
    true,
  );
  assert.throws(
    () =>
      assembleMedTransferLookup(sets({}, [saved, { ...saved, hn: "OTHER" }])),
    /Ambiguous/,
  );
  assert.throws(
    () => assembleMedTransferLookup([[], [], []]),
    /Invalid transfer/,
  );
  assert.match(medTransferLookupSql, /pm\.voiddatetime IS NULL/);
  assert.match(
    medTransferLookupSql,
    /NOT EXISTS[^;]*completed\.medtransferdatetime IS NOT NULL/,
  );
  assert.doesNotMatch(
    medTransferLookupSql,
    /@start|@end|ordercreatedate|@wardCode/,
  );
});

test("Med Transfer ADR formatting follows NurseMain generic/group fallback and repeats without inventing clinical labels or reactions", () => {
  assert.equal(medTransferAllergyText([]), "-");
  assert.equal(
    medTransferAllergyText([
      { AllergyGroupCd: null, patadr: " Generic A " },
      { AllergyGroupCd: "", patadr: "", AllergyGroupNm: "Fallback name" },
      {
        AllergyGroupCd: "G1",
        AllergyGroupNm: "Group 1",
        patadr: "ingredient A",
      },
      {
        AllergyGroupCd: "G1",
        AllergyGroupNm: "Group 1",
        patadr: "ingredient B",
      },
      { AllergyGroupCd: "G2", AllergyGroupNm: "Group 2" },
    ]),
    "Generic A, Fallback name, Group 1, Group 2",
  );
  assert.match(medTransferAllergiesSql, /a\.hn=@hn/);
});

test("Med Transfer reader scopes ADR to resolved package HN, does no ADR read for blocked/empty lookup, and uses bound cart/rx values", async () => {
  let resultSets = sets();
  const calls = [];
  const reader = createMedTransferReader(async (text, params) => {
    calls.push({ text, params });
    return text === medTransferLookupSql
      ? { recordsets: resultSets }
      : { recordset: [{ AllergyGroupCd: null, patadr: "Synthetic generic" }] };
  });
  const data = await reader.getMedTransferPrescription("SYN-CART'", "SYN-RX");
  assert.equal(calls.length, 2);
  assert.equal(calls[0].params.cartName, "SYN-CART'");
  assert.equal(calls[1].params.hn, "SYN-HN");
  assert.equal(data.patient.allergyText, "Synthetic generic");
  resultSets = sets({ alreadyTransferred: 1 });
  await reader.getMedTransferPrescription("SYN-CART", "SYN-RX");
  assert.equal(calls.length, 3);
  resultSets = sets({}, []);
  await reader.getMedTransferPrescription("SYN-CART", "SYN-RX");
  assert.equal(calls.length, 4);
});

test("Med Transfer has the native 8/2/6 columns, pending default states and read-only prescription normalization", async () => {
  const f = await import(
    "../../front/src/components/medtransfer/medTransferFormat.js"
  );
  assert.deepEqual(
    f.medTransferItemColumns.map((c) => c[1]),
    [
      "ตำแหน่งยา",
      "รหัสยา",
      "ชื่อยา",
      "จำนวน",
      "หน่วยขาย",
      "วิธีใช้",
      "ความถี่",
      "เวลา",
    ],
  );
  assert.deepEqual(
    f.medTransferWardColumns.map((c) => c[1]),
    ["หอผู้ป่วย", "จำนวน"],
  );
  assert.deepEqual(
    f.medTransferHeaderColumns.map((c) => c[1]),
    ["ใบสั่งยา", "ประเภทใบสั่งยา", "HN", "AN", "ชื่อ - นามสกุล", "สถานะ"],
  );
  assert.equal(f.medTransferValue({ orderqty: 0 }, "orderqty"), "0");
  assert.equal(f.medTransferValue({ ordertype: null }, "ordertype"), "");
  assert.equal(
    f.medTransferValue({ medtransferdatetime: "2026-10-20" }, "_status"),
    "บรรจุยาแล้ว",
  );
  for (const text of ["SYN-RX", " AN|SYN-RX "])
    assert.equal(f.medTransferPrescription(text), "SYN-RX");
  for (const text of ["", "A|B|C", "RX' OR 1=1", "A".repeat(21)])
    assert.equal(f.medTransferPrescription(text), "");
  assert.match(
    f.medTransferLookupMessage({ state: "ready", checkoutPending: true }),
    /Checkout/,
  );
  assert.equal(
    f.medTransferLookupMessage({ state: "ready", checkoutPending: false }),
    "",
  );
});

test("Med Transfer API authenticates, validates its own status/round/cart/prescription context, separates errors from empty and rejects all writes", async (t) => {
  const calls = [];
  let fail = false;
  let state = "ready";
  const repository = {
    getMedTransferCarts: async () => [],
    getMedTransferWards: async (filters) => {
      calls.push(filters);
      if (fail)
        throw Object.assign(new Error("simulated"), { code: "ETIMEOUT" });
      return [];
    },
    getMedTransferPrescriptions: async (filters, ward) => {
      calls.push({ filters, ward });
      return [];
    },
    getMedTransferPrescription: async (cart, rx) => {
      calls.push({ cart, rx });
      if (state === "ambiguous")
        throw Object.assign(new Error("ambiguous"), {
          code: "MED_TRANSFER_AMBIGUOUS_PATIENT",
        });
      return { state, items: [], patient: null };
    },
  };
  const app = createApp({ repository, jwtSecret: "transfer-test-secret" });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const token = jwt.sign(
    {
      user: { id: "test" },
      context: { roomCode: "001" },
      access: "ipd-readonly",
      version: 2,
    },
    "transfer-test-secret",
  );
  const send = async (path, method = "GET", auth = true) => {
    const res = await fetch(
      `http://127.0.0.1:${server.address().port}/api/ipd/med-transfer${path}`,
      { method, headers: auth ? { Authorization: `Bearer ${token}` } : {} },
    );
    return { status: res.status, body: await res.json() };
  };
  assert.equal((await send("/options", "GET", false)).status, 401);
  assert.equal((await send("/options")).status, 200);
  const empty = await send("/wards?orderdate=2026-10-20&workdate=2026-10-20");
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.wards, []);
  assert.equal(empty.body.transferStatus, "pending");
  assert.equal(empty.body.window.end, "2026-10-21 07:59:00");
  assert.equal(
    (await send("/prescriptions?wardCode=7&transferStatus=transferred")).status,
    200,
  );
  assert.equal(calls.at(-1).ward, "7");
  const before = calls.length;
  for (const extra of [
    "transferStatus=all",
    "transferStatus[]=pending",
    "workdate=2026-10-17",
    "hn=OTHER",
    "search=OTHER",
    "sql=x",
    "orderdate=2026-02-30",
  ])
    assert.equal((await send(`/wards?${extra}`)).status, 400, extra);
  assert.equal((await send("/prescriptions")).status, 400);
  assert.equal(calls.length, before);
  assert.equal((await send("/wards?roomCode=002")).status, 403);
  assert.equal(
    (await send("/prescriptions/SYN-RX?cartName=SYN-CART")).status,
    200,
  );
  assert.deepEqual(calls.at(-1), { cart: "SYN-CART", rx: "SYN-RX" });
  for (const extra of [
    "",
    "cartName[]=cart",
    "cartName=cart&hn=OTHER",
    "cartName=cart&wardCode=7",
    "cartName=cart&transferStatus=pending",
  ])
    assert.equal((await send(`/prescriptions/SYN-RX?${extra}`)).status, 400);
  for (const expectedState of ["transferred", "notfound"]) {
    state = expectedState;
    const response = await send("/prescriptions/SYN-RX?cartName=SYN-CART");
    assert.equal(response.status, 200);
    assert.equal(response.body.state, expectedState);
  }
  state = "invalid-cart";
  assert.equal(
    (await send("/prescriptions/SYN-RX?cartName=SYN-CART")).status,
    400,
  );
  state = "ambiguous";
  assert.equal(
    (await send("/prescriptions/SYN-RX?cartName=SYN-CART")).status,
    409,
  );
  for (const method of ["POST", "PUT", "DELETE", "PATCH"])
    assert.equal((await send("/prescriptions/SYN-RX", method)).status, 403);
  fail = true;
  assert.equal((await send("/wards")).status, 503);
});
