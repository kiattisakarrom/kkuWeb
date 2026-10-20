import { dateText } from './profileFormat.js';

const nativeText = (value) => String(value ?? '').trim();
export function pharmcareText(row, [key, , format]) {
  const value = nativeText(row?.[key]);
  if (format === 'preventable-code') {
    const code = nativeText(row?.Preventable);
    return ['0', '1'].includes(code) ? code : '';
  }
  if (format === 'preventable') {
    const code = nativeText(row?.Preventable);
    return code === '0' ? 'ป้องกันได้' : code === '1' ? 'ป้องกันไม่ได้' : '';
  }
  if (format === 'sex')
    return value === '1' ? 'ชาย' : value === '2' ? 'หญิง' : value;
  if (format === 'iso-date') {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }
  if (format === 'date' || format === 'datetime') {
    if (!value || Number.isNaN(new Date(value).getTime())) return '';
    return dateText(value, format === 'datetime');
  }
  return value;
}
