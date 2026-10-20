const { screeningWindow, dayOffset } = require("./ipdScreening");
const { createHash } = require("node:crypto");

function checkoutWindow(orderdate, workdate, now = new Date()) {
  const round = screeningWindow(orderdate, workdate, now);
  return {
    workdate: round.workdate,
    start: round.start,
    end: `${dayOffset(round.workdate, 1)} 07:59:59`,
    detailStart: `${orderdate} 00:00:00`,
    detailEnd: `${orderdate} 23:59:59`,
  };
}

// ucCheckout intentionally includes inactive wards and all pharmacies. The
// list is a work round, while the native double-click detail is a calendar day.
const checkoutWhere = `p.genorderdatetime IS NOT NULL
  AND m.ordertype <> '1'
  AND m.ordercreatedate BETWEEN CAST(@start AS datetime) AND CAST(@end AS datetime)
  AND (@search = '' OR m.an = @search)
  AND (@checkoutStatus = 'all' OR (@checkoutStatus = 'pending' AND m.checkoutdatetime IS NULL)
    OR (@checkoutStatus = 'finished' AND m.checkoutdatetime IS NOT NULL))`;
const checkoutWardsSql = `SELECT RTRIM(m.wardcode) AS code,
    ('[' + m.wardcode + '] ' + m.wardname) AS name,
    COUNT(DISTINCT m.prescriptionno) AS prescriptionCount
  FROM dbo.packagemaster m INNER JOIN dbo.prescription p ON p.prescriptionno=m.prescriptionno
  WHERE ${checkoutWhere}
  GROUP BY m.wardcode, m.wardname
  ORDER BY CASE WHEN m.wardcode NOT LIKE '%[^0-9]%' AND LEN(m.wardcode) BETWEEN 1 AND 9
    THEN CONVERT(int,m.wardcode) ELSE 2147483647 END,m.wardcode,m.wardname;`;
const checkoutHeadersSql = `SELECT m.prescriptionno,m.hn,m.an,m.patientname,
    RTRIM(m.wardcode) AS wardcode,m.wardname,m.bedcode,p.ordertype,m.checkoutuserid
  FROM dbo.packagemaster m INNER JOIN dbo.prescription p ON p.prescriptionno=m.prescriptionno
  WHERE ${checkoutWhere} AND m.wardcode=@wardCode
    AND (@prescriptionno IS NULL OR m.prescriptionno=@prescriptionno)
  GROUP BY m.prescriptionno,m.hn,m.an,m.patientname,m.wardcode,m.wardname,m.bedcode,p.ordertype,m.checkoutuserid
  ORDER BY m.prescriptionno,m.wardcode,m.bedcode,m.an,m.checkoutuserid;`;

const groupFields = [
  "prescriptionno",
  "hn",
  "an",
  "prioritycode",
  "prioritydesc",
  "orderitemcode",
  "orderitemname",
  "orderqty",
  "orderunitcode",
  "orderunitdesc",
  "instructioncode",
  "instructiondesc",
  "varymeal",
  "dosageunitcode",
  "dosageunitdesc",
  "frequencycode",
  "frequencydesc",
  "timecode",
  "timedesc",
  "freetext1",
  "freetext2",
  "itemindex",
  "printstatus",
  "voiddatetime",
  "holddatetime",
];
const grouped = groupFields.map((k) => `m.${k}`).join(",");
const detailScope = `m.prescriptionno=@prescriptionno AND m.hn=@hn AND m.an=@an
  AND m.ordercreatedate BETWEEN CAST(@detailStart AS datetime) AND CAST(@detailEnd AS datetime)`;
const detailStatus = `((@completed=0 AND m.checkoutdatetime IS NULL) OR (@completed=1 AND m.checkoutdatetime IS NOT NULL))`;
const checkoutDetailSql = `
  SELECT ${grouped},m.varymeal AS dosage,CONVERT(float,ISNULL(m.orderqty,'0')) AS numericOrderqty,
    CASE WHEN m.locationcode='1' THEN 'jvm'
      WHEN m.frequencycode IN ('S','E','STAT') THEN 'stat' ELSE 'manual' END AS category,
    CASE WHEN EXISTS (SELECT 1 FROM dbo.prescription pr INNER JOIN dbo.ms_drug d ON d.orderitemcode=pr.orderitemcode
      WHERE pr.prescriptionno=m.prescriptionno AND pr.orderitemcode=m.orderitemcode
        AND d.drugform=N'ยาฉีด' AND pr.sendmix='N') THEN 1 ELSE 0 END AS isUnmixedInjection
  FROM dbo.packagemaster m
  WHERE ${detailScope} AND ${detailStatus} AND m.locationcode IS NOT NULL
    AND EXISTS (SELECT 1 FROM dbo.prescription pr WHERE pr.prescriptionno=m.prescriptionno)
  GROUP BY ${grouped},CASE WHEN m.locationcode='1' THEN 'jvm'
      WHEN m.frequencycode IN ('S','E','STAT') THEN 'stat' ELSE 'manual' END
  ORDER BY m.printstatus DESC,m.prioritycode,m.itemindex;

  SELECT m.frequencyTime,m.frequencyTimedesc,CONVERT(char(10),m.takedate,23) AS takeDay,
    m.takedate AS takeDateValue
  FROM dbo.packagemaster m WHERE ${detailScope} AND m.locationcode='1'
    AND EXISTS (SELECT 1 FROM dbo.prescription pr WHERE pr.prescriptionno=m.prescriptionno AND pr.genorderdatetime IS NOT NULL)
  GROUP BY m.frequencyTime,m.frequencyTimedesc,m.takedate
  ORDER BY m.takedate,m.frequencyTime,m.frequencyTimedesc;

  SELECT m.itemindex,m.orderitemcode,m.frequencycode,m.timecode,m.frequencyTime,m.frequencyTimedesc,
    CONVERT(char(10),m.takedate,23) AS takeDay,CONVERT(float,ISNULL(m.dosage,'0')) AS dosage,
    m.checkoutdatetime,m.voiddatetime,m.holddatetime
  FROM dbo.packagemaster m WHERE ${detailScope} AND m.locationcode='1';

  SELECT TOP 1 a.hn,a.an,CASE WHEN pt.patientlanguage='TH' THEN pt.patientnameTH ELSE pt.patientnameEN END AS patientname,
    pt.patientdob,pt.sex,RTRIM(w.wardcode) AS wardcode,w.warddesc,b.toroom AS room,b.tobed AS bed,
    CASE WHEN pt.patientlanguage='TH' THEN r.rightnameTH ELSE r.rightnameEN END AS rightname
  FROM dbo.ms_patientadmit a INNER JOIN dbo.ms_patient pt ON pt.hn=a.hn
  INNER JOIN dbo.ms_bedmove b ON b.an=a.an AND b.status=0
  LEFT JOIN dbo.ms_ward w ON w.wardcode=b.towardcode
  LEFT JOIN dbo.ms_right r ON r.rightid=pt.rightid
  WHERE a.an=@an AND a.hn=@hn ORDER BY b.lastmodified DESC;

  SELECT pr.confirmuserid,MIN(pr.confirmdatetime) AS confirmdatetime,u.firstname+' '+u.lastname AS name
  FROM dbo.prescription pr LEFT JOIN dbo.ms_users u ON u.userID=pr.confirmuserid
  WHERE pr.prescriptionno=@prescriptionno AND pr.hn=@hn AND pr.an=@an
  GROUP BY pr.confirmuserid,u.firstname,u.lastname ORDER BY confirmdatetime,pr.confirmuserid;

  SELECT TOP 1 'LED' AS kind,u.firstname+' '+u.lastname AS name FROM dbo.packagemaster m
  INNER JOIN dbo.ms_users u ON u.userID=m.leduserid
  WHERE m.prescriptionno=@prescriptionno AND m.hn=@hn AND m.an=@an AND m.locationcode='2'
  ORDER BY m.leddispensedatetime,m.itemindex;

  SELECT TOP 1 'HAD' AS kind,u.firstname+' '+u.lastname AS name FROM dbo.packagemaster m
  INNER JOIN dbo.ms_users u ON u.userID=m.haduserid
  WHERE m.prescriptionno=@prescriptionno AND m.hn=@hn AND m.an=@an AND m.locationcode='3'
  ORDER BY m.haddispensedatetime,m.itemindex;

  SELECT DISTINCT a.AllergyGroupCd,a.AllergyGroupNm,a.adversereactions,
    CASE WHEN a.AllergyGroupCd IS NULL THEN g.genericname ELSE i.ingredientname END AS patadr
  FROM dbo.ms_adr a LEFT JOIN dbo.ms_adrgeneric g ON g.adrcode=a.adrcode
  LEFT JOIN dbo.ms_allergygroupdetail gd ON gd.AllergyGroupCd=a.AllergyGroupCd
  LEFT JOIN dbo.ms_ingredient i ON i.ingredientcode=gd.ingredientcode
  WHERE a.hn=@hn ORDER BY a.AllergyGroupCd,a.AllergyGroupNm,a.adversereactions,patadr;
`;

function checkoutHeaderKey(row) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        row.prescriptionno,
        row.hn,
        row.an,
        row.wardcode,
        row.wardname,
        row.patientname,
        row.bedcode,
        row.ordertype,
        row.checkoutuserid,
      ]),
    )
    .digest("hex");
}
function assembleCheckoutDetail(sets) {
  if (
    !Array.isArray(sets) ||
    sets.length !== 8 ||
    sets.some((s) => !Array.isArray(s))
  )
    throw Object.assign(new Error("Invalid checkout result sets"), {
      code: "CHECKOUT_INVALID_RESPONSE",
    });
  const [
    groupedRows,
    times,
    packets,
    patients,
    screeners,
    led,
    had,
    allergies,
  ] = sets;
  const items = groupedRows.filter(
    (r) =>
      !(
        r.category === "manual" &&
        Number(r.numericOrderqty) === 0 &&
        r.isUnmixedInjection
      ),
  );
  return {
    items,
    times,
    packets,
    patient: patients[0] || null,
    screener: screeners[0] || null,
    preparers: [...led, ...had],
    allergies,
  };
}
function createCheckoutReader(execute) {
  const params = (filters, wardCode = null, prescriptionno = null) => ({
    ...filters.window,
    search: filters.search,
    checkoutStatus: filters.checkoutStatus,
    wardCode,
    prescriptionno,
  });
  const getCheckoutWards = async (filters) =>
    (await execute(checkoutWardsSql, params(filters))).recordset;
  const getCheckoutPrescriptions = async (
    filters,
    wardCode,
    prescriptionno = null,
  ) => {
    const result = await execute(
      checkoutHeadersSql,
      params(filters, wardCode, prescriptionno),
    );
    return result.recordset.map((row) => ({
      ...row,
      key: checkoutHeaderKey(row),
    }));
  };
  const getCheckoutDetail = async (filters, wardCode, prescriptionno, key) => {
    const headers = await getCheckoutPrescriptions(
      filters,
      wardCode,
      prescriptionno,
    );
    const header = headers.find((row) => row.key === key);
    if (!header) return null;
    const completed =
      header.checkoutuserid != null && String(header.checkoutuserid) !== "";
    const result = await execute(checkoutDetailSql, {
      ...params(filters, wardCode, prescriptionno),
      hn: header.hn,
      an: header.an,
      completed,
    });
    return { header, completed, ...assembleCheckoutDetail(result.recordsets) };
  };
  return { getCheckoutWards, getCheckoutPrescriptions, getCheckoutDetail };
}
module.exports = {
  checkoutWindow,
  checkoutWardsSql,
  checkoutHeadersSql,
  checkoutDetailSql,
  checkoutHeaderKey,
  assembleCheckoutDetail,
  createCheckoutReader,
};
