export const adrColumns = [
  ['prioritycode', 'ประเภท', 70],
  ['soi', 'S,O,I', 70],
  ['orderitemcode', 'รหัสยา', 100],
  ['orderitemname', 'ชื่อยา', 300],
  ['dosage', 'Dose', 80],
  ['dosageunitcode', 'หน่วยย่อย', 85],
  ['orderqty', 'QTY', 80],
  ['orderunitcode', 'หน่วยขาย', 85],
  ['instructioncode', 'วิธีใช้', 85],
  ['frequencycode', 'ความถี่', 85],
  ['timecode', 'เวลา', 110],
  ['startdate', 'วันเริ่ม', 100],
  ['enddate', 'วันหยุดใช้', 100],
];
export const adrHistoryColumns = [
  ['hn', 'HN', 90],
  ['patientnameTH', 'ชื่อผู้ป่วย', 200],
  ['createdate', 'วันที่', 100],
  ['typeofadr', 'Type of ADR', 110],
  ['destination', 'ประวัติแพ้ยา', 120],
  ['AllergyGroupNm', 'กลุ่มยา', 160],
  ['genericname', 'genericname', 160],
  ['ingredientname', 'ingredientname', 160],
  ['startadrddatetime', 'วันที่เกิด', 100],
  ['adversereactions', 'อาการไม่พึงประสงค์', 220],
  ['pharmacistnote', 'Pharmacist note', 240],
  ['onsetofadr', 'Onset of ADR', 100],
  ['unitonset', 'หน่วยของ Onset', 110],
  ['naranjoscore', "Naranjo's score", 100],
  ['propability', 'Propability', 120],
  ['policy', 'Policy', 180],
  ['pharmacyname', 'ผู้ประเมิน', 160],
  ['username', 'ผู้บันทึก', 160],
];
export function adrDate(value, separator = '/') {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '')
    ? value.split('-').reverse().join(separator)
    : '';
}
export function validAdrRange(from, to) {
  const valid = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
    value >= '1753-01-01' &&
    value <= '9999-12-30' &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  return valid(from) && valid(to) && from <= to;
}
