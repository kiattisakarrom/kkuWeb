function addDays(day, amount) {
  const value = new Date(`${day}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

function bangkokClock(now) {
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
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
  };
}

function defaultMedicationDate(calendarDay, now = new Date()) {
  const clock = bangkokClock(now);
  return calendarDay === clock.day && clock.hour < 8
    ? addDays(calendarDay, -1)
    : calendarDay;
}

function medicationWindow(day, now = new Date()) {
  const clock = bangkokClock(now);
  return {
    start: `${day} 08:00:00`,
    end: `${addDays(day, 1)} 07:59:00`,
    endDateCutoff:
      clock.hour < 8 && day === addDays(clock.day, -1) ? day : addDays(day, -1),
  };
}

module.exports = { medicationWindow, defaultMedicationDate };
