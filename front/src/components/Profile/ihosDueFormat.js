// Visible dgvDue columns from ucAddOrderdispense.Designer.vb. drugcode is
// hidden and inp_type is not a configured column in the Windows grid.
export const ihosDueColumns = [
  ['datetime', 'datetime', 150],
  ['statusText', 'สถานะ', 100],
  ['drugname', 'ชื่อยา', 200],
  ['confirm_inp_id', 'confirm_inp_id', 100],
  ['confirm', 'confirm', 120],
  ['confirm_date', 'confirm_date', 150],
  ['confirm_note', 'confirm_note', 100],
  ['request_note', 'request_note', 250],
];

export function ihosDueText(row, key) {
  if (key === 'statusText') {
    const status = String(row?.status ?? '');
    // jsondue starts with an empty label and handles only these three cases.
    // The API still retains raw codes/unknown labels for other consumers.
    return status === ''
      ? 'รออนุมัติ'
      : status === '1'
        ? 'อนุมัติ'
        : status === '2'
          ? 'ไม่อนุมัติ'
          : '';
  }
  // jsondue always inserts an empty confirmer name; do not infer a name.
  if (key === 'confirm') return '';
  return String(row?.[key] ?? '');
}
