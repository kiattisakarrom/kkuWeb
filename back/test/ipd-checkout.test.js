const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");
const {
  checkoutWindow,
  checkoutWardsSql,
  checkoutHeadersSql,
  checkoutDetailSql,
  checkoutHeaderKey,
  assembleCheckoutDetail,
  createCheckoutReader,
} = require("../services/ipdCheckout");
const { readCheckoutImages } = require("../services/ipdCheckoutImages");

test("Checkout has the native 08:00 full round but opens details on the selected calendar day", () => {
  for (const [day, pin, now, workdate] of [
    ["2026-10-20", undefined, "2026-10-20T00:59:59Z", "2026-10-19"],
    ["2026-10-20", undefined, "2026-10-20T01:00:00Z", "2026-10-20"],
    ["2024-03-01", undefined, "2026-10-20T00:00:00Z", "2024-02-29"],
    ["2026-01-01", undefined, "2026-10-20T00:00:00Z", "2025-12-31"],
    ["2026-10-20", "2026-10-19", "2026-10-20T10:00:00Z", "2026-10-19"],
  ]) {
    const r = checkoutWindow(day, pin, new Date(now));
    assert.equal(r.workdate, workdate);
    assert.equal(r.start, `${workdate} 08:00:00`);
    assert.match(r.end, / 07:59:59$/);
    assert.equal(r.detailStart, `${day} 00:00:00`);
    assert.equal(r.detailEnd, `${day} 23:59:59`);
  }
});

test("Checkout SQL uses package history, exact AN and saved statuses without pharmacy/active-ward restrictions or writes", () => {
  for (const query of [checkoutWardsSql, checkoutHeadersSql]) {
    assert.match(query, /dbo\.packagemaster/);
    assert.match(query, /m\.ordertype <> '1'/);
    assert.match(query, /p\.genorderdatetime IS NOT NULL/);
    assert.match(query, /m\.an = @search/);
    assert.match(query, /m\.checkoutdatetime IS NULL/);
    assert.match(query, /m\.checkoutdatetime IS NOT NULL/);
    assert.doesNotMatch(query, /wardstatus|@room|ms_room|LIKE.*@search/);
  }
  assert.match(checkoutWardsSql, /COUNT\(DISTINCT m\.prescriptionno\)/);
  assert.match(checkoutHeadersSql, /m\.checkoutuserid/);
  assert.match(checkoutDetailSql, /m\.hn=@hn AND m\.an=@an/);
  assert.match(checkoutDetailSql, /m\.varymeal AS dosage/);
  assert.match(checkoutDetailSql, /pr\.sendmix='N'/);
  assert.doesNotMatch(
    checkoutDetailSql,
    /\b(?:UPDATE|INSERT|DELETE|MERGE|EXEC)\b/i,
  );
});

const row = {
  prescriptionno: "RX-1",
  hn: "SYN-HN",
  an: "SYN-AN",
  wardcode: "7",
  wardname: "SYN-WARD",
  patientname: "SYN-PATIENT",
  bedcode: "1",
  ordertype: "0",
  checkoutuserid: null,
};
const filters = {
  orderdate: "2026-10-20",
  search: "",
  checkoutStatus: "all",
  window: checkoutWindow("2026-10-20", "2026-10-20"),
};
test("Checkout resolves the selected grouped header server side, including mixed completion, before reading patient data", async () => {
  const calls = [];
  const finished = { ...row, checkoutuserid: "SYN-USER" };
  const reader = createCheckoutReader(async (text, params) => {
    calls.push({ text, params });
    return text === checkoutHeadersSql
      ? { recordset: [row, finished] }
      : {
          recordsets: [
            [],
            [],
            [],
            [{ hn: row.hn, an: row.an }],
            [],
            [],
            [],
            [],
          ],
        };
  });
  const headers = await reader.getCheckoutPrescriptions(filters, "7");
  assert.notEqual(headers[0].key, headers[1].key);
  assert.equal(
    await reader.getCheckoutDetail(
      filters,
      "7",
      "RX-1",
      checkoutHeaderKey({ ...row, hn: "OTHER" }),
    ),
    null,
  );
  assert.equal(calls.length, 2);
  const result = await reader.getCheckoutDetail(
    filters,
    "7",
    "RX-1",
    headers[1].key,
  );
  assert.equal(result.completed, true);
  assert.equal(calls.at(-1).params.hn, "SYN-HN");
  assert.equal(calls.at(-1).params.an, "SYN-AN");
  assert.equal(calls.at(-1).params.completed, true);
  assert.equal(
    (await reader.getCheckoutDetail(filters, "7", "RX-1", headers[0].key))
      .completed,
    false,
  );
});

test("Checkout omits only zero-quantity unmixed manual injections and keeps nulls, Stat, JVM, Off/Hold and duplicate grouped rows", () => {
  const samples = [
    { category: "manual", numericOrderqty: 0, isUnmixedInjection: 1 },
    { category: "manual", numericOrderqty: 0, isUnmixedInjection: 0 },
    { category: "manual", numericOrderqty: 1, isUnmixedInjection: 1 },
    { category: "stat", numericOrderqty: 0, isUnmixedInjection: 1 },
    {
      category: "jvm",
      numericOrderqty: 0,
      isUnmixedInjection: 1,
      voiddatetime: "saved",
    },
    {
      category: "jvm",
      numericOrderqty: 0,
      isUnmixedInjection: 1,
      holddatetime: "saved",
    },
  ];
  const result = assembleCheckoutDetail([
    samples,
    [],
    [],
    [],
    [],
    [{ kind: "LED" }],
    [{ kind: "HAD" }],
    [],
  ]);
  assert.deepEqual(result.items, samples.slice(1));
  assert.equal(result.patient, null);
  assert.equal(result.preparers.length, 2);
  assert.throws(() => assembleCheckoutDetail([[]]), /Invalid checkout/);
});

test("Checkout image reader follows JPG, dose PNG and fallback precedence with case-insensitive filenames; paths cannot escape the configured folder", async (t) => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "checkout-image-test-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, "DRUG.JPG"), "jpg");
  await fs.writeFile(path.join(directory, "DRUG_000_012.png"), "half");
  await fs.writeFile(path.join(directory, "OTHER_000_014.PNG"), "quarter");
  await fs.writeFile(path.join(directory, "no_picture.png"), "fallback");
  const result = await readCheckoutImages(
    [
      { orderitemcode: "DRUG" },
      { orderitemcode: "OTHER" },
      { orderitemcode: "MISSING" },
      { orderitemcode: "../outside" },
    ],
    [
      { orderitemcode: "DRUG", dosage: 0.5 },
      { orderitemcode: "OTHER", dosage: 0.25 },
    ],
    directory,
  );
  assert.match(result.sources[result.byDrug.DRUG["0.5"]], /anBn$/);
  assert.match(result.sources[result.byDrug.OTHER["0.25"]], /cXVhcnRlcg==$/);
  assert.equal(result.byDrug.MISSING[""], result.byDrug.OTHER[""]);
  assert.equal(result.byDrug["../outside"], undefined);
  assert.equal(Object.keys(result.sources).length, 3);
});

test("Checkout missing configured image folder uses bundled pictures and stays readable when both locations are unavailable", async (t) => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "checkout-missing-image-test-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const items = [{ orderitemcode: "SYNTHETIC-MISSING-DRUG" }];
  const actual = await readCheckoutImages(
    items,
    [],
    path.join(directory, "unavailable"),
  );
  const fallback = await fs.readFile(
    path.join(__dirname, "../assets/checkout-drugs/no_picture.png"),
  );
  assert.equal(
    actual.sources[actual.byDrug["SYNTHETIC-MISSING-DRUG"][""]],
    `data:image/png;base64,${fallback.toString("base64")}`,
  );
  assert.deepEqual(
    await readCheckoutImages(
      items,
      [],
      path.join(directory, "missing-primary"),
      path.join(directory, "missing-fallback"),
    ),
    { byDrug: {}, sources: {} },
  );
});

test("Checkout readable Windows folder keeps its own drug images and uses a single bundled fallback when its no_picture file is missing", async (t) => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "checkout-partial-image-test-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, "SYN-DRUG.JPG"), "primary-picture");
  const actual = await readCheckoutImages(
    [
      { orderitemcode: "SYN-DRUG" },
      { orderitemcode: "SYN-MISSING-1" },
      { orderitemcode: "SYN-MISSING-2" },
    ],
    [{ orderitemcode: "SYN-MISSING-1", dosage: 0.5 }],
    directory,
  );
  assert.equal(
    actual.sources[actual.byDrug["SYN-DRUG"][""]],
    `data:image/jpeg;base64,${Buffer.from("primary-picture").toString("base64")}`,
  );
  assert.match(
    actual.sources[actual.byDrug["SYN-MISSING-1"][""]],
    /^data:image\/png;base64,/,
  );
  assert.equal(
    actual.byDrug["SYN-MISSING-1"][""],
    actual.byDrug["SYN-MISSING-2"][""],
  );
  assert.equal(
    actual.byDrug["SYN-MISSING-1"]["0.5"],
    actual.byDrug["SYN-MISSING-2"][""],
  );
  assert.equal(Object.keys(actual.sources).length, 2);
});

test("Checkout frontend columns and per-dose matching keep the native visible form and avoid cross-date/cross-item packet matches", async () => {
  const f = await import(
    "../../front/src/components/checkout/checkoutFormat.js"
  );
  assert.equal(
    f.checkoutImageSource(
      {
        byDrug: { D: { 0.5: "half", "": "base" } },
        sources: { half: "half-image", base: "base-image" },
      },
      { orderitemcode: "D" },
      { dosage: 0.5 },
    ),
    "half-image",
  );
  assert.equal(
    f.checkoutImageSource(
      { byDrug: { D: { "": "base" } }, sources: { base: "base-image" } },
      { orderitemcode: "D" },
      { dosage: 0.25 },
    ),
    "base-image",
  );
  assert.deepEqual(
    f.checkoutWardColumns.map((c) => c[1]),
    ["", "หอผู้ป่วย", "จำนวน"],
  );
  assert.deepEqual(
    f.checkoutHeaderColumns.map((c) => c[1]),
    ["", "ใบสั่งยา", "ordertype", "HN", "AN", "ชื่อ - นามสกุล", "สถานะ"],
  );
  assert.deepEqual(
    f.checkoutJvmColumns.map((c) => c[1]),
    ["ประเภท", "ชื่อยา"],
  );
  assert.deepEqual(
    f.checkoutManualColumns.map((c) => c[1]),
    ["รูปภาพ", "ประเภท", "ชื่อยา", "จำนวนรวม"],
  );
  const item = {
    itemindex: "I1",
    orderitemcode: "D",
    frequencycode: "BID",
    timecode: "T",
    prescriptionno: "12345678901",
    orderitemname: "Saved name",
    dosage: 0,
    freetext1: "short",
    freetext2: "long",
  };
  const time = {
    frequencyTime: "08:00",
    frequencyTimedesc: "morning",
    takeDay: "2026-10-20",
  };
  const correct = { ...time, ...item, dosage: 0.5 };
  assert.equal(
    f.checkoutPacket(item, time, [
      { ...correct, itemindex: "OTHER" },
      { ...correct, takeDay: "2026-10-21" },
      correct,
    ]),
    correct,
  );
  assert.equal(
    f.checkoutPacket(item, { ...time, frequencyTimedesc: "different" }, [
      correct,
    ]),
    undefined,
  );
  assert.match(f.checkoutDrugText(item), /Saved name\n 0  BID T\nlong$/);
  assert.match(
    f.checkoutDrugText({ ...item, prescriptionno: "SHORT" }),
    /short$/,
  );
  assert.equal(
    f.checkoutStatusText({ checkoutdatetime: "saved", checkoutuserid: "" }),
    "รอ Checkout",
  );
  assert.equal(
    f.checkoutStatusText({ checkoutuserid: "USER" }),
    "Checkout แล้ว",
  );
  assert.equal(
    f.checkoutRowStyle({ category: "manual", printstatus: 0 }, true, 0)
      .backgroundColor,
    "#d3d3d3",
  );
});

test("Checkout protected API defaults and validated filters propagate, failed reads stay errors, and all mutations are forbidden", async (t) => {
  const calls = [];
  let fail = false;
  const repository = {
    getCheckoutWards: async (f) => {
      calls.push(f);
      if (fail) throw Object.assign(new Error("timeout"), { code: "ETIMEOUT" });
      return [];
    },
    getCheckoutPrescriptions: async (f, w) => {
      calls.push({ f, w });
      return [{ ...row, key: checkoutHeaderKey(row) }];
    },
    getCheckoutDetail: async (f, w, rx, key) => {
      calls.push({ f, w, rx, key });
      return key === "missing" ? null : { header: row, items: [] };
    },
  };
  const app = createApp({ repository, jwtSecret: "checkout-test-secret" });
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
    "checkout-test-secret",
  );
  const send = async (url, options = {}) => {
    const res = await fetch(
      `http://127.0.0.1:${server.address().port}/api/ipd/checkout${url}`,
      {
        headers: options.noAuth ? {} : { Authorization: `Bearer ${token}` },
        method: options.method || "GET",
      },
    );
    return { status: res.status, body: await res.json() };
  };
  assert.equal((await send("/wards", { noAuth: true })).status, 401);
  const empty = await send("/wards?orderdate=2026-10-20&workdate=2026-10-20");
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.wards, []);
  assert.equal(calls.at(-1).checkoutStatus, "pending");
  for (const status of ["pending", "finished", "all"])
    assert.equal(
      (
        await send(
          `/prescriptions?orderdate=2026-10-20&wardCode=7&checkoutStatus=${status}`,
        )
      ).status,
      200,
    );
  const before = calls.length;
  for (const suffix of [
    "checkoutStatus=bad",
    "checkoutStatus[]=all",
    "orderdate=2026-02-30",
    "workdate=2026-10-18",
    "hn=other",
    "completed=1",
    "sql=x",
    "search[]=x",
  ])
    assert.equal(
      (await send(`/wards?orderdate=2026-10-20&${suffix}`)).status,
      400,
      suffix,
    );
  assert.equal((await send("/prescriptions")).status, 400);
  assert.equal(calls.length, before);
  assert.equal((await send("/wards?roomCode=002")).status, 403);
  assert.equal(
    (await send("/prescriptions/RX-1?wardCode=7&headerKey=valid_key")).status,
    200,
  );
  assert.equal(calls.at(-1).key, "valid_key");
  assert.equal(
    (await send("/prescriptions/RX-1?wardCode=7&headerKey=missing")).status,
    404,
  );
  for (const method of ["POST", "PUT", "DELETE", "PATCH"])
    assert.equal((await send("/prescriptions/RX-1", { method })).status, 403);
  fail = true;
  assert.equal((await send("/wards")).status, 503);
});
