import { drugProfileColumns, drugProfileRows } from './drugProfileFormat';

export default function DrugProfileTable({ from, rows }) {
  const columns = drugProfileColumns(from);
  const displayRows = drugProfileRows(rows);
  return (
    <div className="h-full overflow-auto bg-white">
      <table
        aria-label="ประวัติยา Drug Profile"
        className="w-full text-left text-xs"
      >
        <thead className="sticky top-0 z-10 bg-custom-r1">
          <tr>
            {columns.map(([key, title]) => (
              <th
                key={key}
                scope="col"
                className={`whitespace-nowrap border border-gray-300 px-2 py-1.5 ${key === 'orderitemname' ? 'min-w-[280px]' : ''}`}
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row) => (
            <tr key={row._index} className="hover:bg-blue-50">
              {columns.map(([key]) => (
                <td
                  key={key}
                  className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                >
                  {row[key] ?? ''}
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

DrugProfileTable.propTypes = {
  from: (props, key) =>
    typeof props[key] === 'string' ? null : new Error('from must be a string'),
  rows: (props, key) =>
    Array.isArray(props[key]) ? null : new Error('rows must be an array'),
};
