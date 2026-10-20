import highIcon from '../../../img/lab-high.png';
import lowIcon from '../../../img/lab-low.png';
import { nativeDate, nativeText } from './nativeProfileFormat';
import { flag } from './medicationProfileFormat';

// Column sets belong to each Windows grid. No inferred Off/Hold colouring or
// shared clinical classification is applied by this renderer.
export default function ProfileReadTable({
  label,
  columns,
  rows,
  text,
  cellStyle,
}) {
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
            <tr key={index} style={row.rowStyle}>
              {columns.map((column) => {
                const [key, , format] = column;
                const value = row[key];
                return (
                  <td
                    key={key}
                    style={cellStyle?.(row, key)}
                    className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                  >
                    {format === 'flag' ? (
                      <input
                        type="checkbox"
                        checked={flag(value)}
                        disabled
                        aria-label={`${key} รายการ ${index + 1}`}
                      />
                    ) : format === 'lab-flag' ? (
                      value === 'H' || value === 'L' ? (
                        <img
                          src={value === 'H' ? highIcon : lowIcon}
                          alt={value}
                          className="mx-auto h-5 w-5 object-contain"
                        />
                      ) : null
                    ) : format === 'long' ? (
                      <div
                        className="max-h-8 w-[280px] overflow-auto whitespace-pre-wrap break-words"
                        title={nativeText(value)}
                      >
                        {text ? text(row, column) : nativeText(value)}
                      </div>
                    ) : text ? (
                      text(row, column)
                    ) : ['date', 'iso-date', 'datetime', 'time'].includes(
                        format
                      ) ? (
                      nativeDate(value, format)
                    ) : (
                      nativeText(value)
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
                className="p-4 text-center text-gray-500"
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

ProfileReadTable.propTypes = {
  label: () => null,
  columns: () => null,
  rows: () => null,
  text: () => null,
  cellStyle: () => null,
};
