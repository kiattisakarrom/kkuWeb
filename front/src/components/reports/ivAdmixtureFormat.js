export const ivModes = {
  'ward-wait': { label: 'แยกหอผู้ป่วย', total: false, sent: false },
  'ward-sent': { label: 'ส่งหอผู้ป่วยแล้ว', total: false, sent: true },
  'total-wait': { label: 'รวมหอผู้ป่วย', total: true, sent: false },
  'total-sent': { label: 'ส่งรวมหอผู้ป่วยแล้ว', total: true, sent: true },
};
export const ivWardColumns = [
  ['name', 'หอผู้ป่วย', 200],
  ['count', 'จำนวน', 80],
];
export const ivDrugColumns = [
  ['orderitemcode', 'รหัสยา', 100],
  ['orderitemname', 'ชื่อยา', 350],
  ['dosage', 'Dose', 90],
  ['orderqty', 'QTY', 90],
  ['timecode', 'รหัสวิธีใช้', 90],
  ['freetext2', 'คำอธิบายวิธีใช้', 350],
];
export function ivDrugColumnsFor(mode) {
  return ivDrugColumns.map(([key, title, width]) => [
    key,
    title,
    ivModes[mode].total && ['orderitemname', 'freetext2'].includes(key)
      ? 400
      : width,
  ]);
}
// Windows allows duplicate basket rows; remove one entry at a time. Export SQL
// IN semantics still print each prescription once.
export function ivBasketAdd(basket, row) {
  return [
    ...basket,
    { ...row, entryId: Math.max(0, ...basket.map((item) => item.entryId)) + 1 },
  ];
}
export const ivPdfIds = (rows) => [...new Set(rows.map((row) => row.id))];
export function ivHeaderColumns(mode) {
  const { total, sent } = ivModes[mode];
  return [
    ['prescriptionno', 'ใบสั่งยา', 150],
    ['ordertype', sent && !total ? 'Ordertype' : 'ประเภทใบสั่งยา', 120],
    ['hn', 'HN', 120],
    ['an', 'AN', 120],
    ['patientname', 'ชื่อ - นามสกุล', 300],
    ...(total ? [['wardname', 'หอผู้ป่วย', 200]] : []),
    ['status', 'สถานะ', 100],
  ];
}
export function ivValidRange(filters) {
  const date = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
    value >= '1753-01-01' &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  const time = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '');
  return (
    date(filters.from) &&
    date(filters.to) &&
    time(filters.startTime) &&
    time(filters.endTime) &&
    `${filters.from} ${filters.startTime}` <= `${filters.to} ${filters.endTime}`
  );
}
