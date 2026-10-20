import { dateText, display } from './profileFormat.js';

export function allergyDrugText(row) {
  if (row.allergyGroupCode)
    return row.allergyGroup || `[${row.allergyGroupCode}]`;
  return row.genericNames?.length
    ? row.genericNames.join(', ')
    : row.genericname || row.allergyGroup || 'ไม่ระบุชื่อยา / กลุ่มยา';
}

export function allergySummaryText(rows) {
  if (!rows.length) return 'ไม่พบประวัติ ADR / แพ้ยาในฐานข้อมูลนี้';
  return rows
    .map((row, index) =>
      [
        `${index + 1}. ${dateText(row.startadrddatetime, true)} · ${row.typeLabel || row.typeofadr || 'ไม่ระบุชนิด ADR'} ${allergyDrugText(row)}`,
        `อาการ: ${display(row.adversereactions)} · ความน่าจะเป็น: ${display(row.propability)}`,
        row.allergyGroupCode && row.groupIngredients?.length
          ? `รายชื่อยาในกลุ่ม: ${row.groupIngredients.map((item) => item.name || `[${item.code}]`).join(', ')}`
          : '',
        row.policy ? `คำเตือนที่บันทึก: ${row.policy}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n\n');
}
