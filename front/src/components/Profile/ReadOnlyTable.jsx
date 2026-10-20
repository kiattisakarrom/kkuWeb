import { dateText, display } from './profileFormat';

export default function ReadOnlyTable({ label, columns, rows }) {
  return (
    <div className="h-full overflow-auto bg-white">
      <table aria-label={label} className="w-full text-left text-xs">
        <thead className="sticky top-0 z-10 bg-custom-r1">
          <tr>
            {columns.map(([key, title]) => (
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
          {rows.map((row, index) => (
            <tr
              key={`${row.meditemindex || row.DRPItemNo || row.lab_no || ''}-${index}`}
              className={
                row.voiddatetime
                  ? 'bg-red-50 text-red-800'
                  : row.holddatetime
                    ? 'bg-yellow-50'
                    : 'hover:bg-blue-50'
              }
            >
              {columns.map(([key, , format]) => (
                <td
                  key={key}
                  className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                >
                  {key === '_index'
                    ? index + 1
                    : format === 'date'
                      ? dateText(row[key])
                      : format === 'datetime'
                        ? dateText(row[key], true)
                        : display(row[key])}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td
                colSpan={columns.length}
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

ReadOnlyTable.propTypes = {
  label: (props, key) =>
    typeof props[key] === 'string' ? null : new Error('label must be a string'),
  columns: (props, key) =>
    Array.isArray(props[key]) ? null : new Error('columns must be an array'),
  rows: (props, key) =>
    Array.isArray(props[key]) ? null : new Error('rows must be an array'),
};
