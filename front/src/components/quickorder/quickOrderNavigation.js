const returnKeys = new Set([
  'orderdate',
  'roomCode',
  'screenStatus',
  'orderType',
  'workdate',
  'wardSelection',
  'selectedWard',
  'rx',
  'previewRx',
]);
const isPrescription = (value) => /^[A-Za-z0-9-]{1,20}$/.test(value);

export function quickOrderReturnQuery(query) {
  const next = new URLSearchParams();
  for (const [key, value] of query)
    if (returnKeys.has(key)) next.append(key, value);
  return next;
}

export function quickOrderPreview(query) {
  return query.getAll('previewRx').filter(isPrescription);
}

export function quickOrderPatientPath(
  row,
  query,
  { orderdate, roomCode, screenStatus, orderType, workdate }
) {
  if (!row.currentWardCode || !row.an || !isPrescription(row.prescriptionno))
    return '';
  const back = quickOrderReturnQuery(query);
  for (const [key, value] of Object.entries({
    orderdate,
    roomCode,
    screenStatus,
    orderType,
    workdate,
    rx: row.prescriptionno,
  }))
    back.set(key, value);
  const params = new URLSearchParams({
    wardCode: row.currentWardCode,
    orderdate,
    view: 'prescriptions',
    rxDate: workdate,
    rx: row.prescriptionno,
    fromQuickOrder: '1',
    quickReturn: back.toString(),
  });
  return `/ipd/patients/${encodeURIComponent(row.an)}?${params}`;
}

export function quickOrderReturnPath(query) {
  if (query.get('fromQuickOrder') !== '1') return '';
  // Only construct an internal fixed route; never navigate to a URL supplied
  // through query parameters. Keep repeated wards/preview IDs in native order.
  return `/ipd/quick-order?${quickOrderReturnQuery(new URLSearchParams(query.get('quickReturn') || ''))}`;
}
