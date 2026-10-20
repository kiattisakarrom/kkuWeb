import { nativeDate, nativeText, calendarDays } from './nativeProfileFormat.js';
import { medicationCellStyle, flag } from './medicationProfileFormat.js';

// ucMedicationHistory.dgvOrderPrescription, in Designer order. In particular
// group/timecount are hidden here, unlike Medication Profile.
export const prescriptionColumns = [
  ['dispenseText', 'สถานะ'],
  ['_select', '', 'flag'],
  ['printView', 'L', 'flag'],
  ['machineView', 'M', 'flag'],
  ['sendmix', 'V', 'flag'],
  ['sendchemo', 'C', 'flag'],
  ['sendtpn', 'T', 'flag'],
  ['approvalText', 'ใบอนุมัติ'],
  ['prioritycode', 'Type'],
  ['orderitemnameView', 'ชื่อยา'],
  ['activeView', ''],
  ['statuscal', 'วิธีคำนวน'],
  ['dosecal', 'คำนวน'],
  ['varymealView', 'จำนวนที่ใช้'],
  ['dosageunit', 'หน่วย'],
  ['instructioncode', 'วิธีใช้'],
  ['frequencycode', 'ความถี่'],
  ['timecode', 'เวลา'],
  ['orderqtyView', 'จำนวนจ่าย'],
  ['orderunit', 'หน่วยขาย'],
  ['firstdose', 'Firstdose'],
  ['startdate', 'วันที่เริ่ม', 'date'],
  ['enddate', 'วันสุดท้ายที่หยุดยา', 'date'],
  ['elapsedDays', 'จำนวนวัน'],
  ['price', 'ราคาต่อหน่วย'],
  ['totalprice', 'ราคารวม'],
  ['freetext2', 'วิธีใช้ยา', 'long'],
  ['offstatus', 'สถานะหยุดยา'],
  ['recorder', 'ผู้สั่ง'],
  ['language', 'language '],
  ['highalert', 'highalert '],
  ['shelfzone', 'shelfzone'],
  ['shelfname', 'shelfname'],
  ['varymealtime', 'varymealtime'],
  ['voiddatetime', 'voiddatetime', 'datetime'],
  ['takedate', 'วันที่กิน', 'iso-date'],
  ['itemindex', 'itemindex'],
  ['statusevent', 'statusevent'],
  ['tmtcode', 'tmtcode'],
  ['prescriptionnoView', 'ใบสั่งยา'],
  ['calprice', 'pricetype'],
  ['sendmixcode', 'dediluentcode'],
  ['diluentseq', 'dediluentstatus'],
  ['displaycolour', 'displaycolour'],
  ['meditemindex', 'meditemindex'],
  ['varymealstatus', 'varymealstatus'],
  ['diluentadd', 'AddUpto'],
  ['odddatetime', 'odddatetime', 'datetime'],
  ['oddday', 'คำนวนวันใช้ยา'],
  ['freetext3', 'freetext3', 'long'],
  ['paytype', 'paytype'],
  ['firsttimecount', 'firsttimecount'],
  ['DIDcode', 'DIDcode'],
  ['continuestatus', 'continuestatus'],
  ['holddatetime', 'holddatetime', 'datetime'],
  ['doctorcode', 'doctorcode'],
  ['doctorname', 'doctorname'],
  ['statustimeend', 'สถานะเวลาหยุด'],
  ['timestart', 'เวลาเริ่ม'],
  ['timeend', 'เวลาหยุดยา'],
  ['dayend', 'วัน'],
];
export const prescriptionHeaderLabels = [
  'ใบสั่งยา',
  'Type',
  'วันที่สั่ง',
  'เวลา',
  'ผู้บันทึก',
  'สถานะการจัดยา',
];
export const interactionColumns = [
  ['drugname', 'คู่ยา Drug Intereaction', 'long'],
  ['username', 'ผู้คีย์ยา'],
  ['screenusername', 'screenusername'],
];

export function prescriptionView(row, today) {
  const off = Boolean(row.voiddatetime);
  const printed = String(row.printstatus) === '1' && !off;
  const machine = String(row.sendmachine) === 'Y';
  const approvalHold = String(row.approvalStatus ?? '').includes('Hold');
  const startsToday = nativeDate(row.startdate, 'iso-date') === today;
  // showorderdetail counts from enddate when present (including a future end).
  const days = calendarDays(row.enddate || row.startdate, today);
  let backgroundColor = startsToday ? '#ffff80' : '#ffffff';
  if (row.screenPrescriptionNo) backgroundColor = '#b7ffbc';
  if (off) backgroundColor = '#d3d3d3';
  return {
    ...row,
    _select: false,
    printView: printed && !approvalHold,
    machineView: machine && !approvalHold,
    sendmix: String(row.sendmix) === 'Y',
    sendchemo: String(row.sendchemo) === 'Y',
    sendtpn: String(row.sendtpn) === 'Y',
    orderitemnameView: `${off ? '[OFF] ' : ''}${nativeText(row.orderitemname)}`,
    orderqtyView: off ? 0 : row.orderqty,
    varymealView:
      row.varymeal === null || row.varymeal === undefined || row.varymeal === ''
        ? row.dosage
        : row.varymeal,
    dispenseText: row.screenPrescriptionNo
      ? `จัดแล้ว :${row.screenPrescriptionNo}`
      : 'ยังไม่จัด',
    activeView: printed || machine ? '@' : '',
    approvalText: row.approvalStatus
      ? `${row.approvalStatus}:\n${nativeDate(row.approvalStart, 'short-date')}-${nativeDate(row.approvalEnd, 'short-date')}`
      : '-',
    elapsedDays: days === null ? '' : days + 1,
    statusevent: startsToday ? 'EDIT' : '',
    // This visible cell is populated with an empty string in Rows.Add.
    prescriptionnoView: '',
    rowStyle: {
      backgroundColor,
      color: printed || machine ? '#ff0000' : undefined,
    },
  };
}

export function prescriptionStyle(row, key) {
  if (key === 'activeView')
    return { backgroundColor: row.activeView ? '#ffff80' : '#ffffff' };
  if (key === 'highalert' || key === 'varymealView') return undefined;
  return medicationCellStyle(row, key);
}

export function prescriptionText(row, [key, , format]) {
  if (format === 'flag') return flag(row[key]);
  return ['date', 'iso-date', 'datetime'].includes(format)
    ? nativeDate(row[key], format)
    : nativeText(row[key]);
}
