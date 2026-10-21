import { nativeText } from '../Profile/nativeProfileFormat.js';

export const medTransferItemColumns = [
  ['shelfname', 'ตำแหน่งยา', 100],
  ['orderitemcode', 'รหัสยา', 100],
  ['orderitemname', 'ชื่อยา', 250],
  ['orderqty', 'จำนวน', 70],
  ['orderunitcode', 'หน่วยขาย', 90],
  ['instructioncode', 'วิธีใช้', 80],
  ['frequencycode', 'ความถี่', 90],
  ['timecode', 'เวลา', 100],
];
export const medTransferWardColumns = [
  ['name', 'หอผู้ป่วย', 180],
  ['prescriptionCount', 'จำนวน', 70],
];
export const medTransferHeaderColumns = [
  ['prescriptionno', 'ใบสั่งยา', 140],
  ['ordertype', 'ประเภทใบสั่งยา', 110],
  ['hn', 'HN', 100],
  ['an', 'AN', 100],
  ['patientname', 'ชื่อ - นามสกุล', 230],
  ['_status', 'สถานะ', 130],
];
export const medTransferModes = [
  ['lookup', 'บรรจุยาเข้ารถเข็น'],
  ['status', 'สถานะบรรจุยาเข้ารถเข็น'],
];
export const medTransferStatuses = [
  ['pending', 'ยังไม่บรรจุยา'],
  ['transferred', 'บรรจุยาแล้ว'],
];
export const medTransferValue = (row, key) =>
  key === '_status'
    ? row.medtransferdatetime
      ? 'บรรจุยาแล้ว'
      : 'ยังไม่บรรจุยา'
    : nativeText(row[key]);
export function medTransferPrescription(value) {
  const parts = String(value ?? '')
    .trim()
    .split('|');
  const rx = parts.length === 2 ? parts[1] : parts.length === 1 ? parts[0] : '';
  return /^[A-Za-z0-9-]{1,20}$/.test(rx) ? rx : '';
}
export function medTransferLookupMessage(data) {
  if (data?.state === 'transferred')
    return 'ใบสั่งยานี้ได้ทำการบรรจุยาเข้ารถเข็นแล้ว';
  if (data?.state === 'notfound') return 'ไม่พบข้อมูลผู้ป่วย';
  if (data?.state === 'ready' && data.checkoutPending)
    return 'ใบสั่งยานี้ยังไม่ได้ทำการ Checkout รายการยา?';
  return '';
}
