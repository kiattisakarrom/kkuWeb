import { useSearchParams } from 'react-router-dom';
import {
  allergyHistoryColumns,
  allergyHistoryCell,
  allergyHistoryText,
} from './allergyHistoryFormat';

const longFields = new Set(['adversereactions', 'pharmacistnote', 'policy']);

export default function AllergyHistory({ resource, onRetry }) {
  const [query, setQuery] = useSearchParams();
  const rows = resource.data?.allergies || [];
  const selected = rows.find((row) => row.adrcode === query.get('adrId'));
  const choose = (id) => {
    const next = new URLSearchParams(query);
    next.set('adrId', id);
    setQuery(next, { replace: true });
  };
  return (
    <section
      aria-label="ประวัติแพ้ยาผู้ป่วย"
      className="flex min-h-0 flex-1 flex-col border border-gray-300 bg-white"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-1 border-b bg-custom-r1 px-2 py-1.5">
        <p>
          <strong>
            ประวัติ ADR / แพ้ยา ({resource.data ? rows.length : '—'})
          </strong>
          <span className="ml-3 text-gray-600">
            ประวัติ HN รวมครั้งก่อน · ดูข้อมูลที่บันทึกไว้
          </span>
        </p>
        <button
          onClick={onRetry}
          className="rounded border border-gray-400 bg-white px-3 py-1"
        >
          โหลดประวัติแพ้ยาใหม่
        </button>
      </div>
      {resource.loading ? (
        <p role="status" className="p-4 text-gray-500">
          กำลังโหลดประวัติแพ้ยา…
        </p>
      ) : resource.error ? (
        <div role="alert" className="p-4 text-red-700">
          <p>{resource.error}</p>
          <button onClick={onRetry} className="mt-1 underline">
            ลองใหม่
          </button>
        </div>
      ) : !rows.length ? (
        <p role="status" className="p-4 text-gray-500">
          ไม่พบประวัติ ADR / แพ้ยาในฐานข้อมูลนี้
        </p>
      ) : (
        <div className="flex min-h-0 flex-1">
          <aside
            aria-label="เลือกรายการประวัติแพ้ยา"
            className="flex w-[32%] min-w-[300px] flex-col border-r border-gray-300"
          >
            <div className="min-h-0 flex-1 overflow-auto">
              <table
                aria-label="ประวัติแพ้ยาที่บันทึก"
                className="w-[1400px] table-fixed text-left text-xs"
              >
                <colgroup>
                  {allergyHistoryColumns.map(([key]) => (
                    <col key={key} style={{ width: 100 }} />
                  ))}
                </colgroup>
                <thead className="sticky top-0 z-10 bg-custom-r1">
                  <tr>
                    {allergyHistoryColumns.map(([key, label]) => (
                      <th
                        key={key}
                        scope="col"
                        className="h-10 border border-gray-300 px-2 py-1"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.adrcode}
                      aria-selected={selected === row}
                      onClick={() => choose(row.adrcode)}
                      className={`cursor-pointer ${selected === row ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
                    >
                      {allergyHistoryColumns.map(([key], index) => (
                        <td
                          key={key}
                          title={allergyHistoryCell(row, key)}
                          className="h-[30px] overflow-hidden text-ellipsis whitespace-nowrap border border-gray-300 px-2 py-1"
                        >
                          {index === 0 ? (
                            <button
                              type="button"
                              aria-label={`เลือกประวัติ ADR ${row.adrcode}`}
                              aria-pressed={selected === row}
                              onClick={(event) => {
                                event.stopPropagation();
                                choose(row.adrcode);
                              }}
                              className="block max-w-full truncate text-left underline"
                            >
                              {allergyHistoryCell(row, key)}
                            </button>
                          ) : (
                            allergyHistoryCell(row, key)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="shrink-0 border-t bg-blue-50 p-1 text-xs text-gray-600">
              เลือกแถวเพื่ออ่านรายละเอียด · เลื่อนตารางแนวนอนเพื่อดูทุกคอลัมน์
            </p>
          </aside>
          <div
            aria-label="รายละเอียดประวัติแพ้ยา"
            className="min-h-0 min-w-0 flex-1 overflow-auto bg-amber-50/40 p-2"
          >
            {!selected ? (
              <p role="status" className="p-3 text-gray-500">
                {query.get('adrId')
                  ? 'ไม่พบรายการที่เลือกในประวัติของผู้ป่วยนี้ กรุณาเลือกรายการใหม่'
                  : 'เลือกรายการทางซ้ายเพื่ออ่านรายละเอียดประวัติแพ้ยา'}
              </p>
            ) : (
              <>
                <p className="mb-1 font-bold">
                  {[selected.typeofadr, selected.allergyGroup]
                    .filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ''
                    )
                    .join(' · ')}
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {allergyHistoryColumns
                    .filter(([key]) => !longFields.has(key))
                    .map(([key, label]) => (
                      <label key={key} className="flex min-w-0 flex-col">
                        <span className="text-gray-600">{label}</span>
                        <input
                          readOnly
                          aria-label={`ADR ${label}`}
                          value={allergyHistoryCell(selected, key)}
                          className="min-w-0 border border-gray-300 bg-white px-1 py-0.5"
                        />
                      </label>
                    ))}
                </div>
                <div className="mt-2 border border-gray-300 bg-white">
                  <table
                    aria-label="Generic Name ที่บันทึกในประวัติ ADR"
                    className="w-full text-left text-xs"
                  >
                    <thead className="bg-custom-r1">
                      <tr>
                        <th
                          scope="col"
                          className="border-b border-gray-300 px-2 py-1"
                        >
                          Generic Name
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.genericNames || []).map((name, index) => (
                        <tr key={index}>
                          <td className="whitespace-pre-wrap break-words border-b border-gray-200 px-2 py-1">
                            {allergyHistoryText(name)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {allergyHistoryColumns
                    .filter(([key]) => longFields.has(key))
                    .map(([key, label]) => (
                      <label key={key} className="flex min-w-0 flex-col">
                        <span className="text-gray-600">{label}</span>
                        <textarea
                          readOnly
                          aria-label={`ADR ${label}`}
                          value={allergyHistoryCell(selected, key)}
                          className="h-20 w-full resize-y border border-gray-300 bg-white p-1"
                        />
                      </label>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

AllergyHistory.propTypes = {
  resource: (props, key) =>
    props[key] && typeof props[key] === 'object'
      ? null
      : new Error('resource must be an object'),
  onRetry: (props, key) =>
    typeof props[key] === 'function'
      ? null
      : new Error('onRetry must be a function'),
};
