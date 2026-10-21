const { screeningWindow } = require("./ipdScreening");

function medTransferWindow(orderdate, workdate, now = new Date()) {
  const round = screeningWindow(orderdate, workdate, now);
  return { workdate: round.workdate, start: round.start, end: round.wardEnd };
}
// ucMedComplete includes all package rows, pharmacies and wards, including
// home medicines/Off/Hold and packages without a prescription join match.
const transferWhere = `pm.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  AND ((@transferStatus='pending' AND pm.medtransferdatetime IS NULL)
    OR (@transferStatus='transferred' AND pm.medtransferdatetime IS NOT NULL))`;
const medTransferWardsSql = `SELECT RTRIM(pm.wardcode) AS code,
    ('['+pm.wardcode+'] '+pm.wardname) AS name,COUNT(DISTINCT pm.prescriptionno) AS prescriptionCount
  FROM dbo.packagemaster pm WHERE ${transferWhere}
  GROUP BY pm.wardcode,pm.wardname
  ORDER BY CASE WHEN pm.wardcode NOT LIKE '%[^0-9]%' AND LEN(pm.wardcode) BETWEEN 1 AND 9
    THEN CONVERT(int,pm.wardcode) ELSE 2147483647 END,pm.wardcode,pm.wardname;`;
const medTransferHeadersSql = `SELECT pm.prescriptionno,pt.ordertype,pm.hn,pm.an,pm.patientname,
    RTRIM(pm.wardcode) AS wardcode,pm.wardname,pm.bedcode,pm.medtransferdatetime
  FROM dbo.packagemaster pm LEFT JOIN dbo.prescription pt ON pt.prescriptionno=pm.prescriptionno
  WHERE ${transferWhere} AND pm.wardcode=@wardCode
  GROUP BY pm.prescriptionno,pt.ordertype,pm.hn,pm.an,pm.patientname,pm.wardcode,pm.wardname,pm.bedcode,pm.medtransferdatetime
  ORDER BY pm.prescriptionno,pm.an,pm.hn,pm.bedcode,pt.ordertype,pm.medtransferdatetime;`;
const medTransferCartsSql = `SELECT DISTINCT RTRIM(cartname) AS name,RTRIM(wardcode) AS wardCode
  FROM dbo.ms_cart WHERE NULLIF(RTRIM(cartname),'') IS NOT NULL ORDER BY wardCode,name;`;
const cartExists = `EXISTS (SELECT 1 FROM dbo.ms_cart c WHERE c.cartname=@cartName)`;
const medTransferLookupSql = `
  SELECT TOP 1 RTRIM(cartname) AS name,RTRIM(wardcode) AS wardCode
    FROM dbo.ms_cart WHERE cartname=@cartName ORDER BY wardcode,cartname;

  SELECT COUNT(*) AS packageCount,
    MAX(CASE WHEN pm.medtransferdatetime IS NOT NULL THEN 1 ELSE 0 END) AS alreadyTransferred,
    MAX(CASE WHEN pm.checkoutdatetime IS NULL THEN 1 ELSE 0 END) AS checkoutPending
    FROM dbo.packagemaster pm WHERE pm.prescriptionno=@prescriptionno AND ${cartExists};

  SELECT pm.prescriptionno,pm.seq,pm.orderitembarcode,pm.patientname,pm.patientdob,
    rt.rightnameTH,pm.hn,pm.an,pm.wardcode,pm.wardname,pm.bedcode,
    pm.orderitemcode,pm.orderitemname,pm.orderqty,pm.orderunitcode,
    pm.instructioncode,pm.frequencycode,pm.timecode,pm.shelfname
  FROM dbo.packagemaster pm LEFT JOIN dbo.ms_patient pt ON pt.hn=pm.hn
  LEFT JOIN dbo.ms_right rt ON rt.rightid=pt.rightid
  WHERE pm.prescriptionno=@prescriptionno AND pm.voiddatetime IS NULL AND ${cartExists}
    AND NOT EXISTS (SELECT 1 FROM dbo.packagemaster completed
      WHERE completed.prescriptionno=@prescriptionno AND completed.medtransferdatetime IS NOT NULL)
  ORDER BY pm.shelfname,pm.seq,pm.orderitembarcode;
`;
// NurseMain.showadr only displays saved generic/group names; no popup or new
// allergy classification is performed at this entry point.
const medTransferAllergiesSql = `SELECT a.AllergyGroupCd,a.AllergyGroupNm,
    CASE WHEN a.AllergyGroupCd IS NULL THEN g.genericname ELSE ingredient.ingredientname END AS patadr
  FROM dbo.ms_adr a LEFT JOIN dbo.ms_adrgeneric g ON g.adrcode=a.adrcode
  LEFT JOIN dbo.ms_allergygroupdetail gd ON gd.AllergyGroupCd=a.AllergyGroupCd
  LEFT JOIN dbo.ms_ingredient ingredient ON ingredient.ingredientcode=gd.ingredientcode
  WHERE a.hn=@hn ORDER BY a.AllergyGroupCd;`;

function transferQuantity(value) {
  if (value == null || String(value).trim() === "") return 0;
  const decimal = String(value).trim().replace(/,/g, "");
  const number = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(decimal)
    ? Number(decimal)
    : NaN;
  if (!Number.isFinite(number))
    throw Object.assign(new Error("Invalid saved transfer quantity"), {
      code: "MED_TRANSFER_INVALID_QUANTITY",
    });
  return number;
}
function medTransferAllergyText(rows) {
  if (!rows.length) return "-";
  let keep = "";
  const names = [];
  for (const row of rows) {
    const group = String(row.AllergyGroupCd ?? "").trim();
    const name = String(row.AllergyGroupNm ?? "").trim();
    const generic = String(row.patadr ?? "").trim();
    if (!group) names.push(generic || name);
    else if (!keep || keep !== group) {
      names.push(name);
      keep = group;
    }
  }
  return names.join(", ");
}
function assembleMedTransferLookup(sets) {
  if (
    !Array.isArray(sets) ||
    sets.length !== 3 ||
    sets.some((s) => !Array.isArray(s)) ||
    sets[1].length !== 1
  )
    throw Object.assign(new Error("Invalid transfer result sets"), {
      code: "MED_TRANSFER_INVALID_RESPONSE",
    });
  const [carts, checks, rows] = sets;
  const empty = { patient: null, items: [] };
  if (!carts[0]) return { state: "invalid-cart", ...empty };
  if (checks[0].alreadyTransferred)
    return { state: "transferred", cart: carts[0], ...empty };
  if (!rows.length) return { state: "notfound", cart: carts[0], ...empty };
  if (new Set(rows.map((r) => JSON.stringify([r.hn, r.an]))).size !== 1)
    throw Object.assign(new Error("Ambiguous prescription patient"), {
      code: "MED_TRANSFER_AMBIGUOUS_PATIENT",
    });
  const first = rows[0];
  return {
    state: "ready",
    cart: carts[0],
    checkoutPending: Boolean(checks[0].checkoutPending),
    patient: {
      hn: String(first.hn ?? "").trim(),
      an: String(first.an ?? "").trim(),
      patientname: String(first.patientname ?? "").trim(),
      patientdob: first.patientdob,
      wardname: String(first.wardname ?? "").trim(),
      bed: "-",
      rightname: String(first.rightnameTH ?? "").trim() || "-",
    },
    items: rows.map((r) => ({
      shelfname: r.shelfname,
      orderitemcode: r.orderitemcode,
      orderitemname: r.orderitemname,
      orderqty: transferQuantity(r.orderqty),
      orderunitcode: r.orderunitcode,
      instructioncode: r.instructioncode,
      frequencycode: r.frequencycode,
      timecode: r.timecode,
    })),
  };
}
function createMedTransferReader(execute) {
  const params = (filters, wardCode = null) => ({
    start: filters.window.start,
    end: filters.window.end,
    transferStatus: filters.transferStatus,
    wardCode,
  });
  return {
    getMedTransferCarts: async () =>
      (await execute(medTransferCartsSql, {})).recordset,
    getMedTransferWards: async (filters) =>
      (await execute(medTransferWardsSql, params(filters))).recordset,
    getMedTransferPrescriptions: async (filters, wardCode) =>
      (await execute(medTransferHeadersSql, params(filters, wardCode)))
        .recordset,
    getMedTransferPrescription: async (cartName, prescriptionno) => {
      const result = await execute(medTransferLookupSql, {
        cartName,
        prescriptionno,
      });
      const lookup = assembleMedTransferLookup(result.recordsets);
      if (lookup.state !== "ready") return lookup;
      if (!lookup.patient.hn)
        return { ...lookup, patient: { ...lookup.patient, allergyText: "" } };
      const adr = await execute(medTransferAllergiesSql, {
        hn: lookup.patient.hn,
      });
      if (!Array.isArray(adr.recordset))
        throw Object.assign(new Error("Invalid transfer ADR response"), {
          code: "MED_TRANSFER_INVALID_RESPONSE",
        });
      return {
        ...lookup,
        patient: {
          ...lookup.patient,
          allergyText: medTransferAllergyText(adr.recordset),
        },
      };
    },
  };
}
module.exports = {
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
};
