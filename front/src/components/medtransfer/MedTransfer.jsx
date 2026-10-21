import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import IpdHeader from '../../header/IpdHeader';
import { IpdSessionContext } from '../../services/ipdSession';
import { clearSessionToken } from '../../services/ipdApi';
import { useIpdRead } from '../../services/useIpdRead';
import { useScreeningWards } from '../screening/useScreeningWards';
import { validProfileDate } from '../Profile/drugProfileDates';
import {
  nativeDate,
  nativeText,
  bangkokDay,
} from '../Profile/nativeProfileFormat';
import { patientAge } from '../Profile/profileFormat';
import {
  medTransferItemColumns,
  medTransferWardColumns,
  medTransferHeaderColumns,
  medTransferModes,
  medTransferStatuses,
  medTransferValue,
  medTransferPrescription,
  medTransferLookupMessage,
} from './medTransferFormat';
import cart1 from '../../../img/cart1.png';
import cart2 from '../../../img/cart2.png';
import patientIcon from '../../../img/patientIcon.png';

const buttonClass =
  'border border-gray-400 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';
function ReadState({ resource, onRetry }) {
  return resource.loading ? (
    <p role="status" className="p-4 text-gray-500">
      กำลังโหลดข้อมูล…
    </p>
  ) : resource.error ? (
    <div role="alert" className="p-4 text-red-700">
      {resource.error}{' '}
      <button onClick={onRetry} className="underline">
        ลองใหม่
      </button>
    </div>
  ) : null;
}
ReadState.propTypes = { resource: () => null, onRetry: () => null };

function TransferGrid({
  columns,
  rows,
  label,
  empty = 'ไม่พบข้อมูลตามเงื่อนไข',
  onSelect,
  selected,
}) {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-white">
      <table aria-label={label} className="w-full text-left">
        <thead className="sticky top-0 bg-custom-r1">
          <tr>
            {columns.map(([key, title, width]) => (
              <th
                key={key}
                style={{ minWidth: width }}
                className="whitespace-nowrap border border-gray-300 p-2"
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              onClick={onSelect ? () => onSelect(row) : undefined}
              className={
                onSelect && selected === row.code
                  ? 'bg-blue-100'
                  : onSelect
                    ? 'cursor-pointer hover:bg-blue-50'
                    : ''
              }
            >
              {columns.map(([key]) => (
                <td
                  key={key}
                  className="whitespace-nowrap border border-gray-300 p-2"
                >
                  {onSelect && key === 'name' ? (
                    <button
                      type="button"
                      className="text-left"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(row);
                      }}
                    >
                      {medTransferValue(row, key)}
                    </button>
                  ) : (
                    medTransferValue(row, key)
                  )}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td
                colSpan={columns.length}
                role="status"
                className="p-4 text-gray-500"
              >
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
TransferGrid.propTypes = {
  columns: () => null,
  rows: () => null,
  label: () => null,
  empty: () => null,
  onSelect: () => null,
  selected: () => null,
};

function TransferWarning({ message, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      aria-label="ระบบแจ้งเตือน Med Transfer"
      className="max-h-[80vh] w-[480px] border border-gray-500 bg-white p-4 shadow-xl backdrop:bg-black/40"
    >
      <h2 className="mb-3 font-bold">ระบบแจ้งเตือน</h2>
      <p>{message}</p>
      <button autoFocus onClick={onClose} className={`${buttonClass} mt-4`}>
        ปิด
      </button>
    </dialog>
  );
}
TransferWarning.propTypes = { message: () => null, onClose: () => null };

function TransferLookup({ query, setQuery }) {
  const [refresh, setRefresh] = useState(0);
  const [optionsRefresh, setOptionsRefresh] = useState(0);
  const options = useIpdRead('/ipd/med-transfer/options', {}, optionsRefresh);
  const cartName = query.get('cart') || '';
  const cart = options.data?.carts.find((row) => row.name === cartName);
  const rx = query.get('rx') || '';
  const [draft, setDraft] = useState(rx);
  const [notice, setNotice] = useState('');
  const [dismissed, setDismissed] = useState('');
  const validRx = Boolean(rx) && medTransferPrescription(rx) === rx;
  const matchingDraft = medTransferPrescription(draft) === rx;
  const lookup = useIpdRead(
    `/ipd/med-transfer/prescriptions/${encodeURIComponent(rx)}`,
    { cartName },
    refresh,
    Boolean(cart) && validRx && matchingDraft
  );
  const data = lookup.data;
  const patient = data?.state === 'ready' ? data.patient : null;
  const items = data?.state === 'ready' ? data.items : [];
  const message = medTransferLookupMessage(data);
  const warningKey = JSON.stringify([cartName, rx, refresh, message]);
  const fields = [
    ['HN', patient?.hn],
    ['AN', patient?.an],
    ['ชื่อ - นามสกุล', patient?.patientname],
    ['วันเกิด', nativeDate(patient?.patientdob)],
    ['อายุ', patient?.patientdob ? patientAge(patient.patientdob) : ''],
    ['หอผู้ป่วย', patient?.wardname],
    ['เตียง', patient?.bed],
    ['สิทธิ์ผู้ป่วย', patient?.rightname],
    ['แพ้ยา', patient?.allergyText],
  ];
  const clear = () => {
    setQuery({ view: 'lookup' }, { replace: true });
    setDraft('');
    setNotice('');
  };
  return (
    <section
      aria-label="บรรจุยาเข้ารถเข็น"
      className="grid min-h-0 flex-1 grid-cols-[minmax(340px,42%)_minmax(0,1fr)] gap-1"
    >
      <section className="flex min-h-0 flex-col overflow-auto border border-gray-400 bg-white p-2">
        <h2 className="mb-2 font-bold">ข้อมูลผู้ป่วย</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const prescriptionno = medTransferPrescription(draft);
            if (!cart || !prescriptionno) {
              setNotice('กรุณาเลือกรถเข็นและระบุเลขที่ใบสั่งยาให้ถูกต้อง');
              return;
            }
            const next = new URLSearchParams({
              view: 'lookup',
              cart: cartName,
              rx: prescriptionno,
            });
            setDraft(prescriptionno);
            setNotice('');
            setQuery(next, { replace: true });
            setRefresh((n) => n + 1);
          }}
        >
          <div className="mb-3 grid grid-cols-[85px_minmax(0,1fr)] gap-2">
            <img
              src={patientIcon}
              alt=""
              className="h-24 w-20 object-contain"
            />
            <div className="space-y-2">
              <label className="flex items-center justify-end gap-2">
                <span className="shrink-0">รถเข็น:</span>
                <select
                  aria-label="รถเข็น Med Transfer"
                  value={cartName}
                  disabled={options.loading || Boolean(options.error)}
                  onChange={(event) => {
                    const next = new URLSearchParams({ view: 'lookup' });
                    if (event.target.value)
                      next.set('cart', event.target.value);
                    setQuery(next, { replace: true });
                    setDraft('');
                    setNotice('');
                  }}
                  className="min-w-0 flex-1 border border-gray-400 bg-white p-1"
                >
                  <option value="">
                    {options.loading ? 'กำลังโหลดรถเข็น…' : 'เลือกรถเข็น'}
                  </option>
                  {cartName && !cart && (
                    <option value={cartName}>{cartName}</option>
                  )}
                  {(options.data?.carts || []).map((row) => (
                    <option
                      key={JSON.stringify([row.name, row.wardCode])}
                      value={row.name}
                    >
                      {row.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center justify-end gap-2">
                <span className="shrink-0">ใบสั่งยา:</span>
                <input
                  aria-label="ใบสั่งยา Med Transfer"
                  value={draft}
                  disabled={!cart}
                  maxLength={100}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setNotice('');
                  }}
                  className="min-w-0 flex-1 border border-gray-400 bg-white p-1 disabled:bg-gray-100"
                />
              </label>
              <label className="flex items-center justify-end gap-2 text-gray-500">
                <span className="shrink-0">สแกน ยืนยันรับยา:</span>
                <input
                  aria-label="สแกน ยืนยันรับยา"
                  disabled
                  value=""
                  readOnly
                  className="w-20 min-w-0 flex-1 border border-gray-300 bg-gray-100 p-1"
                />
              </label>
            </div>
          </div>
          <div className="mb-3 flex justify-end">
            <button type="submit" disabled={!cart} className={buttonClass}>
              ดูข้อมูลใบสั่งยา
            </button>
          </div>
        </form>
        <ReadState
          resource={options}
          onRetry={() => setOptionsRefresh((n) => n + 1)}
        />
        {cartName && !cart && !options.loading && !options.error && (
          <p role="alert" className="mb-2 text-red-700">
            ไม่พบข้อมูลรถเข็น กรุณาเลือกใหม่
          </p>
        )}
        {rx && !validRx && (
          <p role="alert" className="mb-2 text-red-700">
            เลขที่ใบสั่งยาไม่ถูกต้อง
          </p>
        )}
        {notice && (
          <p role="alert" className="mb-2 text-red-700">
            {notice}
          </p>
        )}
        <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
          {fields.map(([label, value]) => (
            <label key={label} className="contents">
              <span className="text-right">{label}:</span>
              {['แพ้ยา', 'สิทธิ์ผู้ป่วย'].includes(label) ? (
                <textarea
                  aria-label={label}
                  readOnly
                  value={nativeText(value)}
                  className={`${label === 'แพ้ยา' ? 'h-24' : 'h-12'} min-w-0 border border-gray-300 bg-white p-1 ${label === 'แพ้ยา' ? 'text-red-800' : ''}`}
                />
              ) : (
                <input
                  aria-label={label}
                  readOnly
                  value={nativeText(value)}
                  className="min-w-0 border border-gray-300 bg-white p-1"
                />
              )}
            </label>
          ))}
        </div>
      </section>
      <section className="flex min-h-0 min-w-0 flex-col border border-gray-400 bg-white">
        {lookup.loading || lookup.error ? (
          <div className="min-h-0 flex-1 overflow-auto">
            <ReadState
              resource={lookup}
              onRetry={() => setRefresh((n) => n + 1)}
            />
          </div>
        ) : (
          <TransferGrid
            columns={medTransferItemColumns}
            rows={items}
            label="รายการยา Med Transfer"
            empty={
              data?.state === 'transferred'
                ? 'ใบสั่งยานี้ได้ทำการบรรจุยาเข้ารถเข็นแล้ว'
                : data?.state === 'notfound'
                  ? 'ไม่พบข้อมูลผู้ป่วย'
                  : rx && matchingDraft
                    ? 'ไม่พบรายการยา'
                    : 'เลือกรถเข็นและระบุเลขที่ใบสั่งยาเพื่อดูข้อมูล'
            }
          />
        )}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-300 p-2">
          <span>
            จำนวน {lookup.loading || lookup.error ? '—' : items.length} รายการ
          </span>
          <div className="flex gap-2">
            <button disabled className={buttonClass}>
              ยืนยัน
            </button>
            <button onClick={clear} className={buttonClass}>
              ยกเลิก
            </button>
          </div>
        </div>
      </section>
      {message && dismissed !== warningKey && (
        <TransferWarning
          key={warningKey}
          message={message}
          onClose={() => setDismissed(warningKey)}
        />
      )}
    </section>
  );
}
TransferLookup.propTypes = { query: () => null, setQuery: () => null };

function TransferStatus({ query, setQuery }) {
  const [refresh, setRefresh] = useState(0);
  const transferStatus = query.get('transferStatus') ?? 'pending';
  const orderdate = query.get('orderdate') ?? bangkokDay();
  const valid =
    medTransferStatuses.some(([key]) => key === transferStatus) &&
    validProfileDate(orderdate) &&
    orderdate >= '1753-01-02' &&
    orderdate <= '9999-12-30';
  const scope = {
    orderdate,
    transferStatus,
    ...(query.has('workdate') ? { workdate: query.get('workdate') } : {}),
  };
  const wards = useScreeningWards(
    scope,
    refresh,
    valid,
    '/ipd/med-transfer/wards'
  );
  const workdate = wards.data?.window?.workdate;
  const wardCode = query.get('wardCode');
  const headers = useIpdRead(
    '/ipd/med-transfer/prescriptions',
    { ...scope, workdate, wardCode },
    refresh,
    valid && Boolean(wardCode && workdate)
  );
  const wardRows = wards.data?.wards || [];
  const rows = headers.data?.prescriptions || [];
  const ward = wardRows.find((r) => r.code === wardCode);
  const retry = () => setRefresh((n) => n + 1);
  const choose = (row) => {
    const next = new URLSearchParams(query);
    next.set('view', 'status');
    next.set('orderdate', orderdate);
    next.set('transferStatus', transferStatus);
    next.set('wardCode', row.code);
    if (workdate) next.set('workdate', workdate);
    setQuery(next, { replace: true });
  };
  return (
    <section
      aria-label="สถานะบรรจุยาเข้ารถเข็น"
      className="flex min-h-0 flex-1 flex-col gap-1"
    >
      {!valid && (
        <p role="alert" className="p-2 text-red-700">
          วันที่หรือสถานะ Med Transfer ไม่ถูกต้อง
        </p>
      )}
      <div className="grid min-h-0 flex-1 grid-cols-[28%_minmax(0,1fr)] gap-1">
        <section className="flex min-h-0 flex-col border border-gray-400 bg-white">
          <h2 className="p-2 font-bold">หอผู้ป่วยที่ Admit</h2>
          <fieldset
            aria-label="สถานะบรรจุยา"
            className="flex shrink-0 flex-wrap gap-3 border-y border-gray-300 p-2"
          >
            <legend className="sr-only">สถานะบรรจุยา</legend>
            {medTransferStatuses.map(([key, title]) => (
              <label key={key} className="flex gap-1">
                <input
                  type="radio"
                  name="medTransferStatus"
                  checked={transferStatus === key}
                  onChange={() =>
                    setQuery(
                      { view: 'status', transferStatus: key },
                      { replace: true }
                    )
                  }
                />
                {title}
              </label>
            ))}
          </fieldset>
          {wards.loading || wards.error ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <ReadState resource={wards} onRetry={retry} />
            </div>
          ) : (
            <TransferGrid
              columns={medTransferWardColumns}
              rows={wardRows}
              label="หอผู้ป่วย Med Transfer"
              onSelect={choose}
              selected={wardCode}
            />
          )}
          <div className="bg-black px-2 py-1 text-yellow-300">
            จำนวน {wards.data ? wardRows.length : '—'} รายการ
          </div>
        </section>
        <section className="flex min-h-0 min-w-0 flex-col border border-gray-400 bg-white">
          <h2 className="p-2 font-bold">ข้อมูลผู้ป่วย</h2>
          <div className="flex shrink-0 flex-wrap gap-4 border-y border-gray-300 p-2">
            <span>รหัสหอผู้ป่วย: {wardCode || '-'}</span>
            <span>หอผู้ป่วย: {ward?.name || '-'}</span>
          </div>
          {wards.error || headers.loading || headers.error ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <ReadState
                resource={wards.error ? wards : headers}
                onRetry={retry}
              />
            </div>
          ) : (
            <TransferGrid
              columns={medTransferHeaderColumns}
              rows={rows}
              label="ใบสั่งยา สถานะ Med Transfer"
              empty={
                wardCode
                  ? 'ไม่พบใบสั่งยาตามเงื่อนไข'
                  : 'เลือกหอผู้ป่วยเพื่อดูใบสั่งยา'
              }
            />
          )}
          <div className="bg-black px-2 py-1 text-yellow-300">
            จำนวน {headers.data ? rows.length : wardCode ? '—' : 0} รายการ
          </div>
        </section>
      </div>
    </section>
  );
}
TransferStatus.propTypes = { query: () => null, setQuery: () => null };

export default function MedTransfer() {
  const { user, context } = useContext(IpdSessionContext);
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const [notice, setNotice] = useState('');
  const view = query.get('view') ?? 'lookup';
  return (
    <div className="flex h-screen min-h-[540px] flex-col bg-custom-or font-sans text-xs text-gray-900">
      <IpdHeader
        onNavigate={(path, label) => {
          if (['/', '/ipd'].includes(path)) navigate('/ipd');
          else if (path === '/screening')
            navigate('/ipd/screening?mode=continue-wait');
          else if (path === '/quickorder') navigate('/ipd/quick-order');
          else if (path === '/checkout') navigate('/ipd/checkout');
          else if (path === '/medtranfer') setNotice('');
          else setNotice(`เมนู ${label} ยังไม่เปิดใช้งานในรุ่นดูข้อมูล`);
        }}
      />
      <main
        aria-label="Med Transfer"
        className="flex min-h-0 flex-1 flex-col gap-1 p-1"
      >
        <div className="flex shrink-0 items-center justify-between px-2 py-1">
          <h1 className="font-bold">Med Transfer</h1>
          <span>ดูข้อมูลเท่านั้น</span>
        </div>
        <div
          role="tablist"
          aria-label="หน้า Med Transfer"
          className="flex shrink-0 gap-1"
        >
          {medTransferModes.map(([key, label], index) => (
            <button
              type="button"
              role="tab"
              key={key}
              aria-selected={view === key}
              onClick={() => {
                setQuery({ view: key });
                setNotice('');
              }}
              className={`flex h-14 items-center gap-2 border border-gray-500 px-3 font-bold ${view === key ? 'bg-[#7cfc00]' : 'bg-white'}`}
            >
              <img
                alt=""
                src={index === 0 ? cart1 : cart2}
                className="h-7 w-7"
              />
              {label}
            </button>
          ))}
        </div>
        {notice && (
          <p role="status" className="bg-blue-50 p-2">
            {notice}
          </p>
        )}
        {view === 'lookup' ? (
          <TransferLookup query={query} setQuery={setQuery} />
        ) : view === 'status' ? (
          <TransferStatus query={query} setQuery={setQuery} />
        ) : (
          <p role="alert" className="p-4 text-red-700">
            หน้า Med Transfer ไม่ถูกต้อง
          </p>
        )}
      </main>
      <footer className="flex shrink-0 justify-between bg-blue-100 px-3 py-2">
        <span>
          [{context.roomCode}] {context.roomName} · ดูข้อมูลเท่านั้น
        </span>
        <span>
          {user.name || user.id} · {user.positionName}
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
