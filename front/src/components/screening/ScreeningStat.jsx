import { useContext, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IpdSessionContext } from '../../services/ipdSession';
import { clearSessionToken } from '../../services/ipdApi';
import { useIpdRead } from '../../services/useIpdRead';
import IpdHeader from '../../header/IpdHeader';
import ScreeningReadTable from './ScreeningReadTable';
import { screeningColumns } from './screeningColumns';
import { dateText } from '../Profile/profileFormat';
import { validProfileDate } from '../Profile/drugProfileDates';
import {
  allRobotWardsQuery,
  allTakeHomeWardsQuery,
  screeningPatientPath,
} from './screeningNavigation';
import { screeningModes } from './screeningModes';
import { useScreeningWards } from './useScreeningWards';
import icon1 from '../../../img/icon1.png';
import icon2 from '../../../img/icon2.png';
import icon3 from '../../../img/icon3.png';
import icon4 from '../../../img/icon4.png';
import icon5 from '../../../img/icon5.png';
import robot from '../../../img/icon7.png';
import home from '../../../img/homeIcon.png';

function today() {
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
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export default function ScreeningStat() {
  const { user, context } = useContext(IpdSessionContext);
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const [refresh, setRefresh] = useState(0);
  const [notice, setNotice] = useState('');
  const [roomRefresh, setRoomRefresh] = useState(0);
  const orderdate = query.get('orderdate') ?? today();
  const search = query.get('search') || '';
  const mode = query.get('mode') ?? 'continue-wait';
  const modeConfig = Object.hasOwn(screeningModes, mode)
    ? screeningModes[mode]
    : null;
  const modeName = modeConfig?.label || 'ไม่ทราบโหมด';
  const isRobot = mode === 'robot-wait';
  const isAll = mode === 'screen-all';
  const isContinueFinished = mode === 'continue-finished';
  const isTakeHomeFinished = mode === 'take-home-finished';
  const isTakeHome = mode === 'take-home-wait' || isTakeHomeFinished;
  const supportsAllRooms = isRobot || isTakeHome;
  const headerOnly = isRobot || isAll;
  const screenStatus = query.get('screenStatus') ?? 'pending';
  const orderType = query.get('orderType') ?? 'all';
  const allFilters = isAll ? { screenStatus, orderType } : {};
  const roomOptions = useIpdRead('/ipd/screening/options', {}, roomRefresh);
  const roomCode =
    query.get('roomCode') ?? (supportsAllRooms ? 'all' : context.roomCode);
  const selectedRoom =
    supportsAllRooms && roomCode === 'all'
      ? { code: 'all', name: 'ทุกห้องยา' }
      : roomOptions.data?.rooms.find((room) => room.code === roomCode);
  const valid =
    Boolean(modeConfig) &&
    validProfileDate(orderdate) &&
    orderdate >= '1753-01-02' &&
    orderdate <= '9999-12-30';
  const scope = {
    mode,
    orderdate,
    search,
    roomCode,
    ...allFilters,
    ...(query.has('workdate') ? { workdate: query.get('workdate') } : {}),
  };
  const wards = useScreeningWards(
    scope,
    refresh,
    valid && Boolean(selectedRoom)
  );
  const wardRows = wards.data?.wards || [];
  const ward =
    wardRows.find((row) => row.code === query.get('wardCode')) ||
    (search && !isAll ? wardRows[0] : null);
  const window = wards.data?.window;
  const childScope = {
    mode,
    orderdate,
    search,
    roomCode,
    ...allFilters,
    ...(ward ? { wardCode: ward.code } : isAll ? {} : { wardCode: '' }),
    workdate: window?.workdate || '',
  };
  const headers = useIpdRead(
    '/ipd/screening/prescriptions',
    childScope,
    refresh,
    Boolean((ward || isAll) && window)
  );
  const prescriptions = headers.data?.prescriptions || [];
  const selected = prescriptions.find(
    (row) => row.prescriptionno === query.get('rx')
  );
  const detail = useIpdRead(
    `/ipd/screening/prescriptions/${encodeURIComponent(selected?.prescriptionno || '')}`,
    childScope,
    refresh,
    Boolean(selected) && !headerOnly
  );
  const current =
    detail.data?.header.prescriptionno === selected?.prescriptionno
      ? detail.data
      : null;
  const items = current?.items || [];
  const columnSet = screeningColumns(mode);
  const displayItems = current?.displayItems ?? items;
  const showAllRobotWards = () => {
    setQuery(allRobotWardsQuery(query), { replace: true });
    setRefresh((value) => value + 1);
    setNotice('');
  };
  const showAllTakeHomeWards = (targetMode = mode) => {
    setQuery(allTakeHomeWardsQuery(query, targetMode), { replace: true });
    setRefresh((value) => value + 1);
    setNotice('');
  };
  const reload = () => {
    const next = new URLSearchParams(query);
    next.delete('workdate');
    setQuery(next, { replace: true });
    setRefresh((value) => value + 1);
  };
  const chooseWard = (code) => {
    const next = new URLSearchParams(query);
    next.set('mode', mode);
    next.set('orderdate', orderdate);
    if (code) next.set('wardCode', code);
    else next.delete('wardCode');
    next.set('workdate', window.workdate);
    next.delete('rx');
    setQuery(next, { replace: true });
    setNotice('');
  };
  const choosePrescription = (row) => {
    const next = new URLSearchParams(query);
    if (ward) next.set('wardCode', ward.code);
    next.set('rx', row.prescriptionno);
    next.set('orderdate', orderdate);
    setQuery(next, { replace: true });
    setNotice('');
  };
  const openPatient = (row) => {
    const path = screeningPatientPath(row, {
      ...childScope,
      workdate: window.workdate,
    });
    if (path) navigate(path);
    else
      setNotice(
        'ไม่พบวอร์ดปัจจุบันที่เปิดรายละเอียดผู้ป่วยได้ กรุณาโหลดรายการใหม่'
      );
  };
  const state = (resource) =>
    resource.loading ? (
      <p role="status" className="p-3 text-gray-500">
        กำลังโหลดรายการ…
      </p>
    ) : resource.error ? (
      <div role="alert" className="p-3 text-red-700">
        <p>{resource.error}</p>
        <button onClick={reload} className="mt-1 underline">
          ลองใหม่
        </button>
      </div>
    ) : null;
  const controls = 'min-w-0 border border-gray-300 bg-white px-1 py-1';
  const changeAllFilter = (key, value) => {
    const next = new URLSearchParams(query);
    next.set(key, value);
    for (const name of ['wardCode', 'rx', 'workdate']) next.delete(name);
    setQuery(next, { replace: true });
    setNotice('');
  };
  return (
    <div className="flex h-screen min-h-[540px] flex-col bg-custom-or font-sans text-xs text-gray-900">
      <header className="border-b-2 border-white bg-blue-100">
        <IpdHeader
          onNavigate={(path, label) => {
            if (['/', '/ipd'].includes(path)) navigate('/ipd');
            else if (path === '/checkout')
              navigate(`/ipd/checkout?${new URLSearchParams({ orderdate })}`);
            else if (path === '/quickorder')
              navigate(
                `/ipd/quick-order?${new URLSearchParams({ orderdate })}`
              );
            else if (path === '/screening') setNotice('');
            else setNotice(`เมนู ${label} ยังไม่เปิดใช้งานในรุ่นดูข้อมูล`);
          }}
        />
      </header>
      <main
        aria-label={`Screening ${modeName}`}
        className="flex min-h-0 flex-1 flex-col gap-1 p-1"
      >
        <div
          aria-label="โหมด Screening"
          className="flex shrink-0 gap-1 overflow-x-auto"
        >
          {[
            [icon1, 'ยา Stat รอจัด', 'stat-wait'],
            [icon2, 'ยา Stat จัดแล้ว', 'stat-finished'],
            [icon3, 'ยารอ Screen และส่งจัดยา', 'continue-wait'],
            [icon4, 'ยา Screen และส่งจัดยาแล้ว', 'continue-finished'],
            [robot, 'ยารอส่ง Robot', 'robot-wait'],
            [icon5, 'ยารอ Screen ทั้งหมด', 'screen-all'],
            [home, 'ยากลับบ้านรอจัด', 'take-home-wait'],
            [home, 'ยากลับบ้านจัดแล้ว', 'take-home-finished'],
          ].map(([icon, label, active]) => (
            <button
              key={label}
              type="button"
              disabled={!active}
              aria-pressed={Boolean(active && mode === active)}
              title={active ? label : 'ยังไม่เปิดใช้งาน'}
              onClick={() => {
                if (active === 'robot-wait') {
                  showAllRobotWards();
                  return;
                }
                if (['take-home-wait', 'take-home-finished'].includes(active)) {
                  showAllTakeHomeWards(active);
                  return;
                }
                const next = new URLSearchParams(query);
                next.set('mode', active);
                if (roomCode === 'all') next.delete('roomCode');
                next.delete('wardCode');
                next.delete('rx');
                next.delete('workdate');
                next.delete('screenStatus');
                next.delete('orderType');
                setQuery(next, { replace: true });
              }}
              className={`flex min-w-[105px] flex-1 flex-col items-center justify-center rounded-sm border-2 p-1 disabled:cursor-not-allowed disabled:text-gray-400 ${active && mode === active ? 'bg-green-200' : 'bg-white'}`}
            >
              <img src={icon} alt="" className="h-6 w-6" />
              <span className="mt-1">{label}</span>
            </button>
          ))}
        </div>
        {notice && (
          <p
            role="status"
            className="shrink-0 border border-blue-300 bg-blue-50 p-2"
          >
            {notice}
            <button onClick={() => setNotice('')} className="ml-3 underline">
              ปิดข้อความ
            </button>
          </p>
        )}
        {!valid && (
          <p role="alert" className="text-red-700">
            โหมดหรือวันที่ Screening ไม่ถูกต้อง กรุณาเลือกโหมดที่เปิดใช้งาน
            และวันที่ใหม่
          </p>
        )}
        <div className="flex min-h-0 flex-1 gap-1">
          <aside
            aria-label={`วอร์ด ${modeName}`}
            className="flex w-[21%] min-w-[240px] flex-col border border-gray-300 bg-white"
          >
            <div className="shrink-0 space-y-1 border-b bg-custom-r2 p-2">
              <form
                id="screening-filters"
                key={search}
                onSubmit={(event) => {
                  event.preventDefault();
                  const values = new FormData(event.currentTarget);
                  const value = values.get('search').trim();
                  const next = new URLSearchParams(query);
                  next.set('search', value);
                  next.set('orderdate', values.get('orderdate'));
                  next.set('roomCode', values.get('roomCode') ?? roomCode);
                  next.delete('wardCode');
                  next.delete('rx');
                  next.delete('workdate');
                  setQuery(next, { replace: true });
                  setRefresh((value) => value + 1);
                }}
                className="flex gap-1"
              >
                <input
                  name="search"
                  aria-label="ค้นหา Screening AN HN หรือใบสั่งยา"
                  placeholder="AN / HN / ใบสั่งยา ทุกวอร์ด"
                  defaultValue={search}
                  maxLength={32}
                  className={`${controls} flex-1`}
                />
                <button className="border border-gray-400 bg-white px-2 disabled:text-gray-400">
                  ค้นหา
                </button>
              </form>
              <label className="flex items-center gap-1">
                ห้องยา
                <select
                  aria-label="ห้องยา Screening"
                  form="screening-filters"
                  name="roomCode"
                  value={roomCode}
                  disabled={roomOptions.loading || Boolean(roomOptions.error)}
                  onChange={(event) => {
                    const next = new URLSearchParams(query);
                    next.set('roomCode', event.target.value);
                    next.delete('wardCode');
                    next.delete('rx');
                    next.delete('workdate');
                    setQuery(next, { replace: true });
                    setNotice('');
                  }}
                  className={`${controls} flex-1`}
                >
                  {supportsAllRooms && <option value="all">ทุกห้องยา</option>}
                  {!selectedRoom && (
                    <option value={roomCode}>
                      {roomOptions.loading
                        ? 'กำลังโหลดห้องยา…'
                        : 'กรุณาเลือกห้องยา'}
                    </option>
                  )}
                  {(roomOptions.data?.rooms || []).map((room) => (
                    <option key={room.code} value={room.code}>
                      {room.name}[{room.code}]
                    </option>
                  ))}
                </select>
              </label>
              {isContinueFinished && (
                <p className="text-[10px] text-gray-600">
                  หอและยอดรวมทุกห้องยา · ใบสั่งยาตามห้องที่เลือก
                </p>
              )}
              {roomOptions.error && (
                <p role="alert" className="text-red-700">
                  {roomOptions.error}{' '}
                  <button
                    onClick={() => setRoomRefresh((value) => value + 1)}
                    className="underline"
                  >
                    โหลดห้องยาใหม่
                  </button>
                </p>
              )}
              {!roomOptions.loading && !roomOptions.error && !selectedRoom && (
                <p role="alert" className="text-red-700">
                  ไม่พบห้องยาที่เลือก กรุณาเลือกจากรายการ
                </p>
              )}
              <label className="flex items-center gap-1">
                วันที่
                <input
                  type="date"
                  aria-label="วันที่ Screening"
                  form="screening-filters"
                  name="orderdate"
                  required
                  min="1753-01-02"
                  max="9999-12-30"
                  value={orderdate}
                  onChange={(event) => {
                    const next = new URLSearchParams(query);
                    next.set('orderdate', event.target.value);
                    next.delete('wardCode');
                    next.delete('rx');
                    next.delete('workdate');
                    setQuery(next, { replace: true });
                  }}
                  className={`${controls} flex-1`}
                />
              </label>
              <button
                onClick={reload}
                className="w-full rounded border border-gray-400 bg-white p-1.5"
              >
                โหลด {modeName} ใหม่
              </button>
              {isAll && (
                <>
                  <label className="flex items-center gap-1">
                    ส่งจัดยา
                    <select
                      aria-label="สถานะส่งจัดยา"
                      value={screenStatus}
                      onChange={(event) =>
                        changeAllFilter('screenStatus', event.target.value)
                      }
                      className={`${controls} flex-1`}
                    >
                      <option value="pending">ยังไม่จ่าย</option>
                      <option value="screened">จ่ายแล้ว</option>
                      <option value="all">ทั้งหมด</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-1">
                    Order Type
                    <select
                      aria-label="Order Type"
                      value={orderType}
                      onChange={(event) =>
                        changeAllFilter('orderType', event.target.value)
                      }
                      className={`${controls} flex-1`}
                    >
                      <option value="all">ทั้งหมด</option>
                      {['0', '1', '3'].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                      <option value="stat">Stat</option>
                    </select>
                  </label>
                  <button
                    onClick={() => chooseWard('')}
                    disabled={!window}
                    className="w-full border border-blue-400 bg-blue-50 p-1.5 text-blue-800"
                  >
                    ทุกหอผู้ป่วยที่มีรายการ
                  </button>
                </>
              )}
              {supportsAllRooms && (roomCode !== 'all' || search) && (
                <button
                  onClick={() =>
                    isTakeHome ? showAllTakeHomeWards() : showAllRobotWards()
                  }
                  className="w-full border border-blue-400 bg-blue-50 p-1.5 text-blue-800"
                >
                  แสดงทุกหอที่มีรายการ
                </button>
              )}
              {window && (
                <p className="text-[10px] text-gray-600">
                  รอบ {dateText(window.start.replace(' ', 'T') + 'Z', true)}–
                  {dateText(window.end.replace(' ', 'T') + 'Z', true)}
                  <br />
                  {isAll
                    ? 'ช่วงเวลาของรายการทั้งหมดตามระบบเดิม'
                    : isTakeHome
                      ? `ยอดวอร์ดถึง 07:59:00 · ยาถึง 07:59:59 ตามระบบเดิม`
                      : `ยอดวอร์ดถึง 07:59:00 · ${isRobot ? 'ใบ' : 'ใบ/ยา'}ถึง 07:59:59 ตามระบบเดิม`}
                  {isTakeHome && window.headerEnd && (
                    <>
                      <br />
                      หัวใบถึง{' '}
                      {dateText(window.headerEnd.replace(' ', 'T') + 'Z', true)}
                    </>
                  )}
                </p>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {wards.loading || wards.error ? (
                state(wards)
              ) : (
                <ScreeningReadTable
                  label={`รายการวอร์ด ${modeName}`}
                  columns={columnSet.wards}
                  rows={wardRows}
                  idKey="code"
                  buttonKey="_ward"
                  selected={ward?.code}
                  onSelect={(row) => chooseWard(row.code)}
                  emptyText={`ไม่พบรายการ ${modeName} ตาม${isContinueFinished ? 'วันที่และคำค้น' : 'ห้องยา วันที่ และคำค้น'}`}
                />
              )}
            </div>
            <p role="status" className="shrink-0 border-t bg-custom-r1 p-2">
              จำนวน {wards.data ? wardRows.length : '—'} วอร์ด
            </p>
          </aside>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1">
            <section
              aria-label={`ใบสั่งยา ${modeName}`}
              className={`flex flex-col border border-gray-300 bg-white ${headerOnly ? 'min-h-0 flex-1' : 'h-[45%] min-h-[140px]'}`}
            >
              <div className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-custom-r1 px-2 py-1">
                <strong>
                  {ward
                    ? `[${ward.code}] ${ward.name}`
                    : isAll
                      ? 'ทุกหอผู้ป่วยที่มีรายการ'
                      : 'เลือกวอร์ดเพื่อดูใบสั่งยา'}
                </strong>
                <span>
                  {headers.data ? `${prescriptions.length} รายการใบ` : ''}
                </span>
                <button
                  type="button"
                  disabled={!selected}
                  onClick={() => openPatient(selected)}
                  className="rounded border border-gray-400 bg-white px-2 py-1 disabled:text-gray-400"
                >
                  ดูรายละเอียดผู้ป่วย
                </button>
                {(isRobot
                  ? ['ส่ง Robot ตามใบ', 'ส่ง Robot ตามวอร์ด', 'ยกเลิกใบสั่งยา']
                  : ['Screen และส่งจัดยา', 'พิมพ์ใบสั่งยา', 'ยกเลิกใบสั่งยา']
                ).map((label) => (
                  <button
                    key={label}
                    disabled
                    title="ดูข้อมูลเท่านั้น"
                    className="border border-gray-300 bg-white px-2 py-1 text-gray-400"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="min-h-0 flex-1 overflow-auto">
                {isAll && (wards.loading || wards.error) ? (
                  state(wards)
                ) : !ward && !isAll ? (
                  <p role="status" className="p-3 text-gray-500">
                    เลือกวอร์ดทางซ้าย
                  </p>
                ) : headers.loading || headers.error ? (
                  state(headers)
                ) : (
                  <ScreeningReadTable
                    label={`รายการใบสั่งยา ${modeName}`}
                    columns={columnSet.headers}
                    rows={prescriptions}
                    idKey="prescriptionno"
                    buttonKey="prescriptionno"
                    selected={selected?.prescriptionno}
                    onSelect={choosePrescription}
                    onOpen={openPatient}
                    emptyText={
                      isAll
                        ? 'ไม่พบใบสั่งยาตามตัวกรองที่เลือก'
                        : isContinueFinished
                          ? 'ไม่มีใบสั่งยาของหอนี้ในห้องยาที่เลือก · ยอดฝั่งซ้ายรวมทุกห้องยา'
                          : `ไม่พบใบสั่งยา ${modeName} ในวอร์ดนี้ กรุณาโหลดใหม่`
                    }
                  />
                )}
              </div>
            </section>
            {!headerOnly && (
              <section
                aria-label={`รายการยา ${modeName}`}
                className="flex min-h-0 flex-1 flex-col border border-gray-300 bg-white"
              >
                <div className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-custom-r1 px-2 py-1">
                  <strong>
                    {selected
                      ? `ใบ ${selected.prescriptionno} · HN ${selected.hn} · AN ${selected.an}`
                      : 'รายการยา'}
                  </strong>
                  <span>{selected?.patientname || ''}</span>
                  <span>{current ? `${displayItems.length} รายการ` : ''}</span>
                  {isTakeHome && (
                    <span className="text-gray-600">
                      เฉพาะยากลับบ้านที่
                      {isTakeHomeFinished ? 'จัดแล้ว' : 'ยังไม่จัด'} · ไม่รวม
                      Stat และยา Off
                    </span>
                  )}
                  {['จัดยาตามรายการ', 'Reprint', 'ส่งเครื่อง'].map((label) => (
                    <button
                      key={label}
                      disabled
                      title="ดูข้อมูลเท่านั้น"
                      className="border border-gray-300 bg-white px-2 py-1 text-gray-400"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="min-h-0 flex-1">
                  {!selected ? (
                    <p role="status" className="p-3 text-gray-500">
                      เลือกใบสั่งยาเพื่อดูรายการยา ·
                      ดับเบิลคลิกใบเพื่อเปิดรายละเอียดผู้ป่วย
                    </p>
                  ) : detail.loading || detail.error ? (
                    state(detail)
                  ) : (
                    <div className="h-full overflow-auto">
                      <ScreeningReadTable
                        label={`ตารางยา ${modeName}`}
                        columns={columnSet.items}
                        rows={displayItems}
                        idKey="itemindex"
                        emptyText="ไม่พบรายการยาตามเงื่อนไข"
                      />
                    </div>
                  )}
                </div>
                <p className="shrink-0 border-t px-2 py-1 text-gray-600">
                  ดูข้อมูลเท่านั้น
                </p>
              </section>
            )}
          </div>
        </div>
      </main>
      <footer className="flex shrink-0 items-center justify-between border-t-2 border-white bg-blue-100 px-4 py-2">
        <span>
          {roomCode === 'all' && supportsAllRooms
            ? 'ทุกห้องยา'
            : `[${selectedRoom?.code || roomCode}] ${selectedRoom?.name || ''}`}{' '}
          · Screening {modeName} · ดูข้อมูลเท่านั้น
        </span>
        <div className="flex items-center gap-3">
          <span>
            {user.name} ·{' '}
            {user.positionName || user.positionCode || 'ผู้ใช้งาน'}
          </span>
          <button
            onClick={() => {
              clearSessionToken();
              navigate('/login', { replace: true });
            }}
            className="rounded bg-red-500 px-3 py-1.5 text-white"
          >
            ออกจากระบบ
          </button>
        </div>
      </footer>
    </div>
  );
}
