// Display calculations from ucAddOrderdispense.showpatientlab; never persist them.
function numeric(value) {
  if (value === null || value === undefined || String(value).trim() === "")
    return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function bangkokDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function clinicalSummary(row, now = new Date()) {
  if (!row) return row;
  const patient = { ...row, storedBsa: row.bsa, storedCrcl: row.Crcl };
  const sources = {};
  for (const key of [
    "scr",
    "eGFR",
    "wbc",
    "Neutrophil",
    "BandformNeutrophil",
  ]) {
    const value = row[`${key}LabValue`];
    const date = row[`${key}LabDate`];
    const hasRecent =
      value !== null && value !== undefined && String(value).trim() !== "";
    const storedEmpty =
      row[key] === null ||
      row[key] === undefined ||
      String(row[key]).trim() === "";
    if (
      hasRecent &&
      (storedEmpty ||
        !row.clinicalUpdatedAt ||
        new Date(date) > new Date(row.clinicalUpdatedAt))
    ) {
      patient[key] = value;
      sources[key] = { source: "lab", date };
    } else sources[key] = { source: "stored", date: row.clinicalUpdatedAt };
    delete patient[`${key}LabValue`];
    delete patient[`${key}LabDate`];
  }
  const weight = numeric(patient.weight);
  const height = numeric(patient.height);
  if (weight !== null) patient.weight = Math.abs(weight);
  const bsa =
    weight !== null && height !== null && height >= 0
      ? Math.sqrt((Math.abs(weight) * height) / 3600)
      : null;
  patient.bsa = bsa === null ? row.bsa : Number(bsa.toFixed(2));
  sources.bsa = {
    source: bsa === null ? "stored" : "calculated",
    date: row.clinicalUpdatedAt,
  };

  const today = bangkokDate(now);
  const birth = row.patientdob ? new Date(row.patientdob) : null;
  const dob =
    birth && Number.isFinite(birth.getTime())
      ? birth.toISOString().slice(0, 10)
      : "";
  let age = dob
    ? Number(today.slice(0, 4)) -
      Number(dob.slice(0, 4)) -
      (today.slice(5) < dob.slice(5) ? 1 : 0)
    : null;
  if (dob > today || !Number.isFinite(age)) age = null;
  const scr = numeric(patient.scr);
  let crcl = null;
  if (age !== null && age >= 0 && scr !== null && scr > 0) {
    if (age < 15 && height !== null && height >= 0)
      crcl = (0.413 * height) / scr;
    else if (
      age >= 15 &&
      weight !== null &&
      ["1", "2"].includes(String(patient.sex))
    )
      crcl =
        (((140 - age) * Math.abs(weight)) / (72 * scr)) *
        (String(patient.sex) === "2" ? 0.85 : 1);
  }
  patient.Crcl = crcl === null ? null : Number(Math.max(0, crcl).toFixed(2));
  sources.Crcl = { source: "calculated", date: sources.scr.date };
  const wbc = numeric(patient.wbc);
  const neutrophil = numeric(patient.Neutrophil);
  // Native formula intentionally excludes Band form; this is not a new formula.
  patient.ANC =
    wbc !== null && neutrophil !== null && wbc >= 0 && neutrophil >= 0
      ? Number((wbc * neutrophil * 10).toFixed(6))
      : null;
  sources.ANC = { source: "calculated", date: sources.wbc.date };
  patient.clinicalSources = sources;
  return patient;
}

module.exports = { clinicalSummary, bangkokDate, numeric };
