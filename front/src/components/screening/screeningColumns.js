const select = ['_select', '', 'checkbox'];
const date = ['orderDay', 'วันที่', 'date'];
const prescription = ['prescriptionno', 'ใบสั่งยา'];
const demographics = [
  ['ordertype', 'ประเภท'],
  ['hn', 'HN'],
  ['an', 'AN'],
  ['patientname', 'ชื่อ - นามสกุล'],
  ['wardname', 'หอผู้ป่วย'],
];

export function screeningColumns(mode) {
  const home = mode === 'take-home-wait' || mode === 'take-home-finished';
  const all = mode === 'screen-all';
  const robot = mode === 'robot-wait';
  return {
    wards: [select, ['_ward', 'หอผู้ป่วย'], ['prescriptionCount', 'จำนวน']],
    headers: all
      ? [
          select,
          prescription,
          date,
          ...demographics,
          ['_status', 'สถานะใบสั่งยา'],
        ]
      : [
          select,
          date,
          demographics[0],
          prescription,
          ...demographics.slice(1),
          ['_blank', 'STS'],
          ['_status', 'สถานะใบสั่งยา'],
          ...(!home && !robot ? [['fromlocationname', 'ห้อง']] : []),
        ],
    items:
      all || robot
        ? []
        : [
            select,
            ...(!home ? [['displayTakeDate', 'วันที่กินยา', 'date']] : []),
            ['administrationText', 'เวลารับประทาน'],
            ['orderitemcode', 'รหัสยา'],
            ['orderitemname', 'ชื่อยา'],
            ['displayDose', 'Dose'],
            ['orderqty', 'QTY'],
            ['timecode', 'รหัสวิธีใช้'],
            ['freetext2', 'คำอธิบายวิธีใช้'],
            ...(home ? [['_blank', 'STS']] : []),
            ['locationName', 'ที่เก็บยา'],
            ['displayPrint', 'Print', 'checkbox'],
            ...(!home ? [['fromlocationname', 'ห้อง']] : []),
          ],
  };
}

export function screeningValue(row, key) {
  if (key === '_select') return false;
  if (key === '_blank') return '';
  if (key === '_ward') return `[ ${row.code} ]${row.name || ''}`;
  if (key === '_status') return row.screenDay ? 'Screen แล้ว' : 'รอ Screen';
  return row[key] ?? '';
}
