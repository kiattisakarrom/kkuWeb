const { bangkokDate, numeric } = require("./ipdPatientClinical");

function day(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toISOString().slice(0, 10)
    : null;
}
function nextDay(value) {
  const date = new Date(value + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
const text = (value) =>
  value === null || value === undefined ? "" : String(value);
function timeText(detail, fallback) {
  const code = text(detail?.timedetailcode);
  return code
    ? `[${code.slice(0, 2)}:${code.slice(2, 4)}] ${text(detail.timedetailTH)}`
    : text(fallback);
}

// The Windows grid derives display rows here before any print/send action.
// This function returns values only and never generates jobs or changes records.
function screeningDisplayRows(items, timeDetails, mode, now = new Date()) {
  const home = mode === "take-home-wait" || mode === "take-home-finished";
  const today = bangkokDate(now);
  let takeDate = today; // Native retains this variable while iterating rows.
  const rows = [];
  const byTime = new Map();
  for (const detail of timeDetails) {
    const code = text(detail.timecode).trim();
    if (!byTime.has(code)) byTime.set(code, []);
    byTime.get(code).push(detail);
  }
  for (const item of items) {
    const dose = numeric(item.dosage) ?? 0,
      qty = numeric(item.orderqty) ?? 0;
    const machine = item.sendmachine === "Y",
      mix = item.sendmix === "Y";
    let print = text(item.configuredLocationCode) !== "1";
    let location = item.configuredLocation || "จัดมือ";
    if (item.drugUnused === "N") print = false;
    let administration = text(item.freetext1);
    const push = (timeCode = "", displayDose = item.dosage) => {
      if (rows.length >= 20000)
        throw Object.assign(new Error("Screening display row limit"), {
          code: "SCREENING_DISPLAY_LIMIT",
        });
      rows.push({
        ...item,
        displayTakeDate: takeDate,
        displayDose,
        administrationText: administration,
        displayPrint: print,
        locationName: location,
        displayTimeCode: text(timeCode),
      });
    };
    if (!machine) {
      if (mix) {
        print = ["1", "2"].includes(text(item.printstatus));
        location = "ส่งผลิด";
      }
      push();
      continue;
    }
    location = "JVM";
    print = text(item.instructioncode).includes("AW");
    if (text(item.frequencycode).includes("PRN")) {
      administration = "[ PRN ] " + text(item.timedesc);
      for (let index = 0; index <= qty - dose; index++) push("0007");
      continue;
    }
    const details = byTime.get(text(item.timecode).trim()) || [];
    if (!details.length) continue; // Native shows no JVM row without a time master.
    if (text(details[0].timetype) === "2") {
      administration = "[ PRN ] " + text(details[0].timedetailTH);
      push(details[0].timedetailcode);
      continue;
    }
    if (!home && item.statustimeend === "Y") {
      let keep = 0;
      for (const time of text(item.varymealtime).split(",")) {
        if (!/^\d+$/.test(time))
          throw Object.assign(new Error("Invalid saved screening time"), {
            code: "SCREENING_DISPLAY_DATA",
          });
        const value = Number(time),
          base = day(item.takedate) || today;
        if (keep < value) {
          takeDate = base;
          keep = value;
        } else
          takeDate = ["OD", "E24"].includes(item.frequencycode)
            ? base
            : nextDay(base);
        for (const detail of details)
          if (text(detail.timedetailcode) === time) {
            administration = timeText(detail, item.freetext1);
            push(time);
          }
      }
      continue;
    }
    const vary = text(item.varymeal).includes(",");
    const doses = text(item.varymeal).split(",");
    const times = text(item.varymealtime).split(",");
    let total = 0;
    const regularDate = (code) => {
      if (!home && !/^\d+$/.test(text(code)))
        throw Object.assign(new Error("Invalid saved screening time"), {
          code: "SCREENING_DISPLAY_DATA",
        });
      if (!home)
        takeDate =
          Number(code) <= 1459 && !["OD", "E24"].includes(item.frequencycode)
            ? nextDay(today)
            : today;
    };
    for (let index = 0; index < details.length; index++) {
      const detail = details[index];
      const amount = vary ? numeric(doses[index]) : dose;
      if (amount === null)
        throw Object.assign(new Error("Invalid saved varying dose"), {
          code: "SCREENING_DISPLAY_DATA",
        });
      total += amount;
      if (total > qty) continue;
      administration = timeText(detail, item.freetext1);
      if (vary) {
        for (let k = 0; k < times.length; k++)
          if (text(detail.timedetailcode) === times[k]) {
            if (numeric(doses[k]) === null)
              throw Object.assign(new Error("Invalid saved varying dose"), {
                code: "SCREENING_DISPLAY_DATA",
              });
            regularDate(times[k]);
            push(times[k], doses[k]);
          }
      } else {
        regularDate(detail.timedetailcode);
        push(detail.timedetailcode);
      }
    }
  }
  return rows.sort((a, b) => {
    // Native sorts hidden TimeCd, then its visible date (Stat/Continue only).
    const date = home ? 0 : a.displayTakeDate.localeCompare(b.displayTakeDate);
    return date || a.displayTimeCode.localeCompare(b.displayTimeCode);
  });
}
module.exports = { screeningDisplayRows };
