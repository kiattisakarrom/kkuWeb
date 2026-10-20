import { useState } from 'react';
import { useMatch, useSearchParams } from 'react-router-dom';
import { useIpdRead } from '../../services/useIpdRead';
import {
  pharmacistNoteColumns,
  pharmacistNoteDate,
  pharmacistNoteText,
} from './pharmacistNoteFormat';

export default function PharmacistNotes() {
  const an = useMatch('/ipd/patients/:an')?.params.an || '';
  const [query, setQuery] = useSearchParams();
  const [refresh, setRefresh] = useState(0);
  const base = `/ipd/patients/${encodeURIComponent(an)}/pharmacist-notes`;
  const scope = {
    wardCode: query.get('wardCode') || '',
    orderdate: query.get('orderdate') || '',
  };
  const list = useIpdRead(base, scope, refresh);
  const selectedId = query.get('pnId') || '';
  const selected = selectedId
    ? list.data?.notes.find((row) => row.id === selectedId)
    : null;
  const reload = () => setRefresh((value) => value + 1);
  const choose = (id) => {
    const next = new URLSearchParams(query);
    next.set('pnId', id);
    setQuery(next, { replace: true });
  };
  const readState = (resource) =>
    resource.loading ? (
      <p role="status" className="p-4 text-gray-500">
        กำลังโหลดบันทึกเภสัชกร…
      </p>
    ) : resource.error ? (
      <div role="alert" className="p-4 text-red-700">
        <p>{resource.error}</p>
        <button onClick={reload} className="mt-1 underline">
          ลองใหม่
        </button>
      </div>
    ) : null;
  return (
    <section
      aria-label="Note บันทึกเภสัชกร"
      className="flex min-h-0 flex-1 flex-col border border-gray-300 bg-white"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-1 border-b border-gray-300 bg-custom-r1 px-2 py-1.5">
        <div className="flex flex-wrap gap-x-3">
          <strong>Note · บันทึกเภสัชกรย้อนหลัง</strong>
          <p className="text-gray-600">
            ประวัติ HN นี้ทุก AN รวมครั้งก่อน · เลือกบันทึกเพื่ออ่านข้อความเต็ม
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="rounded border border-gray-400 bg-white px-3 py-1"
        >
          โหลดบันทึกใหม่
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto" aria-busy={list.loading}>
        {list.loading || list.error ? (
          readState(list)
        ) : (
          <table
            aria-label="ประวัติบันทึกเภสัชกร"
            className="w-full table-fixed text-left text-xs"
          >
            <thead className="sticky top-0 z-10 bg-custom-r1">
              <tr>
                {pharmacistNoteColumns.map((label, index) => (
                  <th
                    key={label}
                    scope="col"
                    style={{ width: ['12%', '34%', '34%', '20%'][index] }}
                    className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(list.data?.notes || []).map((row) => (
                <tr
                  key={row.id}
                  onClick={() => choose(row.id)}
                  className={
                    selected?.id === row.id
                      ? 'h-[100px] align-top bg-blue-600 text-white'
                      : 'h-[100px] cursor-pointer align-top hover:bg-blue-50'
                  }
                >
                  <td className="border border-gray-300 px-2 py-1.5 text-center">
                    <button
                      type="button"
                      aria-label={`อ่านบันทึก ${row.id}`}
                      aria-pressed={selected?.id === row.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        choose(row.id);
                      }}
                      className="focus:ring-2 focus:ring-blue-400"
                    >
                      {pharmacistNoteDate(row.updatedAt)}
                    </button>
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5">
                    <div className="max-h-[84px] overflow-hidden whitespace-pre-wrap break-words">
                      {pharmacistNoteText(row.problem)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5">
                    <div className="max-h-[84px] overflow-hidden whitespace-pre-wrap break-words">
                      {pharmacistNoteText(row.note)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5">
                    <div className="max-h-[84px] overflow-hidden whitespace-pre-wrap break-words">
                      {pharmacistNoteText(row.recorder)}
                    </div>
                  </td>
                </tr>
              ))}
              {!list.data?.notes.length && (
                <tr>
                  <td colSpan={4} className="p-5 text-center text-gray-500">
                    ไม่พบบันทึกเภสัชกรย้อนหลัง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div
        aria-label="รายละเอียดบันทึกเภสัชกร"
        aria-busy={list.loading}
        className="flex h-[40%] min-h-[100px] shrink-0 flex-col border-t border-gray-300 bg-amber-50/40 p-2"
      >
        {list.loading || list.error ? (
          <p role="status" className="p-3 text-gray-500">
            {list.loading
              ? 'กำลังโหลดประวัติบันทึก…'
              : 'โหลดประวัติไม่สำเร็จ กรุณาลองใหม่'}
          </p>
        ) : !selected ? (
          <p role="status" className="p-3 text-gray-500">
            {query.has('pnId')
              ? 'ไม่พบบันทึกที่เลือกในประวัติของผู้ป่วย กรุณาเลือกบันทึกใหม่'
              : 'เลือกบันทึกจากตารางด้านบนเพื่ออ่านปัญหาและรายละเอียดเพิ่มเติม'}
          </p>
        ) : (
          <>
            <div className="mb-1 flex shrink-0 flex-wrap gap-x-4 text-gray-600">
              <span>เลขบันทึก: {selected.id}</span>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
              <div className="flex min-h-0 flex-col gap-1">
                <label
                  htmlFor="pharmacist-note-problem"
                  className="font-semibold text-red-800"
                >
                  ปัญหา:
                </label>
                <textarea
                  id="pharmacist-note-problem"
                  aria-label="ปัญหาในบันทึกเภสัชกร"
                  readOnly
                  value={pharmacistNoteText(selected.problem)}
                  className="min-h-0 w-full flex-1 resize-none border border-gray-300 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div className="flex min-h-0 flex-col gap-1">
                <label
                  htmlFor="pharmacist-note-body"
                  className="font-semibold text-red-800"
                >
                  เพิ่มเติม:
                </label>
                <textarea
                  id="pharmacist-note-body"
                  aria-label="รายละเอียดเพิ่มเติมในบันทึกเภสัชกร"
                  readOnly
                  value={pharmacistNoteText(selected.note)}
                  className="min-h-0 w-full flex-1 resize-none border border-gray-300 bg-white px-2 py-1 text-xs"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex shrink-0 justify-between bg-black px-3 py-1.5 text-white">
        <p role="status">จำนวน {list.data?.notes.length ?? '—'} บันทึก</p>
        <span className="text-yellow-300">ดูข้อมูลเท่านั้น</span>
      </div>
    </section>
  );
}
