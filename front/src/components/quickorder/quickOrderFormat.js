import { nativeDate, nativeText } from '../Profile/nativeProfileFormat.js';

// ucScreenAll with changquickmode=True: rd1 and technical fields are hidden.
export const quickOrderColumns = [
  ['_select', '', 40],
  ['prescriptionno', 'ใบสั่งยา', 140],
  ['orderDay', 'วันที่', 70],
  ['ordertype', 'ประเภท', 60],
  ['hn', 'HN', 90],
  ['an', 'AN', 90],
  ['patientname', 'ชื่อ - นามสกุล', 200],
  ['wardname', 'หอผู้ป่วย', 100],
  ['_status', 'สถานะใบสั่งยา', 100],
];
export const quickOrderWardColumns = ['', 'หอผู้ป่วย', 'จำนวน'];
export const quickOrderPreviewColumns = ['เลขที่ใบสั่งยา', 'ลบ'];
export const quickOrderTypes = [
  ['all', 'ทั้งหมด'],
  ['0', '0'],
  ['3', '3'],
  ['stat', 'stat'],
];
export const quickOrderStatuses = [
  ['all', 'ทั้งหมด'],
  ['pending', 'ยังไม่จ่าย'],
  ['screened', 'จ่ายแล้ว'],
];

export function quickOrderValue(row, key) {
  if (key === 'orderDay') return nativeDate(row.orderDay);
  if (key === '_status') return row.screenDay ? 'Screen แล้ว' : 'รอ Screen';
  return nativeText(row[key]);
}

// null = initial all-ward view; [] = explicitly unchecked all wards. Keeping
// those distinct matches native initial load vs clicking off the last ward.
export function quickOrderVisibleRows(rows, selectedWards) {
  if (selectedWards === null) return rows;
  const selected = new Set(selectedWards);
  return rows.filter((row) => selected.has(row.wardcode));
}
