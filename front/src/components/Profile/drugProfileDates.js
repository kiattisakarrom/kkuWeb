const DAY_MS = 86400000;
export function validProfileDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= '1753-01-01' &&
    value <= '9999-12-31' &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

export function addProfileDays(day, count) {
  if (!validProfileDate(day)) return '';
  const result = new Date(
    Math.min(Date.parse('9999-12-31'), Date.parse(day) + count * DAY_MS)
  );
  return result.toISOString().slice(0, 10);
}
