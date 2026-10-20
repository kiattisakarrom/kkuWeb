import { useState } from 'react';
import { useMatch, useSearchParams } from 'react-router-dom';
import { useIpdRead } from '../../services/useIpdRead';
import { display } from './profileFormat';
import { eventFields, pharmcareResources } from './pharmcareFields';
import { pharmcareText as text } from './pharmcareFormat';

const rowKey = (row, index, kind) => {
  const id = pharmcareResources[kind].id;
  return id
    ? String(row[id] ?? `row-${index}`)
    : JSON.stringify([
        row.Orderitemcode,
        row.Doctorcode,
        row.Lastmodified,
        index,
      ]);
};

export default function PharmcareHistory() {
  const an = useMatch('/ipd/patients/:an')?.params.an || '';
  const [query, setQuery] = useSearchParams();
  const [refresh, setRefresh] = useState(0);
  const scope = {
    wardCode: query.get('wardCode') || '',
    orderdate: query.get('orderdate') || '',
  };
  const base = `/ipd/patients/${encodeURIComponent(an)}/pharmcare/events`;
  const events = useIpdRead(base, scope, refresh);
  const selectedEvent = events.data?.events.find(
    (row) => row.OrderNo === query.get('pcEvent')
  );
  const kind = Object.hasOwn(pharmcareResources, query.get('pcTab'))
    ? query.get('pcTab')
    : 'drp';
  const definition = pharmcareResources[kind];
  const detail = useIpdRead(
    `${base}/${encodeURIComponent(selectedEvent?.OrderNo || '')}/${kind}`,
    scope,
    refresh,
    Boolean(selectedEvent)
  );
  const current =
    detail.data?.event.OrderNo === selectedEvent?.OrderNo &&
    detail.data?.resource === kind
      ? detail.data
      : null;
  const rows = current?.items || [];
  const selected =
    rows.find(
      (row, index) => rowKey(row, index, kind) === query.get('pcItem')
    ) || (kind === 'due' || kind === 'me' ? rows[0] : null);
  const changeEvent = (value) => {
    const next = new URLSearchParams(query);
    next.set('pcEvent', value);
    next.delete('pcItem');
    setQuery(next, { replace: true });
  };
  const changeTab = (value) => {
    const next = new URLSearchParams(query);
    next.set('pcTab', value);
    next.delete('pcItem');
    setQuery(next, { replace: true });
  };
  const choose = (row, index) => {
    const next = new URLSearchParams(query);
    next.set('pcItem', rowKey(row, index, kind));
    setQuery(next, { replace: true });
  };
  const reload = () => setRefresh((value) => value + 1);
  const readState = (resource) =>
    resource.loading ? (
      <p role="status" className="p-4 text-gray-500">
        กำลังโหลดประวัติ ME/DRP…
      </p>
    ) : resource.error ? (
      <div role="alert" className="p-4 text-red-700">
        <p>{resource.error}</p>
        <button onClick={reload} className="mt-2 underline">
          ลองใหม่
        </button>
      </div>
    ) : null;
  return (
    <section aria-label="ประวัติ ME/DRP" className="flex min-h-0 flex-1 gap-1">
      <aside
        aria-label="เลือกเหตุการณ์ Pharmcare"
        className="flex w-[23%] min-w-[240px] flex-col border border-gray-300 bg-white"
      >
        <div className="shrink-0 border-b border-gray-300 bg-custom-r1 p-2">
          <strong>ME/DRP · เหตุการณ์ Pharmcare</strong>
          <p className="mt-1 text-gray-600">
            ประวัติ HN นี้ทุก AN รวมครั้งก่อน
          </p>
        </div>
        <div
          className="min-h-0 flex-1 overflow-auto"
          aria-busy={events.loading}
        >
          {events.loading || events.error ? (
            readState(events)
          ) : (
            <table
              aria-label="เหตุการณ์ Pharmcare ของผู้ป่วย"
              className="w-full text-left text-xs"
            >
              <thead className="sticky top-0 bg-custom-r1">
                <tr>
                  {['OrderNo'].map((label) => (
                    <th
                      key={label}
                      className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(events.data?.events || []).map((row) => (
                  <tr
                    key={row.OrderNo}
                    onClick={() => changeEvent(row.OrderNo)}
                    className={
                      selectedEvent?.OrderNo === row.OrderNo
                        ? 'bg-blue-600 text-white'
                        : 'cursor-pointer hover:bg-blue-50'
                    }
                  >
                    <td className="border border-gray-300 p-0">
                      <button
                        type="button"
                        aria-pressed={selectedEvent?.OrderNo === row.OrderNo}
                        onClick={(event) => {
                          event.stopPropagation();
                          changeEvent(row.OrderNo);
                        }}
                        className="whitespace-nowrap px-2 py-2 focus:ring-2 focus:ring-blue-400"
                      >
                        {row.OrderNo}
                      </button>
                    </td>
                  </tr>
                ))}
                {!events.data?.events.length && (
                  <tr>
                    <td className="p-4 text-center text-gray-500">
                      ไม่พบเหตุการณ์ Pharmcare ที่บันทึกไว้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-between border-t border-gray-300 bg-custom-r1 p-1.5">
          <p role="status">{events.data?.events.length ?? '—'} เหตุการณ์</p>
          <button
            onClick={reload}
            className="rounded border border-gray-400 bg-white px-2 py-1"
          >
            โหลด ME/DRP ใหม่
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col border border-gray-300 bg-white">
        <details
          key={selectedEvent?.OrderNo || 'none'}
          className="shrink-0 border-b border-gray-300 bg-custom-r1 p-2"
        >
          <summary className="cursor-pointer">
            เหตุการณ์: <strong>{display(selectedEvent?.OrderNo)}</strong> · AN
            ในเหตุการณ์: {display(selectedEvent?.AN)} ·{' '}
            {display(selectedEvent?.wardName)}{' '}
            <span className="text-gray-600">(ดูข้อมูลการดูแล)</span>
          </summary>
          {selectedEvent ? (
            <dl className="mt-2 grid max-h-[130px] grid-cols-2 gap-x-4 gap-y-1 overflow-auto">
              {eventFields.map((field) => (
                <div key={field[0]}>
                  <dt className="text-gray-500">{field[1]}</dt>
                  <dd className="whitespace-pre-wrap break-words">
                    {text(selectedEvent, field)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-gray-500">
              เลือกเหตุการณ์เพื่อดูข้อมูลที่บันทึก
            </p>
          )}
        </details>
        <div
          role="tablist"
          aria-label="ข้อมูล Pharmcare"
          className="flex shrink-0 gap-px border-b border-gray-300 bg-custom-r1"
        >
          {Object.entries(pharmcareResources).map(([key, value]) => (
            <button
              key={key}
              role="tab"
              id={`pc-tab-${key}`}
              aria-selected={kind === key}
              aria-controls="pc-panel"
              onClick={() => changeTab(key)}
              className={`min-w-[80px] border-r border-gray-300 px-3 py-1.5 ${kind === key ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`}
            >
              {value.label}
            </button>
          ))}
        </div>
        <div
          id="pc-panel"
          role="tabpanel"
          aria-labelledby={`pc-tab-${kind}`}
          className="flex min-h-0 flex-1"
          aria-busy={detail.loading}
        >
          {events.loading || events.error ? (
            <p role="status" className="p-6 text-gray-500">
              {events.loading
                ? 'กำลังโหลดเหตุการณ์…'
                : 'โหลดเหตุการณ์ไม่สำเร็จ กรุณาลองใหม่ทางซ้าย'}
            </p>
          ) : !selectedEvent ? (
            <p role="status" className="p-6 text-gray-500">
              เลือกเหตุการณ์ทางซ้ายเพื่อดูปัญหาการใช้ยาและบันทึก
            </p>
          ) : detail.loading || detail.error ? (
            readState(detail)
          ) : (
            <>
              <div className="min-w-0 flex-1 overflow-auto">
                <table
                  aria-label={`รายการ ${definition.label} ในเหตุการณ์`}
                  className="w-full text-left text-xs"
                >
                  <thead className="sticky top-0 bg-custom-r1">
                    <tr>
                      {definition.columns.map((field) => (
                        <th
                          key={field[0]}
                          scope="col"
                          className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                        >
                          {field[1]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={`${rowKey(row, index, kind)}-${index}`}
                        onClick={() => choose(row, index)}
                        className={
                          selected === row
                            ? 'bg-blue-600 text-white'
                            : 'cursor-pointer hover:bg-blue-50'
                        }
                      >
                        {definition.columns.map((field, col) => (
                          <td
                            key={field[0]}
                            className="whitespace-nowrap border border-gray-300 px-2 py-1.5"
                          >
                            {col === 0 ? (
                              <button
                                type="button"
                                aria-label={`ดูรายละเอียด ${definition.label} รายการ ${index + 1}`}
                                aria-pressed={selected === row}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  choose(row, index);
                                }}
                                className="max-w-[260px] truncate text-left align-middle focus:ring-2 focus:ring-blue-400"
                              >
                                {text(row, field)}
                              </button>
                            ) : (
                              <span
                                className="block max-w-[260px] truncate"
                                title={text(row, field)}
                              >
                                {text(row, field)}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td
                          colSpan={definition.columns.length}
                          className="p-6 text-center text-gray-500"
                        >
                          ไม่พบรายการ {definition.label} ในเหตุการณ์ที่เลือก
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <aside
                aria-label={`รายละเอียด ${definition.label} ที่เลือก`}
                className="w-[42%] min-w-[260px] overflow-auto border-l border-gray-300 bg-amber-50/40 p-2"
              >
                {selected ? (
                  <dl className="space-y-2">
                    {definition.fields.map((field) => (
                      <div key={field[0]}>
                        <dt className="font-semibold text-gray-600">
                          {field[1]}
                        </dt>
                        <dd
                          className={`mt-0.5 whitespace-pre-wrap break-words ${field[2] === 'long' ? 'border border-gray-200 bg-white p-2' : ''}`}
                        >
                          {text(selected, field)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="p-2 text-gray-500">
                    เลือกรายการเพื่ออ่านข้อความและรายละเอียดเต็ม
                  </p>
                )}
              </aside>
            </>
          )}
        </div>
        <div className="flex shrink-0 justify-between bg-black px-3 py-1.5 text-white">
          <p role="status">
            {definition.label}: {current ? rows.length : '—'} รายการ
          </p>
          <span className="text-yellow-300">ดูข้อมูลเท่านั้น</span>
        </div>
      </div>
    </section>
  );
}
