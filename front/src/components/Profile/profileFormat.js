export function display(value) {
  return value === null || value === undefined || value === ''
    ? '—'
    : String(value);
}

export function dateText(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

export function patientAge(dob, now = new Date()) {
  if (!dob) return '—';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '—';
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(now)
      .map(({ type, value }) => [type, value])
  );
  const today = new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))
  );
  if (birth > today) return '—';
  let totalMonths =
    (Number(parts.year) - birth.getUTCFullYear()) * 12 +
    Number(parts.month) -
    birth.getUTCMonth() -
    1;
  const anniversary = (months) => {
    const first = new Date(
      Date.UTC(birth.getUTCFullYear(), birth.getUTCMonth() + months, 1)
    );
    const lastDay = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)
    ).getUTCDate();
    return new Date(
      Date.UTC(
        first.getUTCFullYear(),
        first.getUTCMonth(),
        Math.min(birth.getUTCDate(), lastDay)
      )
    );
  };
  if (anniversary(totalMonths) > today) totalMonths -= 1;
  const days = Math.floor((today - anniversary(totalMonths)) / 86400000);
  return `${Math.floor(totalMonths / 12)} ปี ${totalMonths % 12} เดือน ${days} วัน`;
}
