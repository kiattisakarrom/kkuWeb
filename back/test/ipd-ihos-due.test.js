const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  parseIhosDue,
  createIhosDueReader,
  IHOS_DUE_URL,
} = require("../services/ipdIhosDue");

const row = (overrides = {}) => ({
  datetime: "2026-10-18 10:15:00",
  status: "",
  drugcode: "DEMO-DRUG",
  confirm_inp_id: null,
  confirm_date: null,
  confirm_note: "",
  request_note: "ข้อความเต็ม\n" + "ก".repeat(500),
  inp_type: "IPD",
  ...overrides,
});

test("IHOS status labels follow native; unknown codes never become pending", () => {
  const items = parseIhosDue(
    {
      data: [
        row(),
        row({ status: 1 }),
        row({ status: "2" }),
        row({ status: "0" }),
        row({ status: null }),
      ],
    },
    "DEMO-AN",
  );
  assert.deepEqual(
    items.map((item) => item.statusText),
    ["รออนุมัติ", "อนุมัติ", "ไม่อนุมัติ", "ไม่ทราบสถานะ (0)", "รออนุมัติ"],
  );
  assert.equal(items[0].request_note, row().request_note);
  assert.equal(items[0].confirm, "");
  assert.equal(items[0].confirm_date, "");
});

test("IHOS accepts only a real data array, rejects malformed rows and wrong AN", () => {
  assert.deepEqual(parseIhosDue({ data: [] }, "DEMO-AN"), []);
  for (const payload of [
    null,
    "",
    {},
    { data: null },
    { data: "[]" },
    { data: {} },
    { data: [], success: false },
    { data: [], status: false },
    { data: [], error: "denied" },
    { data: [null] },
    { data: [{ message: "denied" }] },
    { data: [row({ status: {} })] },
    { data: [row({ request_note: [] })] },
    { data: [row({ AN: "OTHER-AN" })] },
    { data: [row({ an: "OTHER-AN" })] },
  ])
    assert.throws(() => parseIhosDue(payload, "DEMO-AN"), {
      code: "IHOS_DUE_INVALID_RESPONSE",
    });
});

test("IHOS sends only server AN to the fixed hospital HTTPS endpoint; names are batched", async () => {
  let nameCalls = 0;
  const reader = createIhosDueReader({
    apiKey: () => "synthetic-key",
    httpGet: async (url, config) => {
      assert.equal(url, IHOS_DUE_URL);
      assert.deepEqual(config.params, { an: "DEMO-AN" });
      assert.equal(config.headers["x-api-key"], "synthetic-key");
      assert.equal(config.maxRedirects, 0);
      assert.ok(config.timeout <= 6000);
      assert.ok(config.maxContentLength <= 2 * 1024 * 1024);
      return { data: { data: [row(), row({ drugcode: "SECOND" }), row()] } };
    },
    lookupDrugNames: async (codes) => {
      nameCalls++;
      assert.deepEqual(codes, ["DEMO-DRUG", "SECOND"]);
      return new Map([["DEMO-DRUG", "Synthetic drug"]]);
    },
  });
  const result = await reader({
    an: "DEMO-AN",
    hn: "DO-NOT-SEND",
    url: "https://invalid.example",
  });
  assert.equal(nameCalls, 1);
  assert.deepEqual(
    result.map((item) => item.drugname),
    ["Synthetic drug", "", "Synthetic drug"],
  );
  assert.ok(
    result.every((item) => !JSON.stringify(item).includes("synthetic-key")),
  );
});

test("IHOS empty response needs no drug lookup and is different from unavailable", async () => {
  const reader = createIhosDueReader({
    apiKey: () => "synthetic-key",
    httpGet: async () => ({ data: { data: [] } }),
    lookupDrugNames: async () => assert.fail("No lookup for empty data"),
  });
  assert.deepEqual(await reader({ an: "DEMO-AN" }), []);
  const unavailable = createIhosDueReader({
    apiKey: () => "synthetic-key",
    httpGet: async () => {
      throw new Error("secret and response must not escape");
    },
  });
  await assert.rejects(unavailable({ an: "DEMO-AN" }), {
    code: "IHOS_DUE_UNAVAILABLE",
    message: "IHOS_DUE_UNAVAILABLE",
  });
});

test("IHOS missing credential and SQL failures never return empty clinical history", async () => {
  const unconfigured = createIhosDueReader({
    apiKey: () => "",
    httpGet: async () => assert.fail("No HTTP call without credentials"),
  });
  await assert.rejects(unconfigured({ an: "DEMO-AN" }), {
    code: "IHOS_DUE_NOT_CONFIGURED",
  });
  const dbUnavailable = createIhosDueReader({
    apiKey: () => "synthetic-key",
    httpGet: async () => ({ data: { data: [row()] } }),
    lookupDrugNames: async () => {
      throw Object.assign(new Error("database unavailable"), {
        code: "ETIMEOUT",
      });
    },
  });
  await assert.rejects(dbUnavailable({ an: "DEMO-AN" }), { code: "ETIMEOUT" });
});
