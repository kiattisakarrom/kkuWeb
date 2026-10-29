import { dateText } from '../Profile/profileFormat';
import { screeningValue } from './screeningColumns';
import PatientOpenButton from '../ipd/PatientOpenButton';

export default function ScreeningReadTable({
  label,
  columns,
  rows,
  selected,
  idKey,
  buttonKey,
  buttonKeys = [],
  onSelect,
  onOpen,
  emptyText,
}) {
  return (
    <table aria-label={label} className="w-full text-left text-xs">
      <thead className="sticky top-0 z-10 bg-custom-r1">
        <tr>
          {columns.map(([key, title]) => (
            <th
              key={key}
              className="whitespace-nowrap border border-gray-300 px-2 py-1"
            >
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={`${row[idKey] || ''}-${index}`}
            onClick={onSelect ? () => onSelect(row) : undefined}
            onDoubleClick={onOpen ? () => onOpen(row) : undefined}
            className={
              selected !== undefined && row[idKey] === selected
                ? 'bg-blue-100'
                : row.screenDay
                  ? 'bg-green-100'
                  : 'bg-white'
            }
          >
            {columns.map(([key, , format]) => {
              const value = screeningValue(row, key);
              const selectable =
                onSelect && (key === buttonKey || buttonKeys.includes(key));
              return (
                <td
                  key={key}
                  className={`whitespace-nowrap border border-gray-300 ${key === 'patientname' && onOpen ? 'p-0' : 'px-2 py-1.5'}`}
                >
                  {format === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      disabled
                      aria-label={
                        key === '_select'
                          ? `เลือกรายการ ${index + 1} (ดูข้อมูลเท่านั้น)`
                          : `Print รายการ ${index + 1} (ดูข้อมูลเท่านั้น)`
                      }
                    />
                  ) : key === 'patientname' && onOpen ? (
                    <PatientOpenButton
                      patient={row}
                      onOpen={onOpen}
                      className="px-2 py-1.5"
                    />
                  ) : selectable ? (
                    <button
                      type="button"
                      aria-pressed={row[idKey] === selected}
                      aria-label={
                        key === 'prescriptionCount'
                          ? `แสดงรายการหอผู้ป่วย ${row.name || row.code} จำนวน ${value}`
                          : undefined
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(row);
                      }}
                      className="w-full touch-manipulation text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      {String(value)}
                    </button>
                  ) : format === 'date' ? (
                    value ? (
                      dateText(value)
                    ) : (
                      ''
                    )
                  ) : (
                    String(value)
                  )}
                </td>
              );
            })}
          </tr>
        ))}
        {!rows.length && (
          <tr>
            <td
              colSpan={columns.length}
              role="status"
              className="p-3 text-gray-500"
            >
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

ScreeningReadTable.propTypes = {
  label: (p, k) =>
    typeof p[k] === 'string' ? null : new Error('label is required'),
  columns: (p, k) =>
    Array.isArray(p[k]) ? null : new Error('columns must be an array'),
  rows: (p, k) =>
    Array.isArray(p[k]) ? null : new Error('rows must be an array'),
  selected: () => null,
  idKey: () => null,
  buttonKey: () => null,
  buttonKeys: () => null,
  onSelect: () => null,
  onOpen: () => null,
  emptyText: () => null,
};
