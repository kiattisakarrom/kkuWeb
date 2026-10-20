import { nativeText } from './nativeProfileFormat.js';

// ucMedReconcile.dgvOrderdetail, not the editable transfer/basket grid.
export const reconcileColumns = [
  ['source', 'สถานะ'],
  ['_select', '', 'flag'],
  ['orderitemcode', 'รหัสยา'],
  ['orderitemnameView', 'ชื่อยา'],
  ['freetext2', 'วิธีใช้ยา', 'long'],
  ['orderqtyView', 'จำนวนจ่าย'],
  ['orderunit', 'หน่วย'],
  ['offstatus', 'สถานะหยุดยา'],
  ['recorderView', 'ผู้สั่ง'],
  ['varymealstatus', 'varymealstatus'],
  ['firstdosestatusView', 'firstdosestatus'],
];
export const reconcileHistoryHeaders = [
  'วันที่รับยา',
  'AN/VN',
  'สถานะ',
  '[ชื่อแพทย์]',
];

export function reconcileView(row, source) {
  const name =
    source === 'IPD'
      ? row.orderitemENname || row.orderitemname
      : row.orderitemname;
  return {
    ...row,
    source,
    _select: false,
    orderitemnameView: `${row.voiddatetime ? '[OFF] ' : ''}${nativeText(name)}`,
    orderqtyView: row.voiddatetime ? 0 : row.orderqty,
    recorderView: source === 'IPD' ? nativeText(row.recorder) : '',
    // Rows.Add explicitly leaves this visible field empty for all 3 sources.
    firstdosestatusView: '',
  };
}

export function reconcileDoctor(row) {
  return row.source === 'OPD' && row.doctorCode
    ? `[${row.doctorCode}]${nativeText(row.doctorname)}`
    : '';
}
