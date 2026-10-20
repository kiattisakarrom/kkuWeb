const { dayOffset } = require("./ipdScreening");

// ucMedicationHistory.checkscreenfinish uses the CURRENT Thai day, separately
// from the selected historical prescription round; its pre-08:00 start is 01:00.
function prescriptionStatusWindow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map(({ type, value }) => [type, value]),
  );
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  return Number(parts.hour) < 8
    ? { start: `${dayOffset(today, -1)} 01:00:00`, end: `${today} 07:59:00` }
    : { start: `${today} 08:00:00`, end: `${dayOffset(today, 1)} 07:59:00` };
}
module.exports = { prescriptionStatusWindow };
