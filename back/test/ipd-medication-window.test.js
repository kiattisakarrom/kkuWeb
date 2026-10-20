const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  medicationWindow,
  defaultMedicationDate,
} = require("../services/ipdMedicationWindow");

test("native medication round keeps 08:00 to 07:59:00 and calendar cutoff across year end", () => {
  assert.deepEqual(medicationWindow("2026-12-31"), {
    start: "2026-12-31 08:00:00",
    end: "2027-01-01 07:59:00",
    endDateCutoff: "2026-12-30",
  });
});
test("medication rounds handle leap day without local timezone shifts", () => {
  assert.deepEqual(medicationWindow("2024-02-29"), {
    start: "2024-02-29 08:00:00",
    end: "2024-03-01 07:59:00",
    endDateCutoff: "2024-02-28",
  });
});

test("before 08:00 Bangkok defaults to the previous round and native calendar cutoff", () => {
  const before = new Date("2026-10-18T00:59:59Z");
  assert.equal(defaultMedicationDate("2026-10-18", before), "2026-10-17");
  assert.equal(
    medicationWindow("2026-10-17", before).endDateCutoff,
    "2026-10-17",
  );
  assert.equal(defaultMedicationDate("2025-06-06", before), "2025-06-06");
});

test("at 08:00 Bangkok starts the new round", () => {
  const atEight = new Date("2026-10-18T01:00:00Z");
  assert.equal(defaultMedicationDate("2026-10-18", atEight), "2026-10-18");
  assert.equal(
    medicationWindow("2026-10-18", atEight).endDateCutoff,
    "2026-10-17",
  );
});
