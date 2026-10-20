// Keep SQL calendar values literal: converting local midnight to UTC can change
// the day. These are display formats, never instructions to update a record.
export const nativeText = (value) => String(value ?? '');

export function nativeDate(value, format = 'date') {
  if (!value) return '';
  if (value instanceof Date && Number.isNaN(value.getTime())) return '';
  let raw = value instanceof Date ? value.toISOString() : String(value);
  let parts =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(raw);
  if (!parts) {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    raw = date.toISOString();
    parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(raw);
  }
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = parts;
  const iso = `${year}-${month}-${day}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== iso
  )
    return '';
  if (format === 'iso-date') return iso;
  if (format === 'time') return `${hour}:${minute}:${second}`;
  if (format === 'short-date') return `${day}/${month}/${year.slice(-2)}`;
  const date = `${day}/${month}/${year}`;
  return format === 'datetime' ? `${date} ${hour}:${minute}:${second}` : date;
}

export function calendarDays(from, to) {
  const start = nativeDate(from, 'iso-date');
  const end = nativeDate(to, 'iso-date');
  return start && end
    ? Math.round((Date.parse(end) - Date.parse(start)) / 86400000)
    : null;
}

export const bangkokDay = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
