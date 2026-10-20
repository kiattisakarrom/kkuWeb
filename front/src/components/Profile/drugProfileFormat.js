import { validProfileDate } from './drugProfileDates.js';

// frmDrugprofilectx always shows seven date headings from the start date,
// independently of the query's end date. Its daily cells are all empty.
export function drugProfileColumns(from) {
  return [
    ['_index', 'ลำดับ'],
    ['orderitemname', 'ชื่อยา'],
    ['frequencyTimedesc', 'เวลา'],
    ...Array.from({ length: 7 }, (_, offset) => {
      const date = validProfileDate(from)
        ? new Date(Date.parse(from) + offset * 86400000)
        : null;
      const label =
        date && date.getUTCFullYear() <= 9999
          ? `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCFullYear()).padStart(4, '0')}`
          : '';
      return [`day-${offset + 1}`, label];
    }),
  ];
}

export function drugProfileRows(items) {
  // Native CellPainting suppresses only consecutive identical names, without
  // deleting or combining the underlying rows (including different timecodes).
  return items.map((item, index) => {
    const name = String(item.orderitemname ?? '');
    return {
      _index: index + 1,
      orderitemname:
        index > 0 && name === String(items[index - 1].orderitemname ?? '')
          ? ''
          : name,
      frequencyTimedesc: String(item.frequencyTimedesc ?? ''),
    };
  });
}
