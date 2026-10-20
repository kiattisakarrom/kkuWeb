// Visible columns of frmShowLab.dgvlabresults, in Designer order and width.
export const labHistoryColumns = [
  ['lab_name', 'lab_name', 120],
  ['result', 'ผล', 120],
  ['type_result', '', 40],
  ['unit', 'unit', 110],
  ['minresult', 'minresult', 80],
  ['maxresult', 'maxresult', 80],
  ['date_res', 'date_res', 120],
  ['time_res', 'time_res', 120],
  ['remark', 'remark', 60],
  ['result_obj', 'result_obj', 250],
  ['name', 'ชื่อ', 200],
];

// Copy recorded values, including numeric text and whitespace, without
// interpreting the result against reference ranges or inventing defaults.
export const labHistoryText = (value) => String(value ?? '');
export const labHistoryFlag = (value) =>
  value === 'H' || value === 'L' ? value : '';
