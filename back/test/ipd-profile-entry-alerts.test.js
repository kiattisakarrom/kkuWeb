const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const formats = import(
  pathToFileURL(
    path.resolve(
      __dirname,
      "../../front/src/components/Profile/profileEntryAlerts.js",
    ),
  ).href
);
const ready = (data) => ({ data, loading: false, error: "" });
const adr = ready({
  allergies: [
    {
      adrcode: "ADR-SYN",
      typeofadr: "Type A",
      typeLabel: "มี S/E จากยา",
      genericNames: ["Synthetic"],
      adversereactions: "Saved reaction\nFull text",
      propability: 0,
      policy: "Saved policy",
    },
  ],
});
const notes = ready({
  notes: [{ id: "NOTE", problem: "Recorded", note: "Full saved note" }],
});
const or = ready({
  "operating-room-alert": [{ medicationCount: 2, prescriptionCount: 1 }],
});

test("profile entry queues saved ADR, pharmacist Note and incomplete OR in Windows order", async () => {
  const { profileEntrySources, nextProfileEntryAlert } = await formats;
  const sources = profileEntrySources(adr, notes, or);
  const allergy = nextProfileEntryAlert(sources, []);
  assert.equal(allergy.id, "allergy");
  assert.ok(allergy.text.includes("มี S/E จากยา"));
  assert.ok(allergy.text.includes("Saved reaction\nFull text"));
  assert.ok(allergy.text.includes("Saved policy"));
  assert.ok(allergy.text.includes("ความน่าจะเป็น: 0"));
  assert.equal(nextProfileEntryAlert(sources, ["allergy"]).id, "notes");
  assert.equal(
    nextProfileEntryAlert(sources, ["allergy", "notes"]).id,
    "operating-room",
  );
  assert.equal(
    nextProfileEntryAlert(sources, ["allergy", "notes", "operating-room"]),
    null,
  );
});

test("empty histories and equal OR counts do not produce a popup; blank saved Notes still open like frmNote", async () => {
  const { profileEntrySources, nextProfileEntryAlert } = await formats;
  for (const counts of [
    { medicationCount: 0, prescriptionCount: 0 },
    { medicationCount: 2, prescriptionCount: 2 },
  ]) {
    const sources = profileEntrySources(
      ready({ allergies: [] }),
      ready({ notes: [] }),
      ready({ "operating-room-alert": [counts] }),
    );
    assert.equal(nextProfileEntryAlert(sources, []), null);
  }
  const blank = { id: "BLANK", problem: null, note: "", recorder: null };
  const source = profileEntrySources(
    ready({ allergies: [] }),
    ready({ notes: [blank] }),
    or,
  );
  assert.deepEqual(nextProfileEntryAlert(source, []).notes, [blank]);
});

test("slow allergy source cannot be overtaken by Notes; failed source does not hide other saved warnings", async () => {
  const { profileEntrySources, nextProfileEntryAlert } = await formats;
  let sources = profileEntrySources(
    { data: null, loading: true, error: "" },
    notes,
    or,
  );
  assert.equal(nextProfileEntryAlert(sources, []), null);
  sources = profileEntrySources(
    { data: null, loading: false, error: "unavailable" },
    notes,
    or,
  );
  assert.equal(nextProfileEntryAlert(sources, []).id, "notes");
  assert.equal(sources.filter((source) => source.error).length, 1);
  sources = profileEntrySources(
    adr,
    { data: null, loading: false, error: "unavailable" },
    or,
  );
  assert.equal(
    nextProfileEntryAlert(sources, ["allergy"]).id,
    "operating-room",
  );
});

test("dismissal is local to the opened patient/context and survives view/reload state updates without marking records read", async () => {
  const { dismissEntryAlert } = await formats;
  let state = dismissEntryAlert(
    { context: "", ids: [] },
    "AN-A|WARD-A",
    "allergy",
  );
  state = dismissEntryAlert(state, "AN-A|WARD-A", "notes");
  state = dismissEntryAlert(state, "AN-A|WARD-A", "allergy");
  assert.deepEqual(state.ids, ["allergy", "notes"]);
  state = dismissEntryAlert(state, "AN-B|WARD-B", "notes");
  assert.deepEqual(state, { context: "AN-B|WARD-B", ids: ["notes"] });
});

test("OR alert follows native unequal saved counts, including numeric strings, without classifying invalid values", async () => {
  const { profileEntrySources } = await formats;
  const queue = (counts) =>
    profileEntrySources(
      ready({ allergies: [] }),
      ready({ notes: [] }),
      ready({ "operating-room-alert": [counts] }),
    )[2].alert;
  assert.equal(
    queue({ medicationCount: "2", prescriptionCount: "1" }).medicationCount,
    2,
  );
  assert.equal(
    queue({ medicationCount: 1, prescriptionCount: 2 }).prescriptionCount,
    2,
  );
  assert.equal(queue({ medicationCount: -1, prescriptionCount: 0 }), null);
  assert.equal(queue({ medicationCount: "bad", prescriptionCount: 1 }), null);
});
