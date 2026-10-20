import { useState } from 'react';
import { useMatch, useSearchParams } from 'react-router-dom';
import { useIpdRead } from '../../services/useIpdRead';
import ProfileReadTable from './ProfileReadTable';
import {
  prescriptionColumns,
  prescriptionView,
  prescriptionStyle,
  prescriptionText,
  prescriptionHeaderLabels,
  interactionColumns,
} from './prescriptionHistoryFormat';
import { nativeDate, nativeText, bangkokDay } from './nativeProfileFormat';
import { dateText, display } from './profileFormat';

const orderTypes = {
  0: 'ใบสั่งยาผู้ป่วยใน',
  1: 'ใบสั่งยากลับบ้าน',
  3: 'ใบสั่งยาเพิ่มเติม',
};

export default function PrescriptionHistory() {
  const an = useMatch('/ipd/patients/:an')?.params.an || '';
  const [query, setQuery] = useSearchParams();
  const [refresh, setRefresh] = useState(0);
  const base = `/ipd/patients/${encodeURIComponent(an)}`;
  const scope = {
    wardCode: query.get('wardCode') || '',
    orderdate: query.get('orderdate') || '',
  };
  const chosenDate = query.get('rxDate');
  const list = useIpdRead(
    `${base}/prescriptions`,
    { ...scope, ...(chosenDate !== null ? { workdate: chosenDate } : {}) },
    refresh
  );
  const dates = useIpdRead(`${base}/prescription-dates`, scope, refresh);
  const interactions = useIpdRead(`${base}/drug-interactions`, scope, refresh);
  const today = bangkokDay();
  const workdate = chosenDate ?? list.data?.workdate ?? scope.orderdate;
  const prescriptions = list.data?.prescriptions || [];
  const selectedNumber =
    prescriptions.find((row) => row.prescriptionno === query.get('rx'))
      ?.prescriptionno || '';
  const detail = useIpdRead(
    `${base}/prescriptions/${encodeURIComponent(selectedNumber)}`,
    { ...scope, workdate },
    refresh,
    Boolean(selectedNumber) && Boolean(workdate)
  );
  const current =
    detail.data?.header.prescriptionno === selectedNumber &&
    detail.data?.workdate === workdate
      ? detail.data
      : null;
  const chooseDate = (value) => {
    const next = new URLSearchParams(query);
    next.set('rxDate', value);
    next.delete('rx');
    setQuery(next, { replace: true });
  };
  const choosePrescription = (value) => {
    const next = new URLSearchParams(query);
    next.set('rxDate', workdate);
    next.set('rx', value);
    setQuery(next, { replace: true });
  };
  const reload = () => setRefresh((value) => value + 1);
  const state = (resource) =>
    resource.loading ? (
      <p role="status" className="p-4 text-gray-500">
        กำลังโหลดรายการสั่งยา…
      </p>
    ) : resource.error ? (
      <div role="alert" className="p-4 text-red-700">
        <p>{resource.error}</p>
        <button onClick={reload} className="mt-2 underline">
          ลองใหม่
        </button>
      </div>
    ) : null;
  const header = current?.header;
  return (
    <section
      aria-label="รายการสั่งยาผู้ป่วย"
      className="flex min-h-0 flex-1 gap-1"
    >
      <aside
        aria-label="เลือกใบสั่งยา"
        className="flex w-[28%] min-w-[280px] flex-col overflow-y-auto border border-gray-300 bg-white"
      >
        <div className="space-y-1 border-b border-gray-300 bg-custom-r1 p-2">
          <label className="flex items-center justify-between gap-1">
            วันที่เริ่มรอบใบสั่งยา
            <input
              aria-label="วันที่เริ่มรอบใบสั่งยา"
              type="date"
              min="1753-01-02"
              max="9999-12-30"
              value={workdate}
              onChange={(event) => chooseDate(event.target.value)}
              className="min-w-0 border border-gray-300 bg-white px-1 py-1"
            />
          </label>
          <label className="flex items-center justify-between gap-1">
            วันที่มีใบสั่งยา
            <select
              aria-label="วันที่มีใบสั่งยา"
              value={workdate}
              disabled={dates.loading || Boolean(dates.error)}
              onChange={(event) => chooseDate(event.target.value)}
              className="min-w-0 border border-gray-300 bg-white px-1 py-1"
            >
              {!(dates.data?.dates || []).some(
                (date) => date.workdate === workdate
              ) && (
                <option value={workdate}>
                  {dateText(workdate)} (วันที่เลือก)
                </option>
              )}
              {(dates.data?.dates || []).map((date) => (
                <option key={date.workdate} value={date.workdate}>
                  {dateText(date.workdate)} · {date.prescriptionCount} ใบ
                </option>
              ))}
            </select>
          </label>
          {dates.error && (
            <p role="alert" className="text-red-700">
              โหลดวันที่ที่มีใบสั่งยาไม่ได้{' '}
              <button onClick={reload} className="underline">
                ลองใหม่
              </button>
            </p>
          )}
          <p className="text-gray-600">รอบ 08:00–07:59 วันถัดไป</p>
        </div>
        <div
          className="min-h-[110px] flex-1 overflow-auto"
          aria-busy={list.loading}
        >
          {list.loading || list.error ? (
            state(list)
          ) : (
            <table aria-label="ใบสั่งยาของผู้ป่วย" className="w-full text-left">
              <thead className="sticky top-0 bg-custom-r1">
                <tr>
                  {prescriptionHeaderLabels.map((label) => (
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
                {prescriptions.map((row) => (
                  <tr
                    key={row.prescriptionno}
                    onClick={() => choosePrescription(row.prescriptionno)}
                    className={
                      selectedNumber === row.prescriptionno
                        ? 'bg-blue-600 text-white'
                        : row.dispenseStatus === 'จัดยาแล้ว'
                          ? 'cursor-pointer bg-[#90ee90]'
                          : 'cursor-pointer hover:bg-blue-50'
                    }
                  >
                    <td className="border border-gray-300 p-0">
                      <button
                        type="button"
                        aria-pressed={selectedNumber === row.prescriptionno}
                        onClick={(event) => {
                          event.stopPropagation();
                          choosePrescription(row.prescriptionno);
                        }}
                        className="whitespace-nowrap px-2 py-2 text-left focus:ring-2 focus:ring-inset focus:ring-blue-400"
                      >
                        {row.prescriptionno}
                      </button>
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {nativeText(row.ordertype)}
                    </td>
                    <td className="whitespace-nowrap border border-gray-300 px-2 py-1">
                      {nativeDate(row.ordercreatedate)}
                    </td>
                    <td className="whitespace-nowrap border border-gray-300 px-2 py-1">
                      {nativeDate(row.ordercreatedate, 'time')}
                    </td>
                    <td className="whitespace-nowrap border border-gray-300 px-2 py-1">
                      {nativeText(row.recorder)}
                    </td>
                    <td className="whitespace-nowrap border border-gray-300 px-2 py-1">
                      {nativeText(row.dispenseStatus)}
                    </td>
                  </tr>
                ))}
                {!prescriptions.length && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      ไม่พบใบสั่งยาในรอบวันที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div
          className="flex h-[100px] shrink-0 flex-col border-t border-gray-300"
          aria-busy={interactions.loading}
        >
          <p className="bg-custom-r1 px-2 py-1">
            คู่ยา Drug Interaction ที่บันทึกไว้
          </p>
          <div className="min-h-0 flex-1">
            {interactions.loading ? (
              <p role="status" className="p-2 text-gray-500">
                กำลังโหลดประวัติคู่ยา…
              </p>
            ) : interactions.error ? (
              <p role="alert" className="p-2 text-red-700">
                {interactions.error}{' '}
                <button onClick={reload} className="underline">
                  ลองใหม่
                </button>
              </p>
            ) : (
              <ProfileReadTable
                label="ประวัติคู่ยา Drug Interaction"
                columns={interactionColumns}
                rows={interactions.data?.['drug-interactions'] || []}
              />
            )}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-300 bg-custom-r1 p-1.5">
          <p role="status">จำนวน {list.data ? prescriptions.length : '—'} ใบ</p>
          <button
            onClick={reload}
            className="rounded border border-gray-400 bg-white px-2 py-1"
          >
            โหลดใบสั่งยาใหม่
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col border border-gray-300 bg-white">
        <div className="grid shrink-0 grid-cols-3 gap-x-3 gap-y-1 border-b border-gray-300 bg-custom-r1 p-2">
          <p>
            เลขที่ใบสั่งยา: <strong>{display(header?.prescriptionno)}</strong>
          </p>
          <p>
            Order Type:{' '}
            {header
              ? orderTypes[header.ordertype] || display(header.ordertype)
              : '—'}
          </p>
          <p>วันที่สั่ง: {dateText(header?.ordercreatedate, true)}</p>
          <p>หอผู้ป่วยบนใบ: {display(header?.wardname)}</p>
          <p>แพทย์: {display(header?.doctorname)}</p>
          <p>ราคารวมบนใบ: {display(header?.sumprice)}</p>
          <p>อ่านใบเมื่อ: {dateText(header?.readdatetime, true)}</p>
          <p>ยกเลิกใบเมื่อ: {dateText(header?.voiddatetime, true)}</p>
          <p>ผู้บันทึก: {display(header?.recorder)}</p>
        </div>
        <div className="min-h-0 flex-1" aria-busy={detail.loading}>
          {list.loading ? (
            <p role="status" className="p-6 text-center text-gray-500">
              กำลังโหลดใบสั่งยา…
            </p>
          ) : list.error ? (
            <p role="status" className="p-6 text-center text-gray-500">
              โหลดใบสั่งยาไม่สำเร็จ กรุณาลองใหม่ทางซ้าย
            </p>
          ) : !selectedNumber ? (
            <p role="status" className="p-6 text-center text-gray-500">
              {prescriptions.length
                ? 'เลือกใบสั่งยาทางซ้ายเพื่อแสดงรายการยา'
                : 'ไม่พบใบสั่งยาในรอบวันที่เลือก'}
            </p>
          ) : detail.loading || detail.error ? (
            state(detail)
          ) : (
            <ProfileReadTable
              label="รายการยาในใบสั่งยา"
              columns={prescriptionColumns}
              rows={(current?.items || []).map((row) =>
                prescriptionView(row, today)
              )}
              text={prescriptionText}
              cellStyle={prescriptionStyle}
            />
          )}
        </div>
        <div className="flex shrink-0 justify-between bg-black px-3 py-1.5 text-white">
          <p role="status">จำนวนยาในใบ {current?.items.length ?? '—'} รายการ</p>
          <span className="text-yellow-300">ดูข้อมูลเท่านั้น</span>
        </div>
      </div>
    </section>
  );
}
