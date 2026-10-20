export const pharmacistNoteColumns = [
  'วันที่บันทึก',
  'ปัญหา',
  'เพิ่มเติม',
  'บันทึกโดย',
];

// clsnote.GetData_note formats Lastupdatedatetime as dd-MM-yyyy.
// Format the raw SQL datetime here to avoid running SQL FORMAT for every row.
export function pharmacistNoteDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getUTCDate()).padStart(2, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCFullYear()).padStart(4, '0')}`;
}

// frmNote.Getdata/CellClick copy the saved text as-is, including whitespace.
export const pharmacistNoteText = (value) => String(value ?? '');
