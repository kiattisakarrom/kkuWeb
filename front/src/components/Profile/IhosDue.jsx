import { useState } from 'react';
import { ihosDueColumns as columns, ihosDueText } from './ihosDueFormat';

export default function IhosDue({ resource, onRetry }) {
  const [selection, setSelection] = useState(null);
  const rows = resource.data?.items || [];
  const selected =
    selection?.data === resource.data ? rows[selection.index] : null;
  if (resource.loading)
    return (
      <p role="status" className="p-4 text-gray-500">
        กำลังโหลด IHOS DUE…
      </p>
    );
  if (resource.error)
    return (
      <div role="alert" className="p-3 text-red-700">
        <p>{resource.error}</p>
        <button onClick={onRetry} className="mt-2 underline">
          ลองใหม่
        </button>
      </div>
    );
  return (
    <div className="flex min-h-0 flex-1 flex-col text-xs">
      <div className="flex shrink-0 items-center justify-between border-b bg-blue-50 p-1 text-gray-600">
        <span>รายการใน AN นี้ · ดูข้อมูลเท่านั้น</span>
        <button
          onClick={onRetry}
          className="shrink-0 px-1 text-blue-800 underline"
        >
          โหลดใหม่
        </button>
      </div>
      <div className="min-h-[60px] flex-1 overflow-auto">
        <table
          aria-label="IHOS DUE ผู้ป่วย"
          className="min-w-full table-fixed text-left"
          style={{
            width: columns.reduce((total, [, , width]) => total + width, 0),
          }}
        >
          <colgroup>
            {columns.map(([key, , width]) => (
              <col key={key} style={{ width }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-custom-r1">
            <tr>
              {columns.map(([key, label]) => (
                <th
                  key={key}
                  scope="col"
                  className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                aria-selected={selected === row}
                onClick={() => setSelection({ data: resource.data, index })}
                className={`cursor-pointer ${selected === row ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
              >
                {columns.map(([key]) => (
                  <td
                    key={key}
                    title={ihosDueText(row, key)}
                    className="border border-gray-300 p-0 align-top"
                  >
                    <div className="h-[30px] overflow-hidden whitespace-pre-wrap break-words px-2 py-1">
                      {key === 'datetime' ? (
                        <button
                          onClick={() =>
                            setSelection({ data: resource.data, index })
                          }
                          aria-label={`อ่าน IHOS DUE รายการที่ ${index + 1}`}
                          className="underline"
                        >
                          {ihosDueText(row, key)}
                        </button>
                      ) : (
                        ihosDueText(row, key)
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  colSpan={columns.length}
                  role="status"
                  className="p-4 text-center text-gray-500"
                >
                  ไม่พบรายการ IHOS DUE ที่บันทึกใน AN นี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selected ? (
        <div className="max-h-[60%] shrink-0 overflow-auto border-t border-gray-300 bg-blue-50 p-1">
          <div className="flex items-start justify-between gap-1">
            <p className="whitespace-pre-wrap font-bold">
              {ihosDueText(selected, 'drugname')} ·{' '}
              {ihosDueText(selected, 'statusText')}
            </p>
            <button
              onClick={() => setSelection(null)}
              aria-label="ปิดรายละเอียด IHOS DUE"
              className="shrink-0 text-blue-800 underline"
            >
              ปิด
            </button>
          </div>
          <p>
            ผู้พิจารณา: {ihosDueText(selected, 'confirm_inp_id')} ·{' '}
            {ihosDueText(selected, 'confirm_date')}
          </p>
          {[
            ['เหตุผลขอใช้ยา', selected.request_note],
            ['ผลพิจารณา', selected.confirm_note],
          ].map(([label, value]) => (
            <label key={label} className="block">
              <span>{label}</span>
              <textarea
                readOnly
                aria-label={`IHOS DUE ${label}`}
                value={String(value ?? '')}
                className="block h-12 w-full resize-y border border-gray-300 bg-white p-1"
              />
            </label>
          ))}
        </div>
      ) : rows.length ? (
        <p className="shrink-0 border-t p-1 text-gray-500">
          เลือกแถวหรือกดวันที่เพื่ออ่านข้อความเต็ม ·
          เลื่อนตารางไปทางขวาเพื่อดูทุกช่อง
        </p>
      ) : null}
    </div>
  );
}

IhosDue.propTypes = {
  resource: (props, key) =>
    props[key] && typeof props[key] === 'object'
      ? null
      : new Error('resource must be an object'),
  onRetry: (props, key) =>
    typeof props[key] === 'function'
      ? null
      : new Error('onRetry must be a function'),
};
