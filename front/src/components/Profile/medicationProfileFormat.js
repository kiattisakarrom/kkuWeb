import { dateText } from './profileFormat.js';
import { nativeDate, nativeText } from './nativeProfileFormat.js';

export const medicationColumns = [
  ['dispenseText', 'สถานะ'],
  ['_select', '', 'flag'],
  ['groupdrug', 'group'],
  ['printView', 'L', 'flag'],
  ['machineView', 'M', 'flag'],
  ['sendmix', 'V', 'flag'],
  ['sendchemo', 'C', 'flag'],
  ['sendtpn', 'T', 'flag'],
  ['approvalText', 'ใบอนุมัติ'],
  ['onlineText', 'DUE Online'],
  ['MRC', 'MRC'],
  ['prioritycode', 'Type'],
  ['orderitemnameView', 'ชื่อยา'],
  ['activeView', ''],
  ['statuscal', 'วิธีคำนวน'],
  ['dosecal', 'คำนวน'],
  ['varymealView', 'จำนวนที่ใช้'],
  ['dosageunit', 'หน่วย'],
  ['instructioncode', 'วิธีใช้'],
  ['frequencycode', 'ความถี่'],
  ['timecode', 'เวลา'],
  ['orderqtyView', 'จำนวนจ่าย'],
  ['orderunit', 'หน่วยขาย'],
  ['firstdose', 'Firstdose'],
  ['startdate', 'วันที่เริ่ม', 'date'],
  ['enddate', 'วันสุดท้ายที่หยุดยา', 'date'],
  ['elapsedDays', 'จำนวนวัน'],
  ['price', 'ราคาต่อหน่วย'],
  ['totalprice', 'ราคารวม'],
  ['freetext2', 'วิธีใช้ยา'],
  ['offstatus', 'สถานะหยุดยา'],
  ['timecount', 'timecount'],
  ['recorder', 'ผู้สั่ง'],
  ['varymealtime', 'varymealtime'],
  ['voiddatetime', 'voiddatetime', 'datetime'],
  ['takedate', 'วันที่กิน', 'iso-date'],
  ['statusevent', 'statusevent'],
  ['tmtcode', 'tmtcode'],
  ['pricetype', 'pricetype'],
  ['sendmixcode', 'dediluentcode'],
  ['diluentstatus', 'dediluentstatus'],
  ['displaycolour', 'displaycolour'],
  ['varymealstatus', 'varymealstatus'],
  ['diluentadd', 'AddUpto'],
  ['odddatetime', 'odddatetime', 'datetime'],
  ['oddday', 'วันเว้นวัน'],
  ['freetext3', 'freetext3', 'long'],
  ['paytype', 'paytype'],
  ['firstdosestatus', 'firstdosestatus'],
  ['ordercreatedate', 'ordercreatedatetime', 'datetime'],
  ['firsttimecount', 'firsttimecount'],
  ['DIDcode', 'DIDcode'],
  ['continuestatus', 'continuestatus'],
  ['holddatetime', 'holddatetime', 'datetime'],
  ['doctorcode', 'doctorcode'],
  ['doctorname', 'doctorname'],
  ['statustimeend', 'สถานะเวลาหยุดยา'],
  ['timestart', 'เวลาเริ่ม'],
  ['timeend', 'เวลาหยุดยา'],
  ['dayend', 'วัน'],
];

export const flag = (value) =>
  ['Y', '1', 'true'].includes(String(value).trim());

export function drugNameColor(value) {
  if (
    typeof value !== 'string' ||
    !/^\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*$/.test(value)
  )
    return undefined;
  const [a, r, g, b] = value.split(',').map(Number);
  if ([a, r, g, b].some((part) => part < 0 || part > 255)) return undefined;
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

export function latestDueByDrug(items = []) {
  const map = new Map();
  for (const item of items) {
    const previous = map.get(String(item.drugcode).trim());
    if (!previous || String(item.confirm_date) > String(previous.confirm_date))
      map.set(String(item.drugcode).trim(), item);
  }
  return map;
}

function day(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    : null;
}

export function medicationView(row, workdate, online, today) {
  const off = Boolean(row.voiddatetime);
  const hold = Boolean(row.holddatetime);
  const approvalHold = String(row.approvalStatus || '').includes('Hold');
  const printed = flag(row.printstatus) && !off && !hold && !approvalHold;
  const machine = flag(row.sendmachine) && !off && !hold && !approvalHold;
  const name = row.orderitemENname || row.orderitemname || '';
  const start = day(row.startdate);
  const finish = day(row.enddate);
  const current = day(today);
  let backgroundColor = printed || machine ? '#afeeee' : '#ffffff';
  if (start !== null && start === day(workdate)) backgroundColor = '#ffff80';
  if (row.screenPrescriptionNo) backgroundColor = '#b7ffbc';
  if (off || hold) backgroundColor = '#d3d3d3';
  if (approvalHold) backgroundColor = '#ffffff';
  return {
    ...row,
    _select: false,
    statusevent: nativeDate(row.startdate, 'iso-date') === today ? 'EDIT' : '',
    orderitemnameView: `${off ? '[OFF] ' : hold && !approvalHold ? '[Hold] ' : ''}${name}`,
    varymealView:
      row.varymeal === null || row.varymeal === undefined || row.varymeal === ''
        ? row.dosage
        : row.varymeal,
    orderqtyView: off || hold ? 0 : row.orderqty,
    printView: printed,
    machineView: machine,
    activeView: printed || machine ? '@' : '',
    dispenseText: row.screenPrescriptionNo
      ? `จัดแล้ว :${row.screenPrescriptionNo}`
      : 'ยังไม่จัด',
    approvalText: row.approvalStatus
      ? `${row.approvalStatus}: ${dateText(row.approvalStart)} – ${dateText(row.approvalEnd)}`
      : '—',
    onlineText: online
      ? `${online.statusText}: ${online.confirm_date || '—'}`
      : '—',
    onlineStatus: online?.status,
    elapsedDays:
      start === null || current === null
        ? null
        : Math.floor(
            ((finish !== null && finish < current ? finish : current) - start) /
              86400000
          ) + 1,
    rowStyle: { backgroundColor },
  };
}

export function medicationCellStyle(row, key) {
  const backgrounds = {
    sendchemo: '#ffe4c4',
    sendtpn: '#ffe4c4',
    varymealView: '#ffe4e1',
    orderqtyView: '#ffe4e1',
    dosageunit: '#98fb98',
    orderunit: '#98fb98',
    instructioncode: '#f0fff0',
    frequencycode: '#f0fff0',
    timecode: '#f0fff0',
    prioritycode:
      { C: '#f0fff0', CS: '#ffa500', O: '#ffe4e1' }[row.prioritycode] ||
      '#ffffff',
  };
  if (key === 'approvalText') {
    const status = String(row.approvalStatus || '');
    return status.includes('Pass')
      ? { backgroundColor: '#7cfc00' }
      : status.includes('Hold')
        ? { backgroundColor: '#ff0000', color: '#ffffff' }
        : status.includes('Con')
          ? { backgroundColor: '#ffff00' }
          : { backgroundColor: '#ffffff' };
  }
  if (key === 'onlineText')
    return {
      backgroundColor:
        row.onlineStatus === '2'
          ? '#ff0000'
          : row.onlineStatus === '1'
            ? '#7cfc00'
            : row.onlineStatus === ''
              ? '#ffff00'
              : '#ffffff',
    };
  if (key === 'dispenseText' && row.screenPrescriptionNo)
    return { backgroundColor: '#d3d3d3' };
  if (key === 'orderitemnameView')
    return { color: drugNameColor(row.displaycolour) };
  if (key === 'highalert' && flag(row.highalert))
    return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
  return backgrounds[key] ? { backgroundColor: backgrounds[key] } : undefined;
}

export function medicationCellText(row, key, format, index) {
  if (key === '_index') return index + 1;
  if (format === 'date' || format === 'datetime')
    return nativeDate(row[key], format);
  if (format === 'iso-date') return nativeDate(row[key], format);
  return nativeText(row[key]);
}
