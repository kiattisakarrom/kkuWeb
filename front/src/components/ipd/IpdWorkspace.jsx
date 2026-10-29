import { useContext, useEffect, useState } from 'react';
import { useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import { apiMessage, clearSessionToken, ipdApi } from '../../services/ipdApi';
import { IpdSessionContext } from '../../services/ipdSession';
import IpdHeader from '../../header/IpdHeader';
import FrmProfile from '../Profile/FrmProfile';
import PatientOpenButton from './PatientOpenButton';
import addDoc from '../../../img/addDoc.png';
import editDoc from '../../../img/editDoc.png';
import homeIcon from '../../../img/homeIcon.png';
import patientIcon from '../../../img/patientIcon.png';
import hospitalIcon from '../../../img/hospitalicon.png';

function todayInBangkok() {
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
function displayDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { timeZone: 'UTC' });
}

export default function IpdWorkspace() {
  const navigate = useNavigate();
  const detailMatch = useMatch('/ipd/patients/:an');
  const [listQuery] = useSearchParams();
  const { user, context } = useContext(IpdSessionContext);
  const [orderdate, setOrderdate] = useState(
    () => listQuery.get('orderdate') || todayInBangkok()
  );
  const [ptstatus, setPtstatus] = useState(
    () => listQuery.get('ptstatus') || 'admit'
  );
  const [wardCode, setWardCode] = useState(
    () => listQuery.get('wardCode') || ''
  );
  const [wardResult, setWardResult] = useState(null);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [wardsError, setWardsError] = useState('');
  const [searchInput, setSearchInput] = useState(
    () => listQuery.get('search') || ''
  );
  const [search, setSearch] = useState(() => listQuery.get('search') || '');
  const [prescriptionFilter, setPrescriptionFilter] = useState(
    () => listQuery.get('prescription') || 'all'
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [menuNotice, setMenuNotice] = useState('');
  const [lastOpenedAn, setLastOpenedAn] = useState('');
  const filtersKey = JSON.stringify([
    orderdate,
    ptstatus,
    search,
    prescriptionFilter,
  ]);
  const wards = wardResult?.key === filtersKey ? wardResult.wards : [];
  const selectedWard = wards.find((ward) => ward.code === wardCode);
  const selectedWardCode = selectedWard?.code || '';

  useEffect(() => {
    const controller = new AbortController();
    setWardResult(null);
    setWardsError('');
    setWardsLoading(true);
    if (!orderdate) {
      setWardsLoading(false);
      setWardsError('กรุณาเลือกวันที่');
      return () => controller.abort();
    }
    ipdApi
      .get('/ipd/wards', {
        params: {
          orderdate,
          ptstatus,
          search,
          prescription: prescriptionFilter,
        },
        signal: controller.signal,
      })
      .then(({ data: result }) => {
        if (controller.signal.aborted) return;
        setWardResult({ key: filtersKey, wards: result.wards });
        setWardCode((selected) =>
          result.wards.some((ward) => ward.code === selected)
            ? selected
            : search
              ? result.wards[0]?.code || ''
              : ''
        );
      })
      .catch((requestError) => {
        if (!controller.signal.aborted)
          setWardsError(
            apiMessage(requestError, 'โหลดรายการวอร์ดไม่ได้ กรุณาลองใหม่')
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setWardsLoading(false);
      });
    return () => controller.abort();
  }, [orderdate, ptstatus, search, prescriptionFilter, filtersKey, refresh]);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError('');
    if (!selectedWardCode || !orderdate) {
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    ipdApi
      .get('/ipd/patients', {
        params: {
          wardCode: selectedWardCode,
          orderdate,
          ptstatus,
          search,
          prescription: prescriptionFilter,
        },
        signal: controller.signal,
      })
      .then(({ data: result }) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted)
          setError(
            apiMessage(requestError, 'โหลดรายการผู้ป่วยไม่ได้ กรุณาลองใหม่')
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [
    selectedWardCode,
    orderdate,
    ptstatus,
    search,
    prescriptionFilter,
    refresh,
  ]);

  // Hide results from an earlier ward/filter immediately, before effects run.
  const currentData =
    selectedWardCode &&
    data?.context.wardCode === selectedWardCode &&
    data?.filters.orderdate === orderdate &&
    data?.filters.ptstatus === ptstatus &&
    data?.filters.search === search &&
    data?.filters.prescription === prescriptionFilter
      ? data
      : null;
  const patients = currentData?.patients || [];
  const controlClass =
    'rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300';
  const reload = () => setRefresh((value) => value + 1);
  const logout = () => {
    clearSessionToken();
    navigate('/login', { replace: true });
  };
  const openPatient = (patient) => {
    setLastOpenedAn(patient.an);
    const params = new URLSearchParams({
      wardCode: selectedWardCode,
      orderdate,
      ptstatus,
      search,
      prescription: prescriptionFilter,
    });
    navigate(`/ipd/patients/${encodeURIComponent(patient.an)}?${params}`);
  };

  return (
    <div className="flex h-screen min-h-[540px] flex-col bg-custom-or font-sans text-xs text-gray-900">
      <header className="border-b-2 border-white bg-blue-100">
        <IpdHeader
          onNavigate={(path, label) => {
            if (path === '/medtranfer') {
              navigate('/ipd/med-transfer');
              setMenuNotice('');
              return;
            }
            if (path === '/checkout') {
              navigate(`/ipd/checkout?${new URLSearchParams({ orderdate })}`);
              setMenuNotice('');
              return;
            }
            if (path === '/quickorder') {
              navigate(
                `/ipd/quick-order?${new URLSearchParams({ orderdate })}`
              );
              setMenuNotice('');
              return;
            }
            if (path === '/screening') {
              navigate(
                `/ipd/screening?${new URLSearchParams({ orderdate, mode: 'continue-wait' })}`
              );
              setMenuNotice('');
              return;
            }
            if (path === '/' || path === '/ipd') navigate('/ipd');
            setMenuNotice(
              path === '/' || path === '/ipd'
                ? ''
                : `เมนู ${label} ยังไม่เปิดใช้งานในรุ่นดูข้อมูล`
            );
          }}
        />
      </header>
      <main
        className={`flex min-h-0 flex-1 flex-col gap-2 p-2 ${detailMatch ? 'overflow-x-auto' : ''}`}
      >
        {menuNotice && (
          <div
            role="status"
            className="flex items-center justify-between border border-blue-300 bg-blue-50 p-2"
          >
            <p>{menuNotice}</p>
            <button
              onClick={() => setMenuNotice('')}
              className="rounded border px-2"
            >
              ปิดข้อความ
            </button>
          </div>
        )}
        {detailMatch ? (
          <FrmProfile key={detailMatch.params.an} />
        ) : (
          <>
            <div
              className="flex flex-wrap gap-2 py-1"
              aria-label="คำสั่งงานห้องยา"
            >
              {[
                [addDoc, 'สร้างใบยาใหม่'],
                [editDoc, 'สร้างใบยาเพิ่มเติม'],
                [homeIcon, 'สร้างใบยากลับบ้าน'],
                [patientIcon, 'ผู้ป่วย Admit ใหม่'],
                [hospitalIcon, 'ย้ายหอผู้ป่วย'],
                [homeIcon, 'ผู้ป่วยกลับบ้าน'],
              ].map(([icon, label]) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  title="ดูข้อมูลเท่านั้น"
                  className="flex w-32 flex-col items-center rounded border-2 bg-white p-1 text-gray-500 disabled:cursor-not-allowed"
                >
                  <img src={icon} alt="" className="h-6 w-6" />
                  <span className="mt-2 text-sm">{label}</span>
                </button>
              ))}
            </div>
            <section
              className="flex flex-wrap items-center gap-3 border-2 border-blue-300 bg-custom-r2 p-2"
              aria-label="ตัวกรองผู้ป่วย"
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setWardCode('');
                  setSearch(searchInput.trim());
                  setRefresh((value) => value + 1);
                }}
                className="flex items-center gap-2"
              >
                <input
                  aria-label="ค้นหา AN"
                  placeholder="ค้นหา AN จากทุกวอร์ด"
                  value={searchInput}
                  maxLength={32}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className={`${controlClass} w-48`}
                />
                <button
                  type="submit"
                  className="rounded bg-blue-700 px-3 py-1.5 text-white hover:bg-blue-900"
                >
                  ค้นหา
                </button>
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSearch('');
                    }}
                    className="rounded border border-gray-400 bg-white px-2 py-1.5"
                  >
                    ล้าง
                  </button>
                )}
              </form>
              <label className="flex items-center gap-2">
                วันที่
                <input
                  aria-label="วันที่"
                  type="date"
                  min="1753-01-01"
                  max="9999-12-31"
                  value={orderdate}
                  onChange={(event) => setOrderdate(event.target.value)}
                  className={controlClass}
                />
              </label>
              <fieldset className="flex flex-wrap gap-3">
                <legend className="sr-only">สถานะผู้ป่วย</legend>
                {[
                  ['all', 'แสดงทั้งหมด'],
                  ['admit', 'ผู้ป่วย Admit'],
                  ['discharged', 'ผู้ป่วย Discharged'],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="patientStatus"
                      value={value}
                      checked={ptstatus === value}
                      onChange={(event) => setPtstatus(event.target.value)}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              <button
                onClick={reload}
                disabled={loading || wardsLoading}
                className="rounded border border-gray-400 bg-white px-3 py-1.5 disabled:opacity-50"
              >
                โหลดข้อมูลใหม่
              </button>
            </section>
            <div className="flex min-h-0 flex-1 gap-2">
              <aside
                className="flex w-1/4 min-w-[230px] flex-col border-2 border-gray-300"
                aria-label="หอผู้ป่วย"
                aria-busy={wardsLoading}
              >
                <div className="min-h-0 flex-1 overflow-auto bg-white">
                  {wardsLoading ? (
                    <p role="status" className="p-4">
                      กำลังโหลดรายการวอร์ด…
                    </p>
                  ) : wardsError ? (
                    <div role="alert" className="p-4 text-red-700">
                      <p>{wardsError}</p>
                      <button
                        onClick={reload}
                        className="mt-2 rounded border px-2 py-1"
                      >
                        ลองใหม่
                      </button>
                    </div>
                  ) : (
                    <table
                      className="w-full text-left"
                      aria-label="รายการวอร์ด"
                    >
                      <thead className="sticky top-0 bg-custom-r1">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2">
                            หอผู้ป่วย
                          </th>
                          <th className="border border-gray-300 px-2 py-2">
                            จำนวน
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {wards.map((ward) => (
                          <tr
                            key={ward.code}
                            onClick={() => setWardCode(ward.code)}
                            className={
                              ward.code === wardCode
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-blue-100'
                            }
                          >
                            <td className="border border-gray-300 p-0">
                              <button
                                onClick={() => setWardCode(ward.code)}
                                aria-pressed={ward.code === wardCode}
                                className="w-full px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                              >
                                [{ward.code}] {ward.name}
                              </button>
                            </td>
                            <td className="border border-gray-300 p-0 text-center">
                              <button
                                type="button"
                                aria-label={`แสดงผู้ป่วยหอ ${ward.name} จำนวน ${ward.patientCount}`}
                                aria-pressed={ward.code === wardCode}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setWardCode(ward.code);
                                }}
                                className="w-full touch-manipulation px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              >
                                {ward.patientCount}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!wards.length && (
                          <tr>
                            <td
                              colSpan={2}
                              className="p-4 text-center text-gray-500"
                            >
                              ไม่พบวอร์ดที่มีรายการตามเงื่อนไข
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
                <p className="border-t border-gray-300 bg-custom-r1 p-2 text-gray-600">
                  แสดงเฉพาะวอร์ดที่มีรายการตามเงื่อนไข
                </p>
              </aside>
              <section
                className="flex min-w-0 flex-1 flex-col border-2 border-gray-300 bg-white"
                aria-labelledby="patients-heading"
                aria-busy={loading}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 bg-custom-r3 px-3 py-2">
                  <h2 id="patients-heading" className="font-bold">
                    รหัสหอผู้ป่วย : {selectedWardCode || '—'} · ชื่อหอผู้ป่วย :{' '}
                    {selectedWard?.name || 'กรุณาเลือกวอร์ดทางซ้าย'}
                  </h2>
                  <label className="flex items-center gap-2">
                    ใบสั่งยา
                    <select
                      aria-label="ใบสั่งยา"
                      value={prescriptionFilter}
                      onChange={(event) =>
                        setPrescriptionFilter(event.target.value)
                      }
                      className={controlClass}
                    >
                      <option value="all">แสดงทั้งหมด</option>
                      <option value="with">มีใบสั่งยา</option>
                      <option value="without">ไม่มีใบสั่งยา</option>
                    </select>
                  </label>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  {wardsLoading ? (
                    <p role="status" className="p-8 text-center text-gray-500">
                      กำลังค้นหารายการผู้ป่วย…
                    </p>
                  ) : wardsError ? (
                    <p role="alert" className="p-8 text-center text-red-700">
                      {wardsError}
                    </p>
                  ) : !selectedWardCode ? (
                    <p role="status" className="p-8 text-center text-gray-500">
                      {wards.length
                        ? 'เลือกวอร์ดจากรายการด้านซ้ายเพื่อแสดงข้อมูลผู้ป่วย'
                        : 'ไม่พบผู้ป่วยตามวันที่และตัวกรองที่เลือก'}
                    </p>
                  ) : !orderdate ? (
                    <p role="alert" className="p-8 text-center text-red-700">
                      กรุณาเลือกวันที่
                    </p>
                  ) : loading ? (
                    <p role="status" className="p-8 text-center text-gray-500">
                      กำลังโหลดรายการผู้ป่วย…
                    </p>
                  ) : error ? (
                    <div role="alert" className="p-8 text-center text-red-700">
                      <p>{error}</p>
                      <button
                        onClick={reload}
                        className="mt-3 rounded border px-2 py-1"
                      >
                        ลองใหม่
                      </button>
                    </div>
                  ) : (
                    <table
                      className="w-full text-left"
                      aria-label="รายการผู้ป่วย"
                    >
                      <thead className="sticky top-0 bg-custom-r1">
                        <tr>
                          {[
                            'Admit Date',
                            'HN',
                            'AN',
                            'ชื่อ - นามสกุล',
                            'จำนวนใบสั่งยา',
                            'หอผู้ป่วย',
                          ].map((label) => (
                            <th
                              key={label}
                              className="whitespace-nowrap border border-gray-300 px-3 py-2"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map((patient) => (
                          <tr
                            key={`${patient.an}-${patient.dischargeddate || ''}`}
                            onClick={() => setLastOpenedAn(patient.an)}
                            onDoubleClick={() => openPatient(patient)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                openPatient(patient);
                              }
                            }}
                            tabIndex={0}
                            title="แตะชื่อผู้ป่วย หรือดับเบิลคลิกแถวเพื่อดูรายละเอียด"
                            className={`touch-manipulation cursor-pointer hover:bg-blue-100 focus:bg-blue-100 focus:outline-none ${lastOpenedAn === patient.an ? 'bg-blue-100' : ''}`}
                          >
                            <td className="whitespace-nowrap border border-gray-300 px-3 py-2">
                              {displayDate(patient.admitteddate)}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              {patient.hn}
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              {patient.an}
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 p-0">
                              <PatientOpenButton
                                patient={patient}
                                onOpen={openPatient}
                                className="px-3 py-2"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center">
                              {patient.SumPresc}
                            </td>
                            <td className="whitespace-nowrap border border-gray-300 px-3 py-2">
                              {patient.warddesc}
                            </td>
                          </tr>
                        ))}
                        {!patients.length && (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-8 text-center text-gray-500"
                            >
                              ไม่พบผู้ป่วยตามวันที่และตัวกรองที่เลือก
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
                <p
                  role="status"
                  className="border-t border-gray-300 bg-custom-r1 p-2"
                >
                  แสดง {patients.length} รายการ · ผู้ป่วยทั้งหมด{' '}
                  {currentData?.patientCount ?? 0} ราย
                  {patients.length > 0 && (
                    <span className="ml-4 text-gray-600">
                      แตะช่องชื่อ - นามสกุล · ดับเบิลคลิกหรือกด Enter ที่แถวได้
                    </span>
                  )}
                </p>
              </section>
            </div>
          </>
        )}
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-white bg-blue-100 px-4 py-2">
        <p>
          [{context.roomCode}] {context.roomName} ·{' '}
          {detailMatch ? 'รายละเอียดผู้ป่วย' : 'วอร์ด'}{' '}
          {detailMatch
            ? ''
            : selectedWardCode
              ? `[${selectedWardCode}] ${selectedWard?.name || ''}`
              : 'ยังไม่ได้เลือก'}{' '}
          · ดูข้อมูลเท่านั้น
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span>
            {user.name} ·{' '}
            {user.positionName || user.positionCode || 'ผู้ใช้งาน'}
          </span>
          <button
            onClick={logout}
            className="rounded bg-red-500 px-3 py-1.5 text-white hover:bg-red-600"
          >
            ออกจากระบบ
          </button>
        </div>
      </footer>
    </div>
  );
}
