const { test } = require("node:test");
const assert = require("node:assert/strict");

// Stub the DB module BEFORE loading repositories. No environment, pool or
// connection is read, and OPD/MySQL is never invoked by this test file.
let respond;
const reads = [];
const fakeDb = {
  sql: { VarChar: () => "varchar" },
  pool: {
    connect: async () => {},
    request: () => {
      const bindings = {};
      return {
        input(key, _type, value) {
          bindings[key] = value;
          return this;
        },
        async query(sql) {
          reads.push({ sql, bindings });
          return { recordset: await respond(sql, bindings) };
        },
      };
    },
  },
};
const dbPath = require.resolve("../models/db");
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: fakeDb,
};
const prescriptions = require("../repositories/ipdPrescriptionRepository");
const reconcile = require("../repositories/ipdReconcileRepository");
const patientRepository = require("../repositories/ipdPatientRepository");
const patient = { an: "synthetic-an", hn: "synthetic-hn" };

test("OR profile alert preserves native length/itemindex criteria, scopes HN and AN, and never imports or writes orders", async () => {
  reads.length = 0;
  respond = async () => [{ medicationCount: 3, prescriptionCount: 2 }];
  const rows = await patientRepository.getPatientOperatingRoomAlert(patient);
  assert.deepEqual(rows, [{ medicationCount: 3, prescriptionCount: 2 }]);
  assert.equal(reads.length, 1);
  const { sql, bindings } = reads[0];
  assert.equal(bindings.hn, patient.hn);
  assert.equal(bindings.an, patient.an);
  assert.ok(sql.includes("LEN(m.meditemindex) BETWEEN 10 AND 13"));
  assert.ok(sql.includes("m.meditemindex = p.itemindex"));
  assert.ok(sql.includes("m.an = @an AND m.hn = @hn"));
  assert.ok(sql.includes("p.an = @an AND p.hn = @hn"));
  assert.ok(!/\b(UPDATE|INSERT|DELETE|MERGE|EXEC)\b/i.test(sql));
});

test("prescription detail reads every native field and batch approval/status without interpolating patient/rx identifiers", async () => {
  reads.length = 0;
  const rx = "RX' OR 1=1--";
  respond = async (sql) =>
    sql.includes("SELECT h.prescriptionno")
      ? [{ prescriptionno: rx }]
      : [{ itemindex: "saved", orderqty: 0 }];
  const result = await prescriptions.getPatientPrescription(
    patient,
    rx,
    "2026-10-20",
  );
  assert.equal(result.items[0].orderqty, 0);
  assert.equal(reads.length, 2);
  for (const read of reads) {
    assert.equal(read.bindings.an, patient.an);
    assert.equal(read.bindings.hn, patient.hn);
    assert.equal(read.bindings.prescriptionno, rx);
    assert.ok(!read.sql.includes(rx));
    assert.ok(!/\b(UPDATE|INSERT|DELETE|MERGE)\b/i.test(read.sql));
  }
  const detail = reads[1];
  for (const field of [
    "statuscal",
    "dosecal",
    "varymeal",
    "language",
    "shelfzone",
    "shelfname",
    "calprice",
    "sendmixcode",
    "diluentseq",
    "displaycolour",
    "varymealstatus",
    "diluentadd",
    "odddatetime",
    "oddday",
    "firsttimecount",
    "DIDcode",
    "doctorcode",
    "statustimeend",
    "timestart",
    "timeend",
  ])
    assert.ok(detail.sql.includes(field), field);
  assert.ok(detail.sql.includes("FROM dbo.ms_Allow"));
  assert.ok(detail.sql.includes("pr.meditemindex = d.meditemindex"));
  assert.ok(detail.sql.includes("pr.an = @an AND pr.hn = @hn"));
  assert.match(detail.bindings.statusStart, /\d{4}-\d{2}-\d{2} (01|08):00:00/);
});

test("saved interaction reader scopes both HN and AN, selects only unsent saved history, and does not run a new clinical comparison", async () => {
  reads.length = 0;
  respond = async () => [
    { DDIhiscode: "saved", drugname: "Synthetic A กับ Synthetic B" },
  ];
  const rows = await prescriptions.getPatientInteractions(patient);
  assert.equal(rows.length, 1);
  assert.equal(reads.length, 1);
  const { sql, bindings } = reads[0];
  assert.equal(bindings.hn, patient.hn);
  assert.equal(bindings.an, patient.an);
  assert.ok(
    sql.includes(
      "history.an = @an AND history.hn = @hn AND history.prescriptionno IS NULL",
    ),
  );
  assert.ok(sql.includes("FROM dbo.ms_drugintereactionhistory"));
  assert.ok(!/\b(UPDATE|INSERT|DELETE|MERGE)\b/i.test(sql));
});

test("Unitdose/MRC read the native recorder/variable-dose fields and batch mapped dispensing units only for MRC", async () => {
  reads.length = 0;
  respond = async () => [
    {
      orderitemcode: "A",
      recorder: "Saved user",
      varymealstatus: null,
      orderunit: "Saved unit",
    },
  ];
  const ipd = await reconcile.getReconcileItems(patient, "IPD", {
    historyId: "old-an",
    historyDate: "2026-10-19",
  });
  assert.equal(reads.length, 1);
  assert.equal(ipd.items[0].recorder, "Saved user");
  assert.ok(
    reads[0].sql.includes("d.varymealstatus, users.fullname AS recorder"),
  );
  assert.equal(reads[0].bindings.historyId, "old-an");
  reads.length = 0;
  respond = async (sql) => {
    if (sql.includes("FROM (VALUES"))
      return [{ code: "A", orderunit: "Mapped unit" }];
    if (sql.includes("AS historyDate"))
      return [{ historyId: "old-an", historyDate: "2026-10-19" }];
    return [
      {
        orderitemcode: "A",
        orderitemname: "Recorded",
        orderunit: "Saved unit",
        varymealstatus: null,
      },
    ];
  };
  const mrc = await reconcile.getReconcileItems(patient, "MRC", {
    historyId: "old-an",
    historyDate: "2026-10-19",
  });
  assert.equal(mrc.items[0].orderitemname, "Recorded");
  assert.equal(mrc.items[0].orderunit, "Mapped unit");
  assert.equal(mrc.items[0].varymealstatus, "N");
  const units = reads.at(-1);
  assert.equal(units.bindings.unitCode0, "A");
  assert.ok(units.sql.includes("dbo.drugname"));
  assert.ok(units.sql.includes("mapped.orderitemcode, wanted.code"));
  assert.ok(!units.sql.includes("'A'"));
});
