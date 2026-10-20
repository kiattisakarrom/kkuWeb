import { nativeText, nativeDate } from '../Profile/nativeProfileFormat.js';

export const checkoutWardColumns = [
  ['_select', ''],
  ['name', 'หอผู้ป่วย'],
  ['prescriptionCount', 'จำนวน'],
];
export const checkoutHeaderColumns = [
  ['_select', ''],
  ['prescriptionno', 'ใบสั่งยา'],
  ['ordertype', 'ordertype'],
  ['hn', 'HN'],
  ['an', 'AN'],
  ['patientname', 'ชื่อ - นามสกุล'],
  ['_status', 'สถานะ'],
];
export const checkoutJvmColumns = [
  ['prioritydesc', 'ประเภท'],
  ['_drug', 'ชื่อยา'],
];
export const checkoutManualColumns = [
  ['_picture', 'รูปภาพ'],
  ['prioritydesc', 'ประเภท'],
  ['_drug', 'ชื่อยา'],
  ['numericOrderqty', 'จำนวนรวม'],
];
export const checkoutTabs = [
  ['jvm', 'ยาจัดจากเครือง JVM'],
  ['manual', 'ยาจัดมือ'],
  ['stat', 'ยา STAT'],
];
export const checkoutStatuses = [
  ['all', 'แสดงทั้งหมด'],
  ['pending', 'รอ Check Out'],
  ['finished', 'Check Out แล้ว'],
];
export const checkoutStatusText = (row) =>
  row.checkoutuserid != null && String(row.checkoutuserid) !== ''
    ? 'Checkout แล้ว'
    : 'รอ Checkout';
export function checkoutImageSource(images, row, packet) {
  const variants = images?.byDrug?.[row.orderitemcode];
  const key =
    variants?.[packet ? nativeText(packet.dosage) : ''] || variants?.[''];
  return images?.sources?.[key] || '';
}
export function checkoutDrugText(row) {
  return `${nativeText(row.orderitemname)}\n${[row.instructioncode, row.dosage, row.dosageunitcode, row.frequencycode, row.timecode].map(nativeText).join(' ')}\n${nativeText(String(row.prescriptionno || '').length >= 11 ? row.freetext2 : row.freetext1)}`;
}
export function checkoutTimeKey(time) {
  return JSON.stringify([
    nativeText(time.frequencyTime),
    nativeText(time.frequencyTimedesc),
    nativeDate(time.takeDay, 'iso-date'),
  ]);
}
export function checkoutPacket(row, time, packets) {
  return packets.find(
    (p) =>
      nativeText(p.itemindex) === nativeText(row.itemindex) &&
      nativeText(p.orderitemcode) === nativeText(row.orderitemcode) &&
      nativeText(p.frequencycode) === nativeText(row.frequencycode) &&
      nativeText(p.timecode) === nativeText(row.timecode) &&
      checkoutTimeKey(p) === checkoutTimeKey(time)
  );
}
export function checkoutRowStyle(row, completed, index) {
  if (row.category !== 'jvm') {
    if (String(row.printstatus) === '0') return { backgroundColor: '#d3d3d3' };
    if (completed) return { backgroundColor: '#90ee90' };
  }
  return { backgroundColor: index % 2 ? '#f5fffa' : 'white' };
}
export function checkoutAllergyText(rows) {
  return [
    ...new Set(
      rows.map((r) =>
        r.AllergyGroupCd
          ? nativeText(r.AllergyGroupNm)
          : `${nativeText(r.patadr)} ${nativeText(r.adversereactions)}`
      )
    ),
  ].join('\n');
}
