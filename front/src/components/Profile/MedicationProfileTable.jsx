import { useMemo } from 'react';
import {
  medicationColumns,
  medicationView,
  medicationCellStyle,
  medicationCellText,
  latestDueByDrug,
  flag,
} from './medicationProfileFormat';

export default function MedicationProfileTable({
  rows,
  workdate,
  due,
  selected,
  onSelect,
}) {
  const dueMap = useMemo(() => latestDueByDrug(due.data?.items), [due.data]);
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return (
    <div className="h-full overflow-auto bg-white">
      <table
        aria-label="Medication Profile ผู้ป่วย"
        className="w-full text-left text-xs"
      >
        <thead className="sticky top-0 z-10 bg-custom-r1">
          <tr>
            {medicationColumns.map(([key, title]) => (
              <th
                key={key}
                className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((record, index) => {
            const row = medicationView(
              record,
              workdate,
              dueMap.get(String(record.orderitemcode).trim()),
              today
            );
            return (
              <tr
                key={`${record.meditemindex}-${index}`}
                aria-selected={selected === record.meditemindex}
                style={row.rowStyle}
                className={
                  selected === record.meditemindex
                    ? 'outline outline-2 -outline-offset-2 outline-blue-700'
                    : ''
                }
              >
                {medicationColumns.map(([key, , format]) => (
                  <td
                    key={key}
                    style={medicationCellStyle(row, key)}
                    className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                    title={
                      key === 'dispenseText'
                        ? 'สถานะตามใบยาในรอบของโปรแกรมเดิม ไม่ใช่หลักฐานการให้ยาแก่ผู้ป่วย'
                        : key === 'orderitemnameView'
                          ? record.orderitemname
                          : undefined
                    }
                  >
                    {key === 'orderitemnameView' ? (
                      <button
                        type="button"
                        className="text-left underline decoration-dotted"
                        onClick={() => onSelect(record)}
                      >
                        {row.orderitemnameView || '—'}
                      </button>
                    ) : key === 'onlineText' && due.loading ? (
                      'กำลังโหลด…'
                    ) : key === 'onlineText' && due.error ? (
                      'โหลด DUE ไม่ได้'
                    ) : format === 'flag' ? (
                      <input
                        type="checkbox"
                        checked={flag(row[key])}
                        disabled
                        aria-label={`${key} รายการ ${index + 1}`}
                      />
                    ) : format === 'long' ? (
                      <div
                        className="max-h-8 w-[280px] overflow-auto whitespace-pre-wrap break-words"
                        title={String(row[key] ?? '')}
                      >
                        {medicationCellText(row, key, format, index)}
                      </div>
                    ) : (
                      medicationCellText(row, key, format, index)
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
          {!rows.length && (
            <tr>
              <td
                colSpan={medicationColumns.length}
                className="p-6 text-center text-gray-500"
              >
                ไม่พบข้อมูลตามเงื่อนไข
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

MedicationProfileTable.propTypes = {
  rows: (props, key) =>
    Array.isArray(props[key]) ? null : new Error('rows must be an array'),
  workdate: (props, key) =>
    typeof props[key] === 'string'
      ? null
      : new Error('workdate must be a string'),
  due: (props, key) => (props[key] ? null : new Error('due is required')),
  selected: () => null,
  onSelect: (props, key) =>
    typeof props[key] === 'function'
      ? null
      : new Error('onSelect must be a function'),
};
