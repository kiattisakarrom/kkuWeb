// Windows: ctx/ADR/ucReportADR, ucADRHistory and ctx/class/clsADR.
// Both report queries use the Interface MSSQL database; no MySQL call is needed.
const medicationsSql = `SELECT med.meditemindex, med.hn, med.an,
  pt.patientnameTH, CONVERT(varchar(10), pt.patientdob, 23) AS patientdob, pt.sex,
  med.prioritycode, med.orderitemcode, med.orderitemname,
  CONVERT(float,med.dosage) AS dosage, med.dosageunitcode, du.DispensedUnitTH,
  CONVERT(float,med.orderqty) AS orderqty, med.orderunitcode, ou.DispensedTotalUnitTH,
  med.instructioncode, ist.InstructionNameTH, med.frequencycode, fq.frequency_nameTH,
  med.timecode, t.timeTH, CONVERT(varchar(10),med.startdate,23) AS startdate,
  CONVERT(varchar(10),med.enddate,23) AS enddate, med.voiddatetime,
  pt.address, pt.moo, pt.tambol, pt.amp, pv.provname, pt.id_card
 FROM dbo.ms_medicationprofile med
 LEFT JOIN dbo.ms_patient pt ON med.hn=pt.hn
 LEFT JOIN dbo.ms_province pv ON pt.provcode=pv.provcode
 LEFT JOIN dbo.ms_Instruction ist ON med.instructioncode=ist.InstructionCd
 LEFT JOIN dbo.ms_frequency_code fq ON med.frequencycode=fq.frequency_code
 LEFT JOIN dbo.ms_time t ON med.timecode=t.timecode
 LEFT JOIN dbo.ms_orderunit ou ON med.orderunitcode=ou.DispensedTotalUnitCd
 LEFT JOIN dbo.ms_dosageunit du ON med.dosageunitcode=du.DispensedUnitCd
 WHERE med.an=@an AND med.prioritycode IN ('C','O')
  AND (@useDate=0 OR (med.ordercreatedate>=CAST(@from AS datetime)
    AND med.ordercreatedate<=DATEADD(second,86399,CAST(@to AS datetime))))
 ORDER BY med.prioritycode ASC, med.voiddatetime ASC;`;

const historySql = `SELECT adr.hn, pt.patientnameTH,
 CONVERT(varchar(10),adr.createdate,23) AS createdate, adr.typeofadr, adr.destination,
 adr.AllergyGroupCd, adr.AllergyGroupNm, gr.genericname, igd.ingredientname,
 CONVERT(varchar(10),adr.startadrddatetime,23) AS startadrddatetime,
 adr.adversereactions, adr.pharmacistnote, adr.onsetofadr, adr.unitonset,
 adr.naranjoscore, adr.propability, adr.policy, adr.pharmacyname, adr.username
 FROM dbo.ms_adr adr
 LEFT JOIN dbo.ms_patient pt ON pt.hn=adr.hn
 LEFT JOIN dbo.ms_adrgeneric gr ON gr.adrcode=adr.adrcode
 LEFT JOIN dbo.ms_allergygroupdetail agd ON agd.AllergyGroupCd=adr.AllergyGroupCd
 LEFT JOIN dbo.ms_ingredient igd ON igd.ingredientcode=agd.ingredientcode
 WHERE adr.createdate>=CAST(@from AS datetime)
  AND adr.createdate<DATEADD(day,1,CAST(@to AS datetime)) AND (@hn='' OR adr.hn=@hn)
 ORDER BY adr.hn ASC, adr.AllergyGroupCd ASC;`;

const allergiesSql = `SELECT adr.AllergyGroupCd, adr.AllergyGroupNm,
 CASE WHEN adr.AllergyGroupCd IS NULL THEN gr.genericname ELSE igd.ingredientname END AS patadr
 FROM dbo.ms_adr adr
 LEFT JOIN dbo.ms_adrgeneric gr ON gr.adrcode=adr.adrcode
 LEFT JOIN dbo.ms_allergygroupdetail agd ON agd.AllergyGroupCd=adr.AllergyGroupCd
 LEFT JOIN dbo.ms_ingredient igd ON igd.ingredientcode=agd.ingredientcode
 WHERE adr.hn=@hn ORDER BY adr.AllergyGroupCd;`;

const text = (value) => (value == null ? "" : String(value).trim());
const day = (value) =>
  value instanceof Date
    ? value.toISOString().slice(0, 10)
    : text(value).slice(0, 10);
function reportError(code) {
  return Object.assign(new Error(code), { code });
}

function patientFromRows(rows, an) {
  if (!rows.length) return null;
  const first = rows[0];
  if (
    !text(first.hn) ||
    rows.some((row) => text(row.an) !== an || text(row.hn) !== text(first.hn))
  )
    throw reportError("ADR_AMBIGUOUS_PATIENT");
  return { hn: text(first.hn), an, name: text(first.patientnameTH) };
}

function medicationItems(rows, today) {
  const columns = [
    "prioritycode",
    "orderitemcode",
    "orderitemname",
    "dosage",
    "dosageunitcode",
    "orderqty",
    "orderunitcode",
    "instructioncode",
    "frequencycode",
    "timecode",
  ];
  return rows.map((row) => {
    const expired = Boolean(row.enddate && day(row.enddate) < today);
    const inactive = Boolean(row.voiddatetime) || expired;
    return {
      id: text(row.meditemindex),
      ...Object.fromEntries(columns.map((key) => [key, text(row[key])])),
      startdate: day(row.startdate),
      enddate: day(row.enddate),
      inactive,
      selected: !inactive && (!row.enddate || text(row.prioritycode) === "C"),
    };
  });
}

function allergyText(rows) {
  const groups = new Set();
  const values = [];
  for (const row of rows) {
    const code = text(row.AllergyGroupCd);
    if (code && groups.has(code)) continue;
    if (code) groups.add(code);
    const value = code ? text(row.AllergyGroupNm) : text(row.patadr);
    if (value) values.push(value);
  }
  return values.join(", ");
}

function createAdrReportReader(query) {
  const readRows = async (filters) =>
    (await query(medicationsSql, filters)).recordset;
  return {
    async getAdrReportMedications(filters, today) {
      const rows = await readRows(filters);
      return {
        patient: patientFromRows(rows, filters.an),
        items: medicationItems(rows, today),
      };
    },
    async getAdrReportHistory(filters) {
      const rows = (await query(historySql, filters)).recordset;
      return rows.map((row) =>
        Object.fromEntries(
          [
            "hn",
            "patientnameTH",
            "createdate",
            "typeofadr",
            "destination",
            "AllergyGroupNm",
            "genericname",
            "ingredientname",
            "startadrddatetime",
            "adversereactions",
            "pharmacistnote",
            "onsetofadr",
            "unitonset",
            "naranjoscore",
            "propability",
            "policy",
            "pharmacyname",
            "username",
          ].map((key) => [
            key,
            key === "createdate" || key === "startadrddatetime"
              ? day(row[key])
              : text(row[key]),
          ]),
        ),
      );
    },
    async getAdrReportPdfData(filters, selections) {
      const rows = await readRows(filters);
      const patient = patientFromRows(rows, filters.an);
      if (!patient) throw reportError("ADR_SELECTION_CHANGED");
      const selected = selections.map(({ id, soi }) => {
        const matches = rows.filter((row) => text(row.meditemindex) === id);
        if (matches.length !== 1) throw reportError("ADR_SELECTION_CHANGED");
        return { ...matches[0], soi };
      });
      const allergies = (await query(allergiesSql, { hn: patient.hn }))
        .recordset;
      const first = rows[0];
      const address = [
        ["address", ""],
        ["moo", " ม."],
        ["tambol", " ต."],
        ["amp", " อ."],
        ["provname", " จ."],
      ]
        .map(([key, prefix]) =>
          text(first[key]) && text(first[key]) !== "-"
            ? prefix + text(first[key])
            : "",
        )
        .join("");
      return {
        patient: {
          ...patient,
          dob: day(first.patientdob),
          sex: text(first.sex),
          address,
          idcard: text(first.id_card),
          allergy: allergyText(allergies),
        },
        items: selected.map((row) => ({
          name: text(row.orderitemname),
          soi: row.soi,
          usage: [
            row.InstructionNameTH,
            row.dosage,
            row.DispensedUnitTH,
            row.frequency_nameTH,
            row.timeTH,
          ]
            .map(text)
            .filter(Boolean)
            .join(" "),
          start: day(row.startdate),
          end: day(row.enddate),
        })),
      };
    },
  };
}

module.exports = {
  medicationsSql,
  historySql,
  allergiesSql,
  medicationItems,
  allergyText,
  createAdrReportReader,
};
