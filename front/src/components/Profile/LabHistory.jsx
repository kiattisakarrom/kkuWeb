import { useState } from 'react';
import { useMatch, useSearchParams } from 'react-router-dom';
import { useIpdRead } from '../../services/useIpdRead';
import { addProfileDays, validProfileDate } from './drugProfileDates';
import {
  labHistoryColumns as columns,
  labHistoryFlag,
  labHistoryText,
} from './labHistoryFormat';
import labHigh from '../../../img/lab-high.png';
import labLow from '../../../img/lab-low.png';

function defaultRange() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value])
  );
  const to = `${parts.year}-${parts.month}-${parts.day}`;
  return { from: addProfileDays(to, -7), to };
}

export default function LabHistory() {
  const an = useMatch('/ipd/patients/:an')?.params.an || '';
  const [query, setQuery] = useSearchParams();
  const [defaults] = useState(defaultRange);
  const [refresh, setRefresh] = useState(0);
  const [formError, setFormError] = useState('');
  const [selection, setSelection] = useState(null);
  const from = query.get('labFrom') ?? defaults.from;
  const to = query.get('labTo') ?? defaults.to;
  const rangeValid =
    validProfileDate(from) && validProfileDate(to) && from <= to;
  const scope = {
    wardCode: query.get('wardCode') || '',
    orderdate: query.get('orderdate') || '',
    from,
    to,
  };
  const base = `/ipd/patients/${encodeURIComponent(an)}/lab-history`;
  const dates = useIpdRead(`${base}/dates`, scope, refresh, rangeValid);
  const chosenDate =
    dates.data?.dates.find((row) => row.date === query.get('labDate'))?.date ||
    '';
  const results = useIpdRead(
    `${base}/results`,
    { ...scope, date: chosenDate },
    refresh,
    Boolean(chosenDate)
  );
  const current = results.data?.date === chosenDate ? results.data : null;
  const selected =
    current && selection?.data === current
      ? current.items[selection.index]
      : null;
  const reload = () => setRefresh((value) => value + 1);
  const applyDates = (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const draftFrom = values.get('from');
    const draftTo = values.get('to');
    if (
      !validProfileDate(draftFrom) ||
      !validProfileDate(draftTo) ||
      draftFrom > draftTo
    ) {
      setFormError('กรุณาเลือกวันที่เริ่มต้นไม่เกินวันที่สิ้นสุด');
      return;
    }
    setFormError('');
    const next = new URLSearchParams(query);
    next.set('labFrom', draftFrom);
    next.set('labTo', draftTo);
    next.delete('labDate');
    setQuery(next, { replace: true });
    reload();
  };
  const chooseDate = (date) => {
    const next = new URLSearchParams(query);
    next.set('labFrom', from);
    next.set('labTo', to);
    next.set('labDate', date);
    setQuery(next, { replace: true });
  };
  const readState = (resource) =>
    resource.loading ? (
      <p role="status" className="p-3 text-gray-500">
        กำลังโหลดประวัติ LAB…
      </p>
    ) : resource.error ? (
      <div role="alert" className="p-3 text-red-700">
        <p>{resource.error}</p>
        <button onClick={reload} className="mt-1 underline">
          ลองใหม่
        </button>
      </div>
    ) : null;

  return (
    <section
      aria-label="ประวัติ LAB ผู้ป่วย"
      className="flex min-h-0 flex-1 flex-col border border-gray-300 bg-white"
    >
      <div className="shrink-0 border-b border-gray-300 bg-custom-r1 px-2 py-1">
        <form
          key={`${from}:${to}`}
          onSubmit={applyDates}
          aria-label="ค้นหาประวัติ LAB"
          className="flex flex-wrap items-center gap-2"
        >
          <strong>LAB Results</strong>
          <label className="flex items-center gap-1">
            วันที่ตรวจตั้งแต่
            <input
              required
              name="from"
              type="date"
              aria-label="วันที่เริ่มต้น LAB"
              min="1753-01-01"
              max="9999-12-31"
              defaultValue={from}
              className="border border-gray-300 bg-white px-1 py-1"
            />
          </label>
          <label className="flex items-center gap-1">
            ถึง
            <input
              required
              name="to"
              type="date"
              aria-label="วันที่สิ้นสุด LAB"
              min="1753-01-01"
              max="9999-12-31"
              defaultValue={to}
              className="border border-gray-300 bg-white px-1 py-1"
            />
          </label>
          <button
            type="submit"
            className="rounded border border-gray-400 bg-white px-3 py-1"
          >
            ค้นหา LAB
          </button>
          <button
            type="button"
            onClick={reload}
            disabled={!rangeValid}
            className="rounded border border-gray-400 bg-white px-3 py-1 disabled:opacity-50"
          >
            โหลด LAB ใหม่
          </button>
          <span className="text-gray-600">
            ประวัติ HN รวมครั้งก่อน · ดูข้อมูลเท่านั้น
          </span>
        </form>
        {(formError || !rangeValid) && (
          <p role="alert" className="text-red-700">
            {formError || 'ช่วงวันที่ LAB ไม่ถูกต้อง กรุณาเลือกใหม่'}
          </p>
        )}
      </div>
      <div className="flex min-h-0 flex-1">
        <aside
          aria-label="เลือกวันที่ตรวจ LAB"
          className="flex w-[180px] shrink-0 flex-col border-r border-gray-300"
        >
          <h2 className="shrink-0 border-b bg-blue-50 px-2 py-1 font-bold">
            วันที่ล่าสุด ({dates.data?.dates.length ?? '—'})
          </h2>
          <div className="min-h-0 flex-1 overflow-auto">
            {dates.loading || dates.error
              ? readState(dates)
              : (dates.data?.dates || []).map((row) => (
                  <button
                    key={row.date}
                    type="button"
                    aria-pressed={chosenDate === row.date}
                    onClick={() => chooseDate(row.date)}
                    className={`block w-full border-b border-gray-200 px-2 py-2 text-left ${chosenDate === row.date ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
                  >
                    {row.date}
                  </button>
                ))}
            {dates.data && !dates.data.dates.length && (
              <p role="status" className="p-3 text-gray-500">
                ไม่พบผล LAB ในช่วงวันที่เลือก
              </p>
            )}
          </div>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="shrink-0 border-b bg-blue-50 px-2 py-1 text-gray-600">
            {chosenDate
              ? `ผลตรวจวันที่ ${chosenDate} · ${current?.items.length ?? '—'} รายการ`
              : 'เลือกวันที่ทางซ้ายเพื่อดูผลตรวจ'}
            <span className="ml-3">
              ลูกศร H/L ตามค่าที่บันทึก · เลือกผลตรวจเพื่ออ่านข้อความเต็ม
            </span>
          </div>
          <div
            aria-busy={results.loading}
            className="min-h-[60px] flex-1 overflow-auto"
          >
            {dates.loading || dates.error || !rangeValid ? (
              <p role="status" className="p-3 text-gray-500">
                {dates.loading
                  ? 'กำลังโหลดวันที่ตรวจ…'
                  : 'เลือกช่วงวันที่หรือโหลดประวัติใหม่'}
              </p>
            ) : !chosenDate ? (
              <p role="status" className="p-3 text-gray-500">
                {query.get('labDate')
                  ? 'วันที่ที่เลือกไม่มีผลตรวจในช่วงนี้ กรุณาเลือกวันที่ใหม่'
                  : 'เลือกวันที่มีผลตรวจจากรายการทางซ้าย'}
              </p>
            ) : results.loading || results.error ? (
              readState(results)
            ) : (
              <table
                aria-label="ผล LAB ย้อนหลัง"
                className="min-w-full table-fixed text-left text-xs"
                style={{
                  width: columns.reduce(
                    (total, [, , width]) => total + width,
                    0
                  ),
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
                        aria-label={
                          key === 'type_result' ? 'ตัวบ่งชี้ H/L' : undefined
                        }
                        className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(current?.items || []).map((row, index) => (
                    <tr
                      key={index}
                      aria-selected={selected === row}
                      onClick={() => setSelection({ data: current, index })}
                      className={
                        selected === row
                          ? 'bg-blue-600 text-white'
                          : 'cursor-pointer hover:bg-blue-50'
                      }
                    >
                      {columns.map(([key]) => (
                        <td
                          key={key}
                          title={
                            key === 'type_result'
                              ? labHistoryFlag(row[key])
                              : labHistoryText(row[key])
                          }
                          className={`border border-gray-300 px-2 py-1.5 align-top ${key === 'result_obj' ? 'whitespace-pre-wrap break-words' : 'overflow-hidden text-ellipsis whitespace-nowrap'}`}
                        >
                          {key === 'lab_name' ? (
                            <button
                              type="button"
                              aria-label={`อ่านรายละเอียด LAB รายการที่ ${index + 1}`}
                              onClick={() =>
                                setSelection({ data: current, index })
                              }
                              className="block max-w-full truncate text-left underline"
                            >
                              {labHistoryText(row[key])}
                            </button>
                          ) : key === 'type_result' ? (
                            labHistoryFlag(row[key]) && (
                              <img
                                src={row[key] === 'H' ? labHigh : labLow}
                                alt={row[key]}
                                width="16"
                                height="16"
                                className="mx-auto"
                              />
                            )
                          ) : (
                            labHistoryText(row[key])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!current?.items.length && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        role="status"
                        className="p-4 text-center text-gray-500"
                      >
                        ไม่พบผล LAB ของวันที่เลือก กรุณาโหลดวันที่ตรวจใหม่
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {selected && (
            <div
              aria-label="รายละเอียดผล LAB"
              className="flex h-[34%] min-h-[100px] shrink-0 flex-col border-t bg-blue-50 px-2 py-1"
            >
              <div className="flex shrink-0 justify-between gap-2">
                <strong>
                  {labHistoryText(selected.lab_name)} · ผล{' '}
                  {labHistoryText(selected.result)}{' '}
                  {labHistoryText(selected.unit)}
                </strong>
                <button
                  onClick={() => setSelection(null)}
                  className="text-blue-800 underline"
                >
                  ปิดรายละเอียด LAB
                </button>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
                {[
                  ['ผลตรวจแบบข้อความ', selected.result_obj],
                  ['หมายเหตุ', selected.remark],
                ].map(([label, value]) => (
                  <label key={label} className="flex min-h-0 flex-col">
                    <span className="shrink-0">{label}</span>
                    <textarea
                      readOnly
                      aria-label={`LAB ${label}`}
                      value={labHistoryText(value)}
                      className="min-h-0 w-full flex-1 resize-none border border-gray-300 bg-white p-1"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
