const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { PDFDocument } = require("pdf-lib");
const { createApp } = require("../app");
const { filtersFor } = require("../routes/reportAdrRoutes");
const {
  medicationsSql,
  historySql,
  allergiesSql,
  medicationItems,
  allergyText,
  createAdrReportReader,
} = require("../services/reportAdr");
const {
  createAdrPdf,
  createAdrHistoryPdf,
  historyColumns,
  age,
} = require("../services/reportAdrPdf");

const saved = {
  meditemindex: "SYN-M1",
  hn: "SYN-HN",
  an: "SYN-AN",
  patientnameTH: "ผู้ป่วยทดสอบ",
  patientdob: "1980-02-29",
  prioritycode: "C",
  orderitemcode: "D1",
  orderitemname: "ยาทดสอบ",
  dosage: 1,
  orderqty: 10,
  startdate: "2026-10-01",
  enddate: null,
  sex: "1",
  id_card: "0000000000000",
  address: "1",
  moo: "2",
  tambol: "ทดสอบ",
  amp: "-",
  provname: "ทดสอบ",
  InstructionNameTH: "รับประทาน",
  DispensedUnitTH: "เม็ด",
  frequency_nameTH: "วันละครั้ง",
  timeTH: "หลังอาหาร",
};
const filters = {
  an: "SYN-AN",
  useDate: 0,
  from: "1753-01-01",
  to: "1753-01-01",
};

test("ADR report queries retain native C/O profile rows including Off/end dates, joined ingredients, codes and order; SQL is parameterized and read only", () => {
  for (const query of [medicationsSql, historySql, allergiesSql]) {
    assert.doesNotMatch(query, /\b(INSERT|UPDATE|DELETE|MERGE|EXEC)\b/i);
    assert.doesNotMatch(query, /mysql|packagemaster|genOCS|FORMAT\(/i);
  }
  assert.match(medicationsSql, /med\.prioritycode IN \('C','O'\)/);
  assert.match(medicationsSql, /med\.an=@an/);
  assert.doesNotMatch(
    medicationsSql,
    /voiddatetime IS NULL|roomCode|enddate\s*[<>]/,
  );
  assert.match(historySql, /LEFT JOIN dbo\.ms_allergygroupdetail/);
  assert.match(historySql, /adr\.createdate<DATEADD\(day,1/);
  assert.match(historySql, /ORDER BY adr\.hn ASC, adr\.AllergyGroupCd ASC/);
});
test("ADR selection and gray rows use calendar comparison across month/year boundaries without rewriting history years", () => {
  const rows = medicationItems(
    [
      saved,
      { ...saved, prioritycode: "O" },
      { ...saved, enddate: "2026-11-01" },
      { ...saved, enddate: "2026-09-30" },
      { ...saved, voiddatetime: "2026-10-01" },
      { ...saved, prioritycode: "O", enddate: "2026-10-21" },
    ],
    "2026-10-21",
  );
  assert.deepEqual(
    rows.map(({ selected }) => selected),
    [true, true, true, false, false, false],
  );
  assert.deepEqual(
    rows.map(({ inactive }) => inactive),
    [false, false, false, true, true, false],
  );
  assert.equal(rows[0].dosage, "1");
  assert.equal(rows[0].id_card, undefined);
});
test("ADR readers preserve historical years, nulls and one-to-many ingredient rows; ambiguous patients are rejected", async () => {
  const calls = [];
  const reader = createAdrReportReader(async (query, params) => {
    calls.push(params);
    return {
      recordset:
        query === medicationsSql
          ? [saved]
          : [
              {
                createdate: "2024-01-01",
                startadrddatetime: "2023-12-31",
                hn: "SYN-HN",
                ingredientname: "A",
              },
              { createdate: "2024-01-01", ingredientname: "B" },
            ],
    };
  });
  const data = await reader.getAdrReportMedications(filters, "2026-10-21");
  assert.deepEqual(data.patient, {
    hn: "SYN-HN",
    an: "SYN-AN",
    name: "ผู้ป่วยทดสอบ",
  });
  const history = await reader.getAdrReportHistory({
    from: "2024-01-01",
    to: "2024-12-31",
    hn: "",
  });
  assert.equal(history.length, 2);
  assert.equal(history[0].createdate, "2024-01-01");
  assert.equal(history[0].startadrddatetime, "2023-12-31");
  assert.equal(history[1].startadrddatetime, "");
  const bad = createAdrReportReader(async () => ({
    recordset: [saved, { ...saved, hn: "OTHER" }],
  }));
  await assert.rejects(
    () => bad.getAdrReportMedications(filters, "2026-10-21"),
    { code: "ADR_AMBIGUOUS_PATIENT" },
  );
  assert.equal(calls[0], filters);
});
test("ADR PDF re-reads selected drug IDs under submitted AN and filters; only S/O/I is browser supplied; allergy groups and address follow native", async () => {
  const reader = createAdrReportReader(async (query) => ({
    recordset:
      query === medicationsSql
        ? [saved]
        : [
            { AllergyGroupCd: "A", AllergyGroupNm: "กลุ่มทดสอบ" },
            { AllergyGroupCd: "A", AllergyGroupNm: "กลุ่มทดสอบ" },
            { AllergyGroupCd: null, patadr: "ยาทดสอบ" },
          ],
  }));
  const report = await reader.getAdrReportPdfData(filters, [
    { id: "SYN-M1", soi: "S" },
  ]);
  assert.equal(report.patient.allergy, "กลุ่มทดสอบ, ยาทดสอบ");
  assert.equal(report.patient.address, "1 ม.2 ต.ทดสอบ จ.ทดสอบ");
  assert.equal(report.items[0].usage, "รับประทาน 1 เม็ด วันละครั้ง หลังอาหาร");
  assert.equal(report.items[0].soi, "S");
  await assert.rejects(
    () => reader.getAdrReportPdfData(filters, [{ id: "OTHER", soi: "S" }]),
    { code: "ADR_SELECTION_CHANGED" },
  );
  assert.equal(allergyText([]), "");
});
test("ADR report validates date ranges, AN/HN, array injection and arbitrary context overrides", () => {
  assert.ok(filtersFor({ an: "SYN-AN" }));
  assert.ok(filtersFor({ from: "2024-02-29", to: "2024-03-01" }, true));
  for (const input of [
    { an: [] },
    { an: "x", useDate: "yes" },
    { an: "x", useDate: "1", from: "2026-02-30", to: "2026-03-01" },
    { an: "x", useDate: 1, from: "2026-10-22", to: "2026-10-21" },
    { an: "x", hn: "OTHER" },
    { an: "x", roomCode: "001" },
  ])
    assert.equal(filtersFor(input), null);
  assert.equal(
    filtersFor({ from: "2026-01-01", to: "2026-01-02", hn: [] }, true),
    null,
  );
});
const syntheticPdfData = {
  patient: {
    hn: "SYN-HN",
    an: "SYN-AN",
    name: "ผู้ป่วยทดสอบ",
    dob: "1980-02-29",
    sex: "1",
    address: "ที่อยู่ทดสอบ",
    idcard: "0000000000000",
    allergy: "กลุ่มยาทดสอบ",
  },
  items: [
    {
      name: "ยาทดสอบ 500 MG",
      usage: "รับประทาน 1 เม็ด หลังอาหาร",
      start: "2026-10-01",
      end: "2026-10-21",
      soi: "S",
    },
  ],
};
test("ADR PDF uses original Crystal form, Thai fonts and valid pagination; history PDF retains 18 columns", async () => {
  assert.equal(
    age("1980-02-29", new Date("2026-10-21T12:00:00Z")),
    "46 ปี 7 เดือน 21 วัน",
  );
  assert.equal(age("2026-10-19", new Date("2026-10-21T12:00:00Z")), "2 วัน");
  const single = await createAdrPdf(syntheticPdfData);
  assert.equal(single.subarray(0, 5).toString(), "%PDF-");
  const doc = await PDFDocument.load(single);
  assert.equal(doc.getPageCount(), 1);
  assert.equal(doc.getPage(0).getWidth(), 595);
  const many = await PDFDocument.load(
    await createAdrPdf({
      ...syntheticPdfData,
      items: Array.from({ length: 24 }, (_, i) => ({
        ...syntheticPdfData.items[0],
        name: `ยาทดสอบ ${i + 1}`,
      })),
    }),
  );
  assert.ok(many.getPageCount() >= 2);
  assert.equal(historyColumns.length, 18);
  const history = await PDFDocument.load(
    await createAdrHistoryPdf(
      [
        {
          hn: "SYN-HN",
          createdate: "2024-01-01",
          pharmacistnote: "บันทึกภาษาไทย",
        },
      ],
      { from: "2024-01-01", to: "2024-01-01" },
    ),
  );
  assert.ok(history.getPage(0).getWidth() > history.getPage(0).getHeight());
});
test("ADR API authenticates and validates reads/exports, rejects tampered PDF selection, distinguishes empty/error and blocks writes", async (t) => {
  let fail = false,
    changed = false;
  let calls = 0;
  const repository = {
    getAdrReportMedications: async () => {
      calls++;
      if (fail) throw Error("synthetic failure");
      return { patient: null, items: [] };
    },
    getAdrReportHistory: async () => [],
    getAdrReportPdfData: async () => {
      calls++;
      if (changed)
        throw Object.assign(Error(), { code: "ADR_SELECTION_CHANGED" });
      return syntheticPdfData;
    },
  };
  const server = createApp({ repository, jwtSecret: "adr-test-secret" }).listen(
    0,
    "127.0.0.1",
  );
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const token = jwt.sign(
    {
      user: { id: "test" },
      context: { roomCode: "001" },
      access: "ipd-readonly",
      version: 2,
    },
    "adr-test-secret",
  );
  const send = (path, { method = "GET", body, auth = true } = {}) =>
    fetch(`http://127.0.0.1:${server.address().port}/api/reports/adr${path}`, {
      method,
      headers: {
        ...(auth ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  assert.equal(
    (await send("/medications?an=SYN-AN", { auth: false })).status,
    401,
  );
  const empty = await send("/medications?an=SYN-AN");
  assert.equal(empty.status, 200);
  assert.deepEqual((await empty.json()).items, []);
  const before = calls;
  for (const path of [
    "/medications?an[]=x",
    "/medications?an=x&sql=DELETE",
    "/history?from=2026-02-30&to=2026-03-01",
  ])
    assert.equal((await send(path)).status, 400);
  assert.equal(calls, before);
  for (const selections of [
    [],
    [{ id: "x", soi: "X" }],
    [{ id: "x", soi: "S", hn: "OTHER" }],
    [
      { id: "x", soi: "S" },
      { id: "x", soi: "O" },
    ],
    Array.from({ length: 201 }, (_, i) => ({ id: String(i), soi: "" })),
  ])
    assert.equal(
      (
        await send("/pdf", {
          method: "POST",
          body: { an: "SYN-AN", selections },
        })
      ).status,
      400,
    );
  const pdf = await send("/pdf", {
    method: "POST",
    body: { an: "SYN-AN", selections: [{ id: "SYN-M1", soi: "S" }] },
  });
  assert.equal(pdf.status, 200);
  assert.match(pdf.headers.get("content-type"), /application\/pdf/);
  assert.equal(pdf.headers.get("cache-control"), "no-store");
  assert.equal(
    Buffer.from(await pdf.arrayBuffer())
      .subarray(0, 5)
      .toString(),
    "%PDF-",
  );
  changed = true;
  assert.equal(
    (
      await send("/pdf", {
        method: "POST",
        body: { an: "SYN-AN", selections: [{ id: "x", soi: "" }] },
      })
    ).status,
    409,
  );
  assert.equal(
    (await send("/history/pdf?from=2026-01-01&to=2026-01-01")).status,
    404,
  );
  for (const method of ["POST", "PUT", "PATCH", "DELETE"])
    assert.equal(
      (await send("/medications", { method, body: {} })).status,
      403,
    );
  fail = true;
  assert.equal((await send("/medications?an=SYN-AN")).status, 503);
});
