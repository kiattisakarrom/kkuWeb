function adrTypeLabel(value) {
  const type = String(value ?? "");
  let label = "";
  // Preserve the desktop's precedence; these describe saved classifications.
  if (/type a/i.test(type)) label = "มี S/E จากยา";
  if (/type b/i.test(type)) label = "แพ้ยา";
  if (type.includes("ให้ประวัติ")) label = "ให้ประวัติแพ้ยา";
  if (type.includes("ประเมินโอกาสแพ้ยา")) label = "มีโอกาสแพ้ยา";
  return label || type || "ไม่ระบุชนิด ADR";
}

const allergyHistorySql = `
  SELECT RTRIM(a.adrcode) AS adrcode, a.createdate, a.lastmodify,
    a.typeofadr, a.destination, RTRIM(a.AllergyGroupCd) AS allergyGroupCode,
    a.AllergyGroupNm AS allergyGroup, a.startadrddatetime,
    a.adversereactions, a.pharmacistnote, a.onsetofadr, a.unitonset,
    a.naranjoscore, a.propability, a.policy,
    a.pharmacyid, a.pharmacyname, a.userid, a.username
  FROM dbo.ms_adr a WHERE a.hn = @hn
  ORDER BY a.startadrddatetime DESC, a.createdate DESC, a.adrcode;

  SELECT RTRIM(g.adrcode) AS adrcode, g.genericname
  FROM dbo.ms_adrgeneric g
  WHERE EXISTS (SELECT 1 FROM dbo.ms_adr a WHERE a.hn = @hn AND a.adrcode = g.adrcode)
  ORDER BY g.adrcode, g.genericname;

  SELECT DISTINCT RTRIM(a.AllergyGroupCd) AS allergyGroupCode,
    RTRIM(d.ingredientcode) AS code, i.ingredientname AS name
  FROM dbo.ms_adr a
  INNER JOIN dbo.ms_allergygroupdetail d ON d.AllergyGroupCd = a.AllergyGroupCd
  LEFT JOIN dbo.ms_ingredient i ON i.ingredientcode = d.ingredientcode
  WHERE a.hn = @hn AND NULLIF(RTRIM(a.AllergyGroupCd), '') IS NOT NULL
  ORDER BY allergyGroupCode, code, name;
`;

function assembleAllergyHistory([
  records = [],
  genericRows = [],
  ingredientRows = [],
]) {
  const generics = new Map();
  const groups = new Map();
  for (const row of genericRows) {
    const key = String(row.adrcode ?? "").trim();
    if (!generics.has(key)) generics.set(key, []);
    if (
      row.genericname !== null &&
      row.genericname !== undefined &&
      row.genericname !== ""
    )
      generics.get(key).push(row.genericname);
  }
  for (const row of ingredientRows) {
    const key = String(row.allergyGroupCode ?? "").trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ code: row.code, name: row.name });
  }
  return records.map((row) => ({
    ...row,
    typeLabel: adrTypeLabel(row.typeofadr),
    genericNames: generics.get(String(row.adrcode ?? "").trim()) || [],
    groupIngredients:
      groups.get(String(row.allergyGroupCode ?? "").trim()) || [],
  }));
}

function createAllergyHistoryReader(execute) {
  return async (patient) => {
    const result = await execute(allergyHistorySql, patient.hn);
    // A failed/malformed source must never become a negative allergy history.
    if (
      !Array.isArray(result.recordsets) ||
      result.recordsets.length !== 3 ||
      result.recordsets.some((rows) => !Array.isArray(rows))
    )
      throw Object.assign(new Error("Invalid allergy result sets"), {
        code: "ADR_INVALID_RESPONSE",
      });
    return assembleAllergyHistory(result.recordsets);
  };
}

module.exports = {
  adrTypeLabel,
  assembleAllergyHistory,
  createAllergyHistoryReader,
};
