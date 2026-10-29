import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import IpdHeader from '../../header/IpdHeader';
import PatientOpenButton from '../ipd/PatientOpenButton';
import { IpdSessionContext } from '../../services/ipdSession';
import { clearSessionToken } from '../../services/ipdApi';
import { useIpdRead } from '../../services/useIpdRead';
import { useScreeningWards } from '../screening/useScreeningWards';
import { validProfileDate } from '../Profile/drugProfileDates';
import {
  bangkokDay,
  nativeDate,
  nativeText,
} from '../Profile/nativeProfileFormat';
import { patientAge } from '../Profile/profileFormat';
import {
  checkoutWardColumns,
  checkoutHeaderColumns,
  checkoutJvmColumns,
  checkoutManualColumns,
  checkoutTabs,
  checkoutStatuses,
  checkoutStatusText,
  checkoutDrugText,
  checkoutTimeKey,
  checkoutPacket,
  checkoutRowStyle,
  checkoutAllergyText,
  checkoutImageSource,
} from './checkoutFormat';

const buttonClass =
  'border border-gray-400 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:text-gray-400';
function CheckoutPopup({ title, children, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      aria-label={title}
      className="max-h-[85vh] w-[560px] overflow-auto border border-gray-500 bg-white p-4 shadow-xl backdrop:bg-black/40"
    >
      <h2 className="mb-3 font-bold">{title}</h2>
      {children}
      <button autoFocus onClick={onClose} className={`${buttonClass} mt-4`}>
        ปิด
      </button>
    </dialog>
  );
}
CheckoutPopup.propTypes = {
  title: () => null,
  children: () => null,
  onClose: () => null,
};
function ReadState({ resource, onRetry }) {
  if (resource.loading)
    return (
      <p role="status" className="p-4 text-gray-500">
        กำลังโหลดข้อมูล…
      </p>
    );
  return resource.error ? (
    <div role="alert" className="p-4 text-red-700">
      {resource.error}{' '}
      <button onClick={onRetry} className="rounded border px-2 py-1">
        ลองใหม่
      </button>
    </div>
  ) : null;
}
ReadState.propTypes = { resource: () => null, onRetry: () => null };

function DrugPicture({ row, packet, images, onOpen }) {
  const dose = packet ? nativeText(packet.dosage) : '';
  const src = checkoutImageSource(images, row, packet);
  const status =
    packet?.voiddatetime || (!packet && row.voiddatetime)
      ? 'Off'
      : packet?.holddatetime || (!packet && row.holddatetime)
        ? 'Hold'
        : '';
  return (
    <button
      type="button"
      onClick={() => onOpen({ row, packet, src })}
      title="ดูรูปยา"
      className="relative block h-24 w-24 border border-gray-200 bg-white"
    >
      {src ? (
        <img
          src={src}
          alt={`รูปยา ${nativeText(row.orderitemname)}`}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="text-gray-500">ไม่มีรูปยา</span>
      )}
      {packet && (
        <span className="absolute bottom-0 left-0 bg-white/90 px-1 font-bold">
          {dose}
        </span>
      )}
      {status && (
        <span className="absolute bottom-0 right-0 bg-white/90 text-red-700">
          {status}
        </span>
      )}
      {packet?.checkoutdatetime && (
        <span
          className="absolute left-0 top-0 bg-green-100 px-1 text-green-800"
          title="มีเวลา Checkout บันทึกไว้"
        >
          ✓
        </span>
      )}
    </button>
  );
}
DrugPicture.propTypes = {
  row: () => null,
  packet: () => null,
  images: () => null,
  onOpen: () => null,
};

function CheckoutDetail({ resource, query, setQuery, onBack, onRetry }) {
  const data = resource.data;
  const [picture, setPicture] = useState(null);
  const [dismissedAdr, setDismissedAdr] = useState(false);
  if (!data)
    return (
      <div className="min-h-0 flex-1 bg-white">
        <button className={buttonClass} onClick={onBack}>
          กลับ Check out
        </button>
        <ReadState resource={resource} onRetry={onRetry} />
      </div>
    );
  const patient = data.patient;
  const tab = checkoutTabs.some(([key]) => key === query.get('tab'))
    ? query.get('tab')
    : data.items.some((r) => r.category === 'jvm')
      ? 'jvm'
      : data.items.some((r) => r.category === 'manual')
        ? 'manual'
        : data.items.some((r) => r.category === 'stat')
          ? 'stat'
          : 'jvm';
  const rows = data.items.filter((r) => r.category === tab);
  const columns = tab === 'jvm' ? checkoutJvmColumns : checkoutManualColumns;
  const allergyText = checkoutAllergyText(data.allergies);
  const adrAlert = data.allergies.length > 0 && !dismissedAdr;
  const fields = [
    ['HN', patient?.hn],
    ['AN', patient?.an],
    ['วันเกิด', nativeDate(patient?.patientdob)],
    ['ชื่อ - นามสกุล', patient?.patientname, 2],
    ['เพศ', patient?.sex],
    [
      'หอผู้ป่วย',
      patient
        ? `[${nativeText(patient.wardcode)}] ${nativeText(patient.warddesc)}`
        : '',
    ],
    ['ห้อง', patient?.room],
    ['เตียง', patient?.bed],
    ['แพทย์', '', 2],
    ['อายุ', patientAge(patient?.patientdob)],
  ];
  const clinicalFields = [
    ['สิทธิการรักษา', patient?.rightname, 2],
    ['น้ำหนัก', '0 kg.'],
    ['BSA', '.00 m2'],
    ['ส่วนสูง', '0 Cm.'],
    ['GFR', '0'],
    ['วินิจฉัยโรค', '', 2],
    ['Treatment Protocol', '', 2],
  ];
  const field = ([label, value, span = 1]) => (
    <label
      key={label}
      style={{ gridColumn: `span ${span}` }}
      className="flex min-w-0 items-center gap-1"
    >
      <span className="shrink-0">{label}:</span>
      <input
        aria-label={label}
        readOnly
        value={nativeText(value)}
        className="min-w-0 flex-1 border border-gray-300 bg-white px-1 py-0.5"
      />
    </label>
  );
  return (
    <section
      aria-label="รายละเอียด Check out"
      className="flex min-h-0 flex-1 flex-col gap-1"
    >
      <div className="flex items-center justify-between bg-blue-50 px-2 py-1">
        <span className="font-bold">
          ใบสั่งยา {data.header.prescriptionno} ·{' '}
          {checkoutStatusText(data.header)}
        </span>
        <button onClick={onBack} className={buttonClass}>
          กลับ Check out
        </button>
      </div>
      {!patient && (
        <p role="alert" className="p-2 text-red-700">
          ไม่พบข้อมูลผู้ป่วยปัจจุบัน จึงไม่แสดงข้อมูลจากผู้ป่วยอื่น
        </p>
      )}
      <div className="grid shrink-0 grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_220px] gap-2 border border-gray-400 bg-slate-100 p-2">
        <div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-1">
            {fields.map(field)}
          </div>
          <label className="mt-2 flex gap-2 text-red-800">
            แพ้ยา:
            <textarea
              aria-label="แพ้ยา"
              readOnly
              value={allergyText}
              className="h-14 flex-1 border border-gray-300 bg-white px-1"
            />
          </label>
        </div>
        <div className="grid content-start grid-cols-2 gap-1">
          {clinicalFields.map(field)}
        </div>
        <div className="text-green-800">
          <p>เภสัชกรผุ้ตรวจสอบ:</p>
          <div className="min-h-7 border border-gray-300 bg-white p-1">
            {data.screener
              ? `[${nativeText(data.screener.confirmuserid)}] ${nativeText(data.screener.name)}`
              : ''}
          </div>
          <p className="mt-2">คนจัดยา:</p>
          <div className="h-20 overflow-auto whitespace-pre-wrap border border-gray-300 bg-white p-1">
            {data.preparers
              .map((r) => `[${r.kind}] ${nativeText(r.name)}`)
              .join('\n')}
          </div>
        </div>
      </div>
      <div
        role="tablist"
        aria-label="ประเภทยา Check out"
        className="flex shrink-0 gap-1"
      >
        {checkoutTabs.map(([key, title]) => (
          <button
            type="button"
            role="tab"
            key={key}
            aria-selected={tab === key}
            onClick={() => {
              const next = new URLSearchParams(query);
              next.set('tab', key);
              setQuery(next, { replace: true });
            }}
            className={`${buttonClass} ${tab === key ? 'font-bold bg-blue-100' : ''}`}
          >
            {title}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        aria-label={checkoutTabs.find(([key]) => key === tab)[1]}
        className="min-h-0 flex-1 overflow-auto border border-gray-400 bg-white"
      >
        <table aria-label="รายการยา Check out" className="w-full text-left">
          <thead className="sticky top-0 z-10 bg-custom-r1">
            <tr>
              <th className="border border-gray-300 p-1" aria-label="ลำดับ" />
              {columns.map(([key, title]) => (
                <th key={key} className="border border-gray-300 p-2">
                  {title}
                </th>
              ))}
              {tab === 'jvm' &&
                data.times.map((time, timeIndex) => (
                  <th
                    key={`${checkoutTimeKey(time)}-${timeIndex}`}
                    className="min-w-28 whitespace-pre-line border border-gray-300 p-1 text-center"
                  >
                    {[
                      time.frequencyTime,
                      time.frequencyTimedesc,
                      nativeDate(time.takeDay),
                      `( ${rows.filter((r) => checkoutPacket(r, time, data.packets)).length} รายการยา )`,
                    ].join('\n')}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                style={checkoutRowStyle(row, data.completed, index)}
              >
                <td className="border border-gray-300 p-1">{index + 1}</td>
                {columns.map(([key]) => (
                  <td
                    key={key}
                    className="border border-gray-300 p-2 align-top"
                  >
                    {key === '_picture' ? (
                      <DrugPicture
                        row={row}
                        images={data.images}
                        onOpen={setPicture}
                      />
                    ) : key === '_drug' ? (
                      <div className="min-w-72 whitespace-pre-wrap">
                        {checkoutDrugText(row)}
                      </div>
                    ) : (
                      nativeText(row[key])
                    )}
                  </td>
                ))}
                {tab === 'jvm' &&
                  data.times.map((time, timeIndex) => {
                    const packet = checkoutPacket(row, time, data.packets);
                    return (
                      <td
                        key={`${checkoutTimeKey(time)}-${timeIndex}`}
                        className="border border-gray-300 p-1"
                        style={{
                          backgroundColor: packet?.checkoutdatetime
                            ? '#7cfc00'
                            : undefined,
                        }}
                      >
                        {packet && (
                          <DrugPicture
                            row={row}
                            packet={packet}
                            images={data.images}
                            onOpen={setPicture}
                          />
                        )}
                      </td>
                    );
                  })}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  role="status"
                  colSpan={
                    columns.length + 1 + (tab === 'jvm' ? data.times.length : 0)
                  }
                  className="p-4 text-center text-gray-500"
                >
                  ไม่พบรายการยาในวันที่ {nativeDate(data.orderdate)}{' '}
                  และสถานะที่เลือก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 p-1">
        <span>จำนวน {rows.length} รายการ</span>
        <button disabled className={buttonClass}>
          ยืนยัน Check out
        </button>
      </div>
      {(adrAlert || picture) && (
        <CheckoutPopup
          title={
            adrAlert ? 'กรุณาตรวจสอบผู้ป่วยแพ้ยา' : picture.row.orderitemname
          }
          onClose={() => (adrAlert ? setDismissedAdr(true) : setPicture(null))}
        >
          {adrAlert ? (
            <pre className="whitespace-pre-wrap font-sans text-red-800">
              {allergyText}
            </pre>
          ) : (
            <>
              {picture.src ? (
                <img
                  src={picture.src}
                  alt={`รูปยา ${picture.row.orderitemname}`}
                  className="mx-auto max-h-80 object-contain"
                />
              ) : (
                <p>ไม่มีรูปยา</p>
              )}
              <pre className="mt-2 whitespace-pre-wrap font-sans">
                {checkoutDrugText(picture.row)}
              </pre>
              {picture.packet && (
                <p>
                  ขนาดยา {nativeText(picture.packet.dosage)} ·{' '}
                  {picture.packet.checkoutdatetime
                    ? 'มีเวลา Checkout บันทึกไว้'
                    : 'ไม่มีเวลา Checkout บันทึกไว้'}
                </p>
              )}
            </>
          )}
        </CheckoutPopup>
      )}
    </section>
  );
}
CheckoutDetail.propTypes = {
  resource: () => null,
  query: () => null,
  setQuery: () => null,
  onBack: () => null,
  onRetry: () => null,
};

export default function Checkout() {
  const { user, context } = useContext(IpdSessionContext);
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const [refresh, setRefresh] = useState(0);
  const [notice, setNotice] = useState('');
  const orderdate = query.get('orderdate') ?? bangkokDay();
  const search = query.get('search') ?? '';
  const checkoutStatus = query.get('checkoutStatus') ?? 'pending';
  const [draft, setDraft] = useState({ orderdate, search, checkoutStatus });
  const valid =
    validProfileDate(orderdate) &&
    orderdate >= '1753-01-02' &&
    orderdate <= '9999-12-30' &&
    checkoutStatuses.some(([key]) => key === checkoutStatus);
  const filters = {
    orderdate,
    search,
    checkoutStatus,
    ...(query.has('workdate') ? { workdate: query.get('workdate') } : {}),
  };
  const wards = useScreeningWards(
    filters,
    refresh,
    valid,
    '/ipd/checkout/wards'
  );
  const workdate = wards.data?.window?.workdate;
  const wardCode = query.get('wardCode');
  const common = { ...filters, workdate, wardCode };
  const headers = useIpdRead(
    '/ipd/checkout/prescriptions',
    common,
    refresh,
    valid && Boolean(workdate) && Boolean(wardCode)
  );
  const rx = query.get('rx');
  const headerKey = query.get('headerKey');
  const detail = useIpdRead(
    `/ipd/checkout/prescriptions/${encodeURIComponent(rx || '')}`,
    { ...common, headerKey },
    refresh,
    valid && Boolean(workdate && wardCode && rx && headerKey)
  );
  const wardRows = wards.data?.wards || [];
  const headerRows = headers.data?.prescriptions || [];
  const ward = wardRows.find((r) => r.code === wardCode);
  const pinned = () => {
    const next = new URLSearchParams(query);
    for (const [key, value] of Object.entries({
      orderdate,
      search,
      checkoutStatus,
      workdate,
    }))
      if (value !== undefined) next.set(key, value);
    return next;
  };
  const retry = () => setRefresh((value) => value + 1);
  const back = () => {
    const next = pinned();
    ['rx', 'headerKey', 'tab'].forEach((key) => next.delete(key));
    setQuery(next, { replace: true });
  };
  const chooseWard = (code) => {
    const next = pinned();
    next.set('wardCode', code);
    ['rx', 'headerKey', 'tab'].forEach((key) => next.delete(key));
    setQuery(next, { replace: true });
  };
  const open = (row) => {
    const next = pinned();
    next.set('rx', row.prescriptionno);
    next.set('headerKey', row.key);
    next.delete('tab');
    setQuery(next);
  };
  return (
    <div className="flex h-screen min-h-[540px] flex-col bg-custom-or font-sans text-xs text-gray-900">
      <IpdHeader
        onNavigate={(path, label) => {
          if (['/', '/ipd'].includes(path)) navigate('/ipd');
          else if (path === '/medtranfer') navigate('/ipd/med-transfer');
          else if (path === '/screening')
            navigate(
              `/ipd/screening?${new URLSearchParams({ orderdate, mode: 'continue-wait' })}`
            );
          else if (path === '/quickorder')
            navigate(`/ipd/quick-order?${new URLSearchParams({ orderdate })}`);
          else if (path === '/checkout') back();
          else setNotice(`เมนู ${label} ยังไม่เปิดใช้งานในรุ่นดูข้อมูล`);
        }}
      />
      <main
        aria-label="Check out"
        className="flex min-h-0 flex-1 flex-col gap-1 p-1"
      >
        <div className="flex shrink-0 justify-between px-2 py-1">
          <h1 className="font-bold">Check Out</h1>
          <span>ดูข้อมูลเท่านั้น</span>
        </div>
        {notice && (
          <p role="status" className="bg-blue-50 p-1">
            {notice}
          </p>
        )}
        {!valid && (
          <p role="alert" className="p-2 text-red-700">
            วันที่หรือสถานะ Check out ไม่ถูกต้อง
          </p>
        )}
        {rx && headerKey ? (
          <CheckoutDetail
            key={`${rx}-${headerKey}`}
            resource={detail}
            query={query}
            setQuery={setQuery}
            onBack={back}
            onRetry={retry}
          />
        ) : (
          <>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const next = new URLSearchParams({
                  orderdate: draft.orderdate,
                  search: draft.search.trimEnd(),
                  checkoutStatus: draft.checkoutStatus,
                });
                setQuery(next);
                setRefresh((value) => value + 1);
              }}
              className="flex shrink-0 flex-wrap items-center gap-4 border border-gray-400 p-3"
            >
              <label className="flex gap-2">
                AN:
                <input
                  aria-label="ค้นหา AN Check out"
                  value={draft.search}
                  maxLength={32}
                  onChange={(e) =>
                    setDraft({ ...draft, search: e.target.value })
                  }
                  className="w-48 border border-gray-400 bg-white p-1"
                />
              </label>
              <input
                aria-label="วันที่ Check out"
                type="date"
                min="1753-01-02"
                max="9999-12-30"
                value={draft.orderdate}
                onChange={(e) =>
                  setDraft({ ...draft, orderdate: e.target.value })
                }
                className="border border-gray-400 bg-white p-1"
              />
              <fieldset className="flex gap-4" aria-label="สถานะ Check out">
                <legend className="sr-only">สถานะ Check out</legend>
                {checkoutStatuses.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="checkoutStatus"
                      checked={draft.checkoutStatus === key}
                      onChange={() =>
                        setDraft({ ...draft, checkoutStatus: key })
                      }
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              <button className={buttonClass}>ค้นหา</button>
            </form>
            <div className="grid min-h-0 flex-1 grid-cols-[28%_minmax(0,1fr)] gap-1">
              <section className="flex min-h-0 flex-col border border-gray-400 bg-white">
                <h2 className="shrink-0 p-2 font-bold">
                  หอผู้ป่วยที่รอ Check Out
                </h2>
                <p className="shrink-0 border-y border-gray-300 p-2">
                  จำนวน {wards.data ? wardRows.length : '—'} รายการ
                </p>
                <div className="min-h-0 flex-1 overflow-auto">
                  {wards.loading || wards.error ? (
                    <ReadState resource={wards} onRetry={retry} />
                  ) : (
                    <table
                      aria-label="หอผู้ป่วย Check out"
                      className="w-full text-left"
                    >
                      <thead className="sticky top-0 bg-custom-r1">
                        <tr>
                          {checkoutWardColumns.map(([key, label]) => (
                            <th
                              key={key}
                              className="border border-gray-300 p-2"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {wardRows.map((row) => (
                          <tr
                            key={`${row.code}-${row.name}`}
                            className={
                              row.code === wardCode
                                ? 'bg-blue-100'
                                : 'hover:bg-blue-50'
                            }
                            onClick={() => chooseWard(row.code)}
                          >
                            {checkoutWardColumns.map(([key]) => (
                              <td
                                key={key}
                                className="border border-gray-300 p-2"
                              >
                                {key === '_select' ? (
                                  <input
                                    type="checkbox"
                                    disabled
                                    checked={false}
                                    aria-label={`ช่องเลือกหอ ${row.code} (ดูข้อมูลเท่านั้น)`}
                                  />
                                ) : key === 'name' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      chooseWard(row.code);
                                    }}
                                    className="text-left"
                                  >
                                    {nativeText(row[key])}
                                  </button>
                                ) : (
                                  nativeText(row[key])
                                )}
                              </td>
                            ))}
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
              </section>
              <section className="flex min-h-0 min-w-0 flex-col border border-gray-400 bg-white">
                <h2 className="shrink-0 p-2 font-bold">
                  ข้อมูลผู้ป่วย รอ Check Out
                </h2>
                <div className="flex shrink-0 gap-5 border-y border-gray-300 p-2">
                  <span>
                    จำนวน{' '}
                    {headers.data ? headerRows.length : wardCode ? '—' : 0}{' '}
                    รายการ
                  </span>
                  <span>รหัสหอผู้ป่วย: {wardCode}</span>
                  <span>หอผู้ป่วย: {ward?.name}</span>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  {wards.error || headers.loading || headers.error ? (
                    <ReadState
                      resource={wards.error ? wards : headers}
                      onRetry={retry}
                    />
                  ) : (
                    <table
                      aria-label="ใบสั่งยา Check out"
                      className="w-full text-left"
                    >
                      <thead className="sticky top-0 bg-custom-r1">
                        <tr>
                          {checkoutHeaderColumns.map(([key, label]) => (
                            <th
                              key={key}
                              className="whitespace-nowrap border border-gray-300 p-2"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {headerRows.map((row) => (
                          <tr
                            key={row.key}
                            onDoubleClick={() => open(row)}
                            title="แตะช่องชื่อ - นามสกุล หรือดับเบิลคลิกแถวเพื่อดูรายละเอียด Check out"
                            className="touch-manipulation hover:bg-blue-50"
                          >
                            {checkoutHeaderColumns.map(([key]) => (
                              <td
                                key={key}
                                className={`whitespace-nowrap border border-gray-300 ${key === 'patientname' ? 'p-0' : 'p-2'}`}
                              >
                                {key === '_select' ? (
                                  <input
                                    type="checkbox"
                                    disabled
                                    checked={false}
                                    aria-label={`เลือกใบ ${row.prescriptionno} (ดูข้อมูลเท่านั้น)`}
                                  />
                                ) : key === '_status' ? (
                                  checkoutStatusText(row)
                                ) : key === 'patientname' ? (
                                  <PatientOpenButton
                                    patient={row}
                                    onOpen={open}
                                    className="p-2"
                                  />
                                ) : (
                                  nativeText(row[key])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {!headerRows.length && (
                          <tr>
                            <td
                              colSpan={7}
                              role="status"
                              className="p-4 text-gray-500"
                            >
                              {wardCode
                                ? 'ไม่พบใบสั่งยาตามเงื่อนไข'
                                : 'เลือกหอผู้ป่วยเพื่อดูใบสั่งยา'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </div>
          </>
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
