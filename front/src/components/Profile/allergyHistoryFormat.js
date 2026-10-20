// ucPatientADR.dgvDetailADR visible columns; hidden IDs/master codes are
// retained in the API but are not added to the history viewer.
export const allergyHistoryColumns = [
  ['createdate', 'วันที่ลงข้อมูลในโปรแกรมเก่า'],
  ['typeofadr', 'Type of ADR'],
  ['destination', 'ข้อมูลประวัติแพ้ยา'],
  ['allergyGroup', 'รายการยาที่เกิด'],
  ['startadrddatetime', 'วันที่เกิด ADR (เลือกปฏิทิน)'],
  ['adversereactions', 'ข้อมูลอาการไม่พึงประสงค์'],
  ['pharmacistnote', 'Pharmacist note'],
  ['onsetofadr', 'Onset of ADR'],
  ['unitonset', 'หน่วยของ Onset'],
  ['naranjoscore', "Naranjo's score"],
  ['propability', 'Propability'],
  ['policy', 'Policy'],
  ['pharmacyname', 'เภสัชผู้ประเมิน'],
  ['username', 'ผู้บันทึกข้อมูล'],
];

export const allergyHistoryText = (value) => String(value ?? '');

export function allergyHistoryDate(value) {
  if (!value) return '';
  // Legacy createdate is also stored as yyyy-MM-dd HH:mm:ss text. SQL's
  // CONVERT(date, ...) keeps that calendar day; parsing it as browser-local
  // time and then reading UTC would incorrectly move midnight to yesterday.
  const literalDay =
    typeof value === 'string'
      ? /^(\d{4}-\d{2}-\d{2})(?:[T ]|$)/.exec(value)?.[1]
      : null;
  const date = new Date(literalDay ? `${literalDay}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return '';
  if (literalDay && date.toISOString().slice(0, 10) !== literalDay) return '';
  // clsPatient.get_admitSelect: FORMAT(..., 'd-MM-yyyy', 'TH-th').
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('th-TH-u-ca-buddhist-nu-latn', {
      timeZone: 'UTC',
      day: 'numeric',
      month: '2-digit',
      year: 'numeric',
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value])
  );
  return `${parts.day}-${parts.month}-${parts.year}`;
}

export function allergyHistoryCell(row, key) {
  return ['createdate', 'startadrddatetime'].includes(key)
    ? allergyHistoryDate(row?.[key])
    : allergyHistoryText(row?.[key]);
}
