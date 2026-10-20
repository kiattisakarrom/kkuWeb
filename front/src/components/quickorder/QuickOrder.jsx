import { useContext, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import IpdHeader from '../../header/IpdHeader';
import { IpdSessionContext } from '../../services/ipdSession';
import { clearSessionToken } from '../../services/ipdApi';
import { useIpdRead } from '../../services/useIpdRead';
import { useScreeningWards } from '../screening/useScreeningWards';
import { validProfileDate } from '../Profile/drugProfileDates';
import { bangkokDay } from '../Profile/nativeProfileFormat';
import {
  quickOrderColumns,
  quickOrderWardColumns,
  quickOrderPreviewColumns,
  quickOrderTypes,
  quickOrderStatuses,
  quickOrderValue,
  quickOrderVisibleRows,
} from './quickOrderFormat';
import {
  quickOrderPreview,
  quickOrderPatientPath,
} from './quickOrderNavigation';
import dispenseIcon from '../../../img/in.png';
import printerIcon from '../../../img/printer.png';
import prescriptionIcon from '../../../img/editDoc.png';

function ActionButton({ label, shortcut, icon }) {
  return (
    <button
      type="button"
      disabled
      title="ดูข้อมูลเท่านั้น"
      className="flex h-11 min-w-28 items-center justify-center gap-2 border border-gray-400 bg-gray-50 px-2 text-gray-500 disabled:cursor-not-allowed"
    >
      <img src={icon} alt="" className="h-6 w-6" />
      <span>
        {label}
        <br />
        {shortcut}
      </span>
    </button>
  );
}
ActionButton.propTypes = {
  label: () => null,
  shortcut: () => null,
  icon: () => null,
};

export default function QuickOrder() {
  const { user, context } = useContext(IpdSessionContext);
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const [refresh, setRefresh] = useState(0);
  const [notice, setNotice] = useState('');
  const orderdate = query.get('orderdate') ?? bangkokDay();
  const roomCode = query.get('roomCode') ?? context.roomCode;
  const screenStatus = query.get('screenStatus') ?? 'pending';
  const orderType = query.get('orderType') ?? 'all';
  const selectedWards =
    query.get('wardSelection') === 'selected'
      ? query.getAll('selectedWard')
      : null;
  const preview = quickOrderPreview(query);
  const roomOptions = useIpdRead('/ipd/screening/options', {}, refresh);
  const room = roomOptions.data?.rooms.find((item) => item.code === roomCode);
  const valid =
    validProfileDate(orderdate) &&
    orderdate >= '1753-01-02' &&
    orderdate <= '9999-12-30' &&
    quickOrderTypes.some(([code]) => code === orderType) &&
    quickOrderStatuses.some(([code]) => code === screenStatus);
  // Quick Order and Screen All are the same native control/query. Reuse its
  // protected readers; do not route Quick Order through Stat/Continue criteria.
  const scope = {
    mode: 'screen-all',
    orderdate,
    search: '',
    roomCode,
    screenStatus,
    orderType,
    ...(query.has('workdate') ? { workdate: query.get('workdate') } : {}),
  };
  const wards = useScreeningWards(scope, refresh, valid && Boolean(room));
  const workdate = wards.data?.window?.workdate;
  const headers = useIpdRead(
    '/ipd/screening/prescriptions',
    { ...scope, workdate },
    refresh,
    valid && Boolean(room) && Boolean(workdate)
  );
  const wardRows = wards.data?.wards || [];
  const rows = quickOrderVisibleRows(
    headers.data?.prescriptions || [],
    selectedWards
  );
  const selected = query.get('rx');

  const pinnedQuery = () => {
    const next = new URLSearchParams(query);
    for (const [key, value] of Object.entries({
      orderdate,
      roomCode,
      screenStatus,
      orderType,
    }))
      next.set(key, value);
    if (workdate) next.set('workdate', workdate);
    return next;
  };
  const changeFilter = (key, value) => {
    const next = pinnedQuery();
    next.set(key, value);
    for (const name of ['workdate', 'wardSelection', 'selectedWard', 'rx'])
      next.delete(name);
    setNotice('');
    setQuery(next, { replace: true });
  };
  const chooseWards = (codes) => {
    const next = pinnedQuery();
    next.set('wardSelection', 'selected');
    next.delete('selectedWard');
    next.delete('rx');
    codes.forEach((code) => next.append('selectedWard', code));
    setQuery(next, { replace: true });
  };
  const toggleWard = (code) => {
    const codes = selectedWards || [];
    chooseWards(
      codes.includes(code)
        ? codes.filter((item) => item !== code)
        : [...codes, code]
    );
  };
  const choose = (row) => {
    const next = pinnedQuery();
    next.set('rx', row.prescriptionno);
    setQuery(next, { replace: true });
  };
  const addPreview = (row) => {
    const next = pinnedQuery();
    next.set('rx', row.prescriptionno);
    next.append('previewRx', row.prescriptionno);
    setQuery(next, { replace: true });
  };
  const removePreview = (index) => {
    const next = pinnedQuery();
    next.delete('previewRx');
    preview.forEach((code, position) => {
      if (position !== index) next.append('previewRx', code);
    });
    setQuery(next, { replace: true });
  };
  const openPatient = (row) => {
    const path = quickOrderPatientPath(row, query, {
      orderdate,
      roomCode,
      screenStatus,
      orderType,
      workdate,
    });
    if (path) navigate(path);
    else setNotice('ไม่พบวอร์ดปัจจุบันของผู้ป่วย จึงเปิดรายละเอียดไม่ได้');
  };
  const reload = () => {
    const next = pinnedQuery();
    next.delete('workdate');
    setQuery(next, { replace: true });
    setRefresh((value) => value + 1);
  };
  const readState = (resource) =>
    resource.loading ? (
      <p role="status" className="p-4 text-gray-500">
        กำลังโหลดข้อมูล…
      </p>
    ) : resource.error ? (
      <div role="alert" className="p-4 text-red-700">
        {resource.error}{' '}
        <button onClick={reload} className="underline">
          ลองใหม่
        </button>
      </div>
    ) : null;
  const selectedAll =
    wardRows.length > 0 &&
    wardRows.every((ward) => selectedWards?.includes(ward.code));
  return (
    <div className="flex h-screen min-h-[540px] flex-col bg-custom-or font-sans text-xs text-gray-900">
      <header>
        <IpdHeader
          onNavigate={(path, label) => {
            if (['/', '/ipd'].includes(path)) navigate('/ipd');
            else if (path === '/checkout')
              navigate(`/ipd/checkout?${new URLSearchParams({ orderdate })}`);
            else if (path === '/screening')
              navigate(
                `/ipd/screening?${new URLSearchParams({ orderdate, mode: 'continue-wait' })}`
              );
            else if (path === '/quickorder') setNotice('');
            else setNotice(`เมนู ${label} ยังไม่เปิดใช้งานในรุ่นดูข้อมูล`);
          }}
        />
      </header>
      <main
        aria-label="[ER] Quick Order"
        className="flex min-h-0 flex-1 flex-col overflow-x-auto p-1"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-2 py-1">
          <h1 className="font-bold">[ER] Quick Order</h1>
          <span>ดูข้อมูลเท่านั้น</span>
        </div>
        {notice && (
          <p role="status" className="bg-blue-50 px-2 py-1">
            {notice}
          </p>
        )}
        {!valid && (
          <p role="alert" className="p-2 text-red-700">
            วันที่หรือเงื่อนไข Quick Order ไม่ถูกต้อง
          </p>
        )}
        {roomOptions.error && (
          <div role="alert" className="p-2 text-red-700">
            {roomOptions.error}{' '}
            <button onClick={reload} className="underline">
              ลองใหม่
            </button>
          </div>
        )}
        {!roomOptions.loading && !roomOptions.error && !room && (
          <p role="alert" className="p-2 text-red-700">
            ไม่พบห้องยาที่เลือก
          </p>
        )}
        <div className="grid min-h-0 min-w-[1040px] flex-1 grid-cols-[19%_61%_20%] grid-rows-[106px_minmax(0,1fr)] gap-px border border-gray-400">
          <section
            aria-label="ตัวกรอง Quick Order"
            className="col-span-2 flex flex-col justify-between border border-gray-300 p-1"
          >
            <div className="flex gap-1">
              <ActionButton
                label="จัดยา"
                shortcut="[L+Rx]"
                icon={dispenseIcon}
              />
              <ActionButton
                label="พิมพ์สติ็กเกอร์"
                shortcut="[L]"
                icon={printerIcon}
              />
              <ActionButton
                label="พิมพ์ใบสั่งยา"
                shortcut="[Rx]"
                icon={prescriptionIcon}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1">
                เลือกห้อง:
                <select
                  aria-label="ห้องยา Quick Order"
                  value={roomCode}
                  onChange={(event) =>
                    changeFilter('roomCode', event.target.value)
                  }
                  disabled={roomOptions.loading || Boolean(roomOptions.error)}
                  className="w-40 border border-gray-400 bg-white p-1"
                >
                  {roomOptions.loading && (
                    <option value={roomCode}>กำลังโหลดห้องยา…</option>
                  )}
                  {!roomOptions.loading && !room && (
                    <option value={roomCode}>{roomCode}</option>
                  )}
                  {(roomOptions.data?.rooms || []).map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <input
                type="date"
                aria-label="วันที่ Quick Order"
                value={orderdate}
                min="1753-01-02"
                max="9999-12-30"
                onChange={(event) =>
                  changeFilter('orderdate', event.target.value)
                }
                className="w-32 border border-gray-400 bg-white p-1"
              />
              <fieldset
                aria-label="Order Type"
                className="flex gap-2 border border-gray-400 bg-white px-2 py-1"
              >
                <legend className="sr-only">Order Type</legend>
                <span>Order Type:</span>
                {quickOrderTypes.map(([value, title]) => (
                  <label key={value} className="flex gap-1">
                    <input
                      type="radio"
                      name="quickOrderType"
                      checked={orderType === value}
                      onChange={() => changeFilter('orderType', value)}
                    />
                    {title}
                  </label>
                ))}
              </fieldset>
              <fieldset
                aria-label="ส่งจัดยา"
                className="flex gap-2 border border-gray-400 bg-white px-2 py-1"
              >
                <legend className="sr-only">ส่งจัดยา</legend>
                <span>ส่งจัดยา:</span>
                {quickOrderStatuses.map(([value, title]) => (
                  <label key={value} className="flex gap-1">
                    <input
                      type="radio"
                      name="quickOrderStatus"
                      checked={screenStatus === value}
                      onChange={() => changeFilter('screenStatus', value)}
                    />
                    {title}
                  </label>
                ))}
              </fieldset>
              <button
                type="button"
                onClick={reload}
                className="border border-gray-400 bg-white px-2 py-1"
              >
                โหลดใหม่
              </button>
            </div>
          </section>
          <div className="border border-gray-300 p-1">
            <ActionButton label="จัดยา" shortcut="[L+Rx]" icon={dispenseIcon} />
          </div>
          <section
            aria-label="หอผู้ป่วย Quick Order"
            className="flex min-h-0 flex-col border border-gray-400 bg-white"
          >
            <div
              className="min-h-0 flex-1 overflow-auto"
              aria-busy={wards.loading || roomOptions.loading}
            >
              {roomOptions.loading || wards.loading || wards.error ? (
                readState(roomOptions.loading ? roomOptions : wards)
              ) : (
                <table
                  aria-label="หอผู้ป่วย Quick Order"
                  className="w-full text-left"
                >
                  <thead className="sticky top-0 bg-custom-r1">
                    <tr>
                      {quickOrderWardColumns.map((title, index) => (
                        <th key={index} className="border border-gray-300 p-2">
                          {index === 0 ? (
                            <input
                              type="checkbox"
                              aria-label="เลือกทุกหอ Quick Order"
                              checked={selectedAll}
                              onChange={() =>
                                chooseWards(
                                  selectedAll
                                    ? []
                                    : wardRows.map((ward) => ward.code)
                                )
                              }
                            />
                          ) : (
                            title
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {wardRows.map((ward) => (
                      <tr
                        key={`${ward.code}-${ward.name}`}
                        onClick={() => toggleWard(ward.code)}
                        className="cursor-pointer hover:bg-blue-50"
                      >
                        <td className="border border-gray-300 p-2">
                          <input
                            type="checkbox"
                            aria-label={`เลือกหอ ${ward.code} ${ward.name}`}
                            checked={Boolean(
                              selectedWards?.includes(ward.code)
                            )}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() => toggleWard(ward.code)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleWard(ward.code);
                            }}
                          >
                            {ward.name}
                          </button>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {ward.prescriptionCount}
                        </td>
                      </tr>
                    ))}
                    {!wardRows.length && (
                      <tr>
                        <td
                          colSpan={3}
                          role="status"
                          className="p-4 text-gray-500"
                        >
                          ไม่พบหอผู้ป่วยตามเงื่อนไข
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="bg-black px-2 py-1 text-white">
              จำนวน {wards.data ? wardRows.length : '—'} รายการ
            </div>
          </section>
          <section
            aria-label="ใบสั่งยา Quick Order"
            className="flex min-h-0 min-w-0 flex-col border border-gray-400 bg-white"
          >
            <div
              className="min-h-0 flex-1 overflow-auto"
              aria-busy={headers.loading || wards.loading}
            >
              {wards.loading ||
              wards.error ||
              headers.loading ||
              headers.error ? (
                readState(wards.loading || wards.error ? wards : headers)
              ) : (
                <table
                  aria-label="ใบสั่งยา Quick Order"
                  className="w-full text-left"
                >
                  <thead className="sticky top-0 bg-custom-r1">
                    <tr>
                      {quickOrderColumns.map(([key, title, width]) => (
                        <th
                          key={key}
                          style={{ minWidth: width }}
                          className="whitespace-nowrap border border-gray-300 px-2 py-1"
                        >
                          {key === '_select' ? (
                            <input
                              type="checkbox"
                              disabled
                              aria-label="เลือกใบทั้งหมดเพื่อจัดยา (ดูข้อมูลเท่านั้น)"
                            />
                          ) : (
                            title
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={index}
                        onClick={() => choose(row)}
                        onDoubleClick={() => openPatient(row)}
                        className={
                          row.prescriptionno === selected
                            ? 'bg-blue-100'
                            : row.screenDay
                              ? 'bg-[#90ee90]'
                              : 'bg-white'
                        }
                      >
                        {quickOrderColumns.map(([key]) => (
                          <td
                            key={key}
                            className="whitespace-nowrap border border-gray-300 px-2 py-2"
                          >
                            {key === '_select' ? (
                              <input
                                type="checkbox"
                                disabled
                                aria-label={`เลือกใบ ${row.prescriptionno} เพื่อจัดยา (ดูข้อมูลเท่านั้น)`}
                              />
                            ) : key === 'prescriptionno' ? (
                              <button
                                type="button"
                                title="ดับเบิลคลิกหรือกด Enter เพื่อเพิ่มเลขใบในรายการเลือกดู"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  choose(row);
                                }}
                                onDoubleClick={(event) => {
                                  event.stopPropagation();
                                  addPreview(row);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    addPreview(row);
                                  }
                                }}
                                className="text-blue-800 underline"
                              >
                                {row.prescriptionno}
                              </button>
                            ) : key === 'patientname' ? (
                              <button
                                type="button"
                                title="ดับเบิลคลิกชื่อเพื่อดูรายละเอียด หรือกด Enter"
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    openPatient(row);
                                  }
                                }}
                              >
                                {quickOrderValue(row, key)}
                              </button>
                            ) : (
                              quickOrderValue(row, key)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td
                          colSpan={quickOrderColumns.length}
                          role="status"
                          className="p-4 text-gray-500"
                        >
                          ไม่พบใบสั่งยาตามเงื่อนไข
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="bg-black px-2 py-1 text-white">
              จำนวน {headers.data ? rows.length : '—'} รายการ
            </div>
          </section>
          <section
            aria-label="รายการเลขใบเลือกดู"
            className="flex min-h-0 flex-col border border-gray-400 bg-white"
          >
            <div className="min-h-0 flex-1 overflow-auto">
              <table
                aria-label="รายการเลขใบเลือกดู"
                className="w-full text-left"
              >
                <thead className="sticky top-0 bg-custom-r1">
                  <tr>
                    {quickOrderPreviewColumns.map((title) => (
                      <th
                        key={title}
                        className="whitespace-nowrap border border-gray-300 px-2 py-1"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((code, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap border border-gray-300 p-2">
                        {code}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <button
                          type="button"
                          aria-label={`นำเลขใบ ${code} ลำดับ ${index + 1} ออกจากรายการเลือกดู`}
                          title="เอาออกจากรายการเลือกดูเท่านั้น"
                          onClick={() => removePreview(index)}
                          className="text-red-700"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-black px-2 py-1 text-white">
              จำนวน {preview.length} รายการ
            </div>
          </section>
        </div>
      </main>
      <footer className="flex shrink-0 justify-between gap-3 bg-blue-100 px-3 py-2">
        <span>
          [{roomCode}] {room?.name || '—'} · ดูข้อมูลเท่านั้น
        </span>
        <span>
          {user.name || user.id} · {user.positionName}{' '}
          <button
            onClick={() => {
              clearSessionToken();
              navigate('/login', { replace: true });
            }}
            className="ml-3 rounded bg-red-500 px-3 py-1 text-white"
          >
            ออกจากระบบ
          </button>
        </span>
      </footer>
    </div>
  );
}
