import { dateText } from '../Profile/profileFormat';
import { screeningValue } from './screeningColumns';

export default function ScreeningReadTable({
  label,
  columns,
  rows,
  selected,
  idKey,
  buttonKey,
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
              return (
                <td
                  key={key}
                  className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
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
                  ) : key === buttonKey && onSelect ? (
                    <button
                      type="button"
                      aria-pressed={row[idKey] === selected}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(row);
                      }}
                      className="text-blue-800 underline"
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
  onSelect: () => null,
  onOpen: () => null,
  emptyText: () => null,
};
