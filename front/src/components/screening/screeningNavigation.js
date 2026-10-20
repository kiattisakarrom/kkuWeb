import { screeningModes } from './screeningModes.js';

export function allRobotWardsQuery(query) {
  const next = new URLSearchParams(query);
  next.set('mode', 'robot-wait');
  next.set('roomCode', 'all');
  for (const key of [
    'search',
    'wardCode',
    'rx',
    'workdate',
    'screenStatus',
    'orderType',
  ])
    next.delete(key);
  return next;
}

export function allTakeHomeWardsQuery(query, mode) {
  if (!['take-home-wait', 'take-home-finished'].includes(mode))
    throw new Error('Invalid Take-home mode');
  const next = allRobotWardsQuery(query);
  next.set('mode', mode);
  return next;
}

export function screeningPatientPath(
  row,
  {
    orderdate,
    search,
    wardCode = '',
    workdate,
    roomCode,
    screenStatus,
    orderType,
    mode = 'continue-wait',
  }
) {
  if (!row.currentWardCode) return '';
  const params = new URLSearchParams({
    wardCode: row.currentWardCode,
    orderdate,
    fromScreening: mode,
    screenDate: orderdate,
    screenSearch: search,
    screenWard: wardCode,
    screenRx: row.prescriptionno,
    screenRound: workdate,
  });
  if (roomCode) params.set('screenRoom', roomCode);
  if (mode === 'screen-all') {
    params.set('view', 'prescriptions');
    params.set('rxDate', workdate);
    params.set('rx', row.prescriptionno);
    params.set('screenStatus', screenStatus ?? 'pending');
    params.set('screenOrderType', orderType ?? 'all');
  }
  return `/ipd/patients/${encodeURIComponent(row.an)}?${params}`;
}

export function screeningReturnPath(query) {
  if (!Object.hasOwn(screeningModes, query.get('fromScreening'))) return '';
  const params = new URLSearchParams({ mode: query.get('fromScreening') });
  for (const [source, target] of [
    ['screenDate', 'orderdate'],
    ['screenSearch', 'search'],
    ['screenWard', 'wardCode'],
    ['screenRx', 'rx'],
    ['screenRound', 'workdate'],
    ['screenRoom', 'roomCode'],
    ['screenStatus', 'screenStatus'],
    ['screenOrderType', 'orderType'],
  ]) {
    if (query.get(source)) params.set(target, query.get(source));
  }
  return `/ipd/screening?${params}`;
}
