const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  adrTypeLabel,
  assembleAllergyHistory,
  createAllergyHistoryReader,
} = require("../services/ipdAllergyHistory");

test("ADR labels describe saved type using native precedence without assuming an allergy", () => {
  assert.equal(adrTypeLabel("ADR Type A"), "มี S/E จากยา");
  assert.equal(adrTypeLabel("type B"), "แพ้ยา");
  assert.equal(adrTypeLabel("Type B ให้ประวัติ"), "ให้ประวัติแพ้ยา");
  assert.equal(
    adrTypeLabel("Type B ให้ประวัติ ประเมินโอกาสแพ้ยา"),
    "มีโอกาสแพ้ยา",
  );
  assert.equal(adrTypeLabel("ชนิดอื่นที่บันทึก"), "ชนิดอื่นที่บันทึก");
  assert.equal(adrTypeLabel(null), "ไม่ระบุชนิด ADR");
});

test("ADR keeps one record per saved event, all generic names and group members without a Cartesian join", () => {
  const records = [
    {
      adrcode: "A",
      allergyGroupCode: null,
      typeofadr: "ให้ประวัติ",
      naranjoscore: 0,
      adversereactions: "อาการ\n" + "ก".repeat(500),
    },
    {
      adrcode: "B",
      allergyGroupCode: "G",
      typeofadr: "Type B",
      pharmacistnote: "บันทึก\nครบทุกบรรทัด",
    },
    { adrcode: "C", allergyGroupCode: "G", typeofadr: "Type A" },
  ];
  const result = assembleAllergyHistory([
    records,
    [
      { adrcode: "A", genericname: "Generic one" },
      { adrcode: "A", genericname: "Generic two" },
      { adrcode: "B", genericname: "Recorded generic" },
      { adrcode: "OTHER", genericname: "Never attached" },
    ],
    [
      { allergyGroupCode: "G", code: "I1", name: "Ingredient one" },
      { allergyGroupCode: "G", code: "I2", name: null },
    ],
  ]);
  assert.equal(result.length, 3);
  assert.deepEqual(result[0].genericNames, ["Generic one", "Generic two"]);
  assert.deepEqual(result[0].groupIngredients, []);
  assert.equal(result[0].naranjoscore, 0);
  assert.equal(result[0].adversereactions, records[0].adversereactions);
  assert.equal(result[1].pharmacistnote, records[1].pharmacistnote);
  assert.deepEqual(result[1].groupIngredients, result[2].groupIngredients);
  assert.equal(result[1].groupIngredients.length, 2);
  assert.equal(result[1].groupIngredients[1].name, null);
});

test("ADR batch query scopes every result set to server HN, contains no client SQL or AN/date limit", async () => {
  let count = 0;
  const reader = createAllergyHistoryReader(async (text, hn) => {
    count++;
    assert.equal(hn, "synthetic-hn' OR 1=1 --");
    assert.ok(!text.includes(hn));
    assert.equal((text.match(/a.hn = @hn/g) || []).length, 3);
    assert.ok(text.includes("dbo.ms_adrgeneric"));
    assert.ok(text.includes("dbo.ms_allergygroupdetail"));
    assert.ok(text.includes("dbo.ms_ingredient"));
    assert.ok(!text.includes("a.an"));
    assert.ok(!/\b(INSERT|UPDATE|DELETE|MERGE)\b/i.test(text));
    return { recordsets: [[], [], []] };
  });
  assert.deepEqual(
    await reader({ hn: "synthetic-hn' OR 1=1 --", an: "CURRENT" }),
    [],
  );
  assert.equal(count, 1);
});

test("ADR malformed/error sources never become an empty or negative allergy history", async () => {
  for (const payload of [
    {},
    { recordsets: [] },
    { recordsets: [[], []] },
    { recordsets: [[], null, []] },
  ]) {
    await assert.rejects(
      createAllergyHistoryReader(async () => payload)({ hn: "DEMO" }),
      { code: "ADR_INVALID_RESPONSE" },
    );
  }
  await assert.rejects(
    createAllergyHistoryReader(async () => {
      throw Object.assign(new Error("database private details"), {
        code: "ETIMEOUT",
      });
    })({ hn: "DEMO" }),
    { code: "ETIMEOUT" },
  );
});

test("ADR display preserves grouped warnings, zero probability and unknown classifications", async () => {
  const { allergyDrugText, allergySummaryText } = await import(
    "../../front/src/components/Profile/allergyFormat.js"
  );
  const group = {
    allergyGroupCode: "G",
    allergyGroup: "กลุ่มตัวอย่าง",
    typeLabel: "มีโอกาสแพ้ยา",
    adversereactions: "อาการที่บันทึก",
    propability: 0,
    policy: "คำเตือนเดิม",
    groupIngredients: [
      { code: "I1", name: "ยาหนึ่ง" },
      { code: "I2", name: null },
    ],
  };
  const text = allergySummaryText([group]);
  assert.equal(allergyDrugText(group), "กลุ่มตัวอย่าง");
  assert.ok(text.includes("มีโอกาสแพ้ยา"));
  assert.ok(text.includes("ความน่าจะเป็น: 0"));
  assert.ok(text.includes("ยาหนึ่ง, [I2]"));
  assert.ok(text.includes("คำเตือนเดิม"));
  assert.equal(
    allergyDrugText({ genericNames: ["ยาหนึ่ง", "ยาสอง"] }),
    "ยาหนึ่ง, ยาสอง",
  );
  assert.ok(!allergySummaryText([]).includes("ไม่มีประวัติแพ้ยา"));
  assert.ok(
    allergySummaryText([{ typeofadr: "ชนิดอื่น" }]).includes("ชนิดอื่น"),
  );
});
