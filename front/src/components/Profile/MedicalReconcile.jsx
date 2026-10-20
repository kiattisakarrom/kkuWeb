import { useState } from 'react';
import { useMatch, useSearchParams } from 'react-router-dom';
import { useIpdRead } from '../../services/useIpdRead';
import ProfileReadTable from './ProfileReadTable';
import {
  reconcileColumns,
  reconcileView,
  reconcileHistoryHeaders,
  reconcileDoctor,
} from './medicalReconcileFormat';
import { nativeText } from './nativeProfileFormat';
import { dateText, display } from './profileFormat';

const sources = [
  ['OPD', 'OPD · ประวัติยาผู้ป่วยนอก'],
  ['IPD', 'IPD · ยากลับบ้าน Unitdose'],
  ['MRC', 'MRC · Reconcile จาก AN ครั้งอื่น'],
];
const identity = (row) =>
  JSON.stringify([row.source, row.historyId, row.historyDate]);

export default function MedicalReconcile() {
  const an = useMatch('/ipd/patients/:an')?.params.an || '';
  const [query, setQuery] = useSearchParams();
  const [refresh, setRefresh] = useState(0);
  const base = `/ipd/patients/${encodeURIComponent(an)}/reconcile`;
  const scope = {
    wardCode: query.get('wardCode') || '',
    orderdate: query.get('orderdate') || '',
  };
  // Independent requests keep SQL history usable when the separate OPD server is unavailable.
  const opd = useIpdRead(`${base}/OPD`, scope, refresh);
  const ipd = useIpdRead(`${base}/IPD`, scope, refresh);
  const mrc = useIpdRead(`${base}/MRC`, scope, refresh);
  const resources = { OPD: opd, IPD: ipd, MRC: mrc };
  const filter = sources.some(([key]) => key === query.get('mrFilter'))
    ? query.get('mrFilter')
    : 'all';
  const visible = sources.filter(([key]) => filter === 'all' || filter === key);
  const rows = visible
    .flatMap(([source]) =>
      (resources[source].data?.history || []).map((row) => ({ ...row, source }))
    )
    .sort(
      (a, b) =>
        b.historyDate.localeCompare(a.historyDate) ||
        a.source.localeCompare(b.source) ||
        b.historyId.localeCompare(a.historyId)
    );
  const selected = rows.find(
    (row) =>
      row.source === query.get('mrSource') &&
      row.historyId === query.get('mrId') &&
      row.historyDate === query.get('mrDate')
  );
  const detail = useIpdRead(
    `${base}/${selected?.source || 'OPD'}/items`,
    {
      ...scope,
      historyId: selected?.historyId || '',
      historyDate: selected?.historyDate || '',
    },
    refresh,
    Boolean(selected)
  );
  const current =
    detail.data?.source === selected?.source &&
    detail.data?.historyId === selected?.historyId &&
    detail.data?.historyDate === selected?.historyDate
      ? detail.data
      : null;
  const reload = () => setRefresh((value) => value + 1);
  const choose = (row) => {
    const next = new URLSearchParams(query);
    next.set('mrSource', row.source);
    next.set('mrId', row.historyId);
    next.set('mrDate', row.historyDate);
    setQuery(next, { replace: true });
  };
  const changeFilter = (value) => {
    const next = new URLSearchParams(query);
    next.set('mrFilter', value);
    ['mrSource', 'mrId', 'mrDate'].forEach((key) => next.delete(key));
    setQuery(next, { replace: true });
  };
  const loading = visible.some(([key]) => resources[key].loading);
  const failed = visible.some(([key]) => resources[key].error);
  return (
    <section
      aria-label="Medical Reconcile"
      className="flex min-h-0 flex-1 gap-1"
    >
      <aside
        className="flex w-[30%] min-w-[290px] flex-col border border-gray-300 bg-white"
        aria-label="เลือกประวัติยา"
      >
        <div className="shrink-0 space-y-1 border-b border-gray-300 bg-custom-r1 p-2">
          <label className="flex items-center justify-between gap-1">
            แหล่งประวัติยา
            <select
              aria-label="แหล่งประวัติยา"
              value={filter}
              onChange={(event) => changeFilter(event.target.value)}
              className="min-w-0 border border-gray-300 bg-white px-1 py-1"
            >
              <option value="all">ทั้งหมด</option>
              {sources.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-gray-600">
            เลือกวันที่และ VN / AN เพื่อดูรายการยา
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 border-b border-gray-200 px-2 py-1">
          {visible.map(([key]) =>
            resources[key].loading ? (
              <p key={key} role="status" className="text-gray-500">
                {key}: กำลังโหลดประวัติ…
              </p>
            ) : resources[key].error ? (
              <p key={key} role="alert" className="w-full text-red-700">
                {key}: {resources[key].error}{' '}
                <button onClick={reload} className="underline">
                  ลองใหม่
                </button>
              </p>
            ) : (
              <p key={key} className="text-gray-600">
                {key}: {resources[key].data?.history.length ?? '—'} ประวัติ
              </p>
            )
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <table
            aria-label="ประวัติ Medical Reconcile"
            className="w-full text-left"
          >
            <thead className="sticky top-0 bg-custom-r1">
              <tr>
                {reconcileHistoryHeaders.map((label) => (
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
              {rows.map((row) => (
                <tr
                  key={identity(row)}
                  onClick={() => choose(row)}
                  className={
                    selected && identity(selected) === identity(row)
                      ? 'bg-blue-600 text-white'
                      : 'cursor-pointer hover:bg-blue-50'
                  }
                >
                  <td className="whitespace-nowrap border border-gray-300 p-0">
                    <button
                      type="button"
                      aria-pressed={Boolean(
                        selected && identity(selected) === identity(row)
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        choose(row);
                      }}
                      className="px-2 py-2 focus:ring-2 focus:ring-inset focus:ring-blue-400"
                    >
                      {dateText(row.historyDate)}
                    </button>
                  </td>
                  <td className="whitespace-nowrap border border-gray-300 px-2 py-1">
                    {row.historyId}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {row.source}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {reconcileDoctor(row)}
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    {failed
                      ? 'บางแหล่งโหลดไม่สำเร็จ กรุณาลองใหม่'
                      : 'ไม่พบประวัติยาในแหล่งที่เลือก'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-300 bg-custom-r1 p-1.5">
          <p role="status">
            แสดง {rows.length} ประวัติ
            {loading
              ? ' · กำลังโหลดเพิ่ม'
              : failed
                ? ' · ข้อมูลบางส่วนยังโหลดไม่ได้'
                : ''}
          </p>
          <button
            onClick={reload}
            className="rounded border border-gray-400 bg-white px-2 py-1"
          >
            โหลดประวัติใหม่
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col border border-gray-300 bg-white">
        <div className="space-y-1 border-b border-gray-300 bg-custom-r1 p-2">
          <div className="flex flex-wrap gap-x-5">
            <strong>
              {sources.find(([key]) => key === selected?.source)?.[1] ||
                'Medical Reconcile'}
            </strong>
            <span>
              {selected?.source === 'OPD' ? 'VN' : 'AN'}:{' '}
              {display(selected?.historyId)}
            </span>
            <span>วันที่: {dateText(selected?.historyDate)}</span>
          </div>
          <p className="text-gray-600">
            {selected?.source === 'OPD'
              ? 'แสดงยาทั้งหมดของ VN ที่เลือกตามโปรแกรมเดิม'
              : selected?.source === 'MRC'
                ? 'แสดง Reconcile ทั้ง AN ครั้งอื่นตามโปรแกรมเดิม แม้มีหลายวันที่สั่ง'
                : selected?.source === 'IPD'
                  ? 'ยากลับบ้าน Unitdose ตาม AN และวันที่บนใบสั่งยา · รวม AN ปัจจุบันเมื่อมีประวัติ'
                  : 'OPD = ผู้ป่วยนอก · IPD = ยากลับบ้าน Unitdose · MRC = Reconcile ของ AN ครั้งอื่น'}
          </p>
        </div>
        <div className="min-h-0 flex-1" aria-busy={detail.loading}>
          {!selected ? (
            <p role="status" className="p-6 text-center text-gray-500">
              เลือกประวัติทางซ้ายเพื่อแสดงรายการยา
            </p>
          ) : detail.loading ? (
            <p role="status" className="p-6 text-center text-gray-500">
              กำลังโหลดรายการยาจากประวัติ…
            </p>
          ) : detail.error ? (
            <div role="alert" className="p-4 text-red-700">
              <p>{detail.error}</p>
              <button onClick={reload} className="mt-2 underline">
                ลองใหม่
              </button>
            </div>
          ) : (
            <ProfileReadTable
              label="ยาในประวัติ Medical Reconcile"
              columns={reconcileColumns}
              rows={(current?.items || []).map((row) =>
                reconcileView(row, selected.source)
              )}
              text={(row, [key]) => nativeText(row[key])}
            />
          )}
        </div>
        <div className="flex shrink-0 justify-between bg-black px-3 py-1.5 text-white">
          <p role="status">
            จำนวนยาในประวัติ {current?.items.length ?? '—'} รายการ
          </p>
          <span className="text-yellow-300">ดูข้อมูลเท่านั้น</span>
        </div>
      </div>
    </section>
  );
}
