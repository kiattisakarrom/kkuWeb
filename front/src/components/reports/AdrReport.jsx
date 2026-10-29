import { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IpdHeader from '../../header/IpdHeader';
import { IpdSessionContext } from '../../services/ipdSession';
import { clearSessionToken, ipdApi } from '../../services/ipdApi';
import { useIpdRead } from '../../services/useIpdRead';
import { bangkokDay } from '../Profile/nativeProfileFormat';
import {
  adrColumns,
  adrHistoryColumns,
  adrDate,
  validAdrRange,
} from './adrReportFormat';

const button =
  'border border-gray-400 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';
const input =
  'rounded border border-gray-400 bg-white px-2 py-1 text-sm text-black disabled:bg-gray-100';

function AdrContents({ history }) {
  const [code, setCode] = useState('');
  const [useDate, setUseDate] = useState(false);
  const [from, setFrom] = useState(bangkokDay);
  const [to, setTo] = useState(bangkokDay);
  const [submitted, setSubmitted] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState(null);
  const [soi, setSoi] = useState({});
  const [exporting, setExporting] = useState(false);
  const exportController = useRef(null);
  const filters = history
    ? { hn: code.trim(), from, to }
    : {
        an: code.trim(),
        useDate: useDate ? '1' : '0',
        ...(useDate ? { from, to } : {}),
      };
  const key = JSON.stringify(filters);
  const ready = submitted?.key === key;
  const resource = useIpdRead(
    `/reports/adr/${history ? 'history' : 'medications'}`,
    submitted?.filters || {},
    refresh,
    ready
  );
  const rows = resource.data?.items || [];
  const selected =
    selection ||
    new Set(rows.filter((row) => row.selected && row.id).map((row) => row.id));
  const selectedCount = rows.filter((row) => selected.has(row.id)).length;
  const columns = history ? adrHistoryColumns : adrColumns;
  useEffect(() => {
    exportController.current?.abort();
    setExporting(false);
    setSelection(null);
    setSoi({});
    setError('');
    return () => exportController.current?.abort();
  }, [key]);
  const submit = (event) => {
    event.preventDefault();
    const identifier = /^[A-Za-z0-9-]{1,32}$/.test(code.trim());
    if ((!history && !identifier) || (history && code.trim() && !identifier)) {
      setError(history ? 'กรุณากรอก HN ให้ถูกต้อง' : 'กรุณากรอก AN ให้ถูกต้อง');
      return;
    }
    if ((history || useDate) && !validAdrRange(from, to)) {
      setError('กรุณาเลือกช่วงวันที่ให้ถูกต้อง');
      return;
    }
    exportController.current?.abort();
    setExporting(false);
    setError('');
    setSelection(null);
    setSoi({});
    setSubmitted({ key, filters });
    setRefresh((value) => value + 1);
  };
  const download = async () => {
    const controller = new AbortController();
    exportController.current = controller;
    setExporting(true);
    setError('');
    try {
      const options = {
        responseType: 'blob',
        signal: controller.signal,
        timeout: 60000,
      };
      const response = history
        ? await ipdApi.get('/reports/adr/history/pdf', {
            ...options,
            params: submitted.filters,
          })
        : await ipdApi.post(
            '/reports/adr/pdf',
            {
              ...submitted.filters,
              selections: rows
                .filter((row) => selected.has(row.id))
                .map((row) => ({ id: row.id, soi: soi[row.id] || '' })),
            },
            options
          );
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = history ? 'ADR-history.pdf' : 'ADR.pdf';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (requestError) {
      if (controller.signal.aborted) return;
      let message = 'สร้าง PDF ไม่สำเร็จ กรุณาลองใหม่';
      if (requestError.response?.data instanceof Blob) {
        try {
          message =
            JSON.parse(await requestError.response.data.text()).message ||
            message;
        } catch {
          /* Keep readable fallback. */
        }
      }
      if (!controller.signal.aborted) setError(message);
    } finally {
      if (!controller.signal.aborted) setExporting(false);
    }
  };
  return (
    <>
      <form
        onSubmit={submit}
        className="flex shrink-0 flex-wrap items-end gap-3 border border-gray-400 bg-[#e8eef5] p-3"
      >
        <label className="flex flex-col gap-1">
          {history ? 'กรอก HN :' : 'AN:'}
          <input
            autoFocus
            aria-label={history ? 'HN' : 'AN'}
            className={input}
            maxLength={32}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        {!history && (
          <label className="flex items-center gap-2 pb-1.5">
            <input
              type="checkbox"
              checked={useDate}
              onChange={(e) => setUseDate(e.target.checked)}
            />
            ใช้วันที่
          </label>
        )}
        <fieldset
          disabled={!history && !useDate}
          className="flex items-end gap-2 disabled:text-gray-400"
        >
          <label className="flex flex-col gap-1">
            วันที่ :
            <input
              aria-label="วันที่เริ่ม"
              type="date"
              className={input}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            ถึง :
            <input
              aria-label="วันที่สิ้นสุด"
              type="date"
              className={input}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </fieldset>
        <button className={button} type="submit">
          {history ? 'OK' : 'ค้นหา'}
        </button>
        <button
          className={button}
          type="button"
          disabled={
            !ready ||
            resource.loading ||
            !rows.length ||
            exporting ||
            (!history && !selectedCount)
          }
          onClick={download}
        >
          {exporting ? 'กำลังสร้าง PDF…' : history ? 'Export PDF' : 'ออก PDF'}
        </button>
      </form>
      {!history && (
        <div className="flex shrink-0 flex-wrap gap-x-8 gap-y-1 border border-gray-400 bg-white px-3 py-2">
          <span>HN: {resource.data?.patient?.hn || '-'}</span>
          <span>AN: {resource.data?.patient?.an || '-'}</span>
          <span>ชื่อผู้ป่วย: {resource.data?.patient?.name || '-'}</span>
        </div>
      )}
      {error && (
        <p role="alert" className="bg-red-50 p-2 text-red-700">
          {error}
        </p>
      )}
      <section
        aria-label={history ? 'ประวัติ ADR' : 'ข้อมูลใบสั่งยาของผู้ป่วย'}
        className="flex min-h-0 flex-1 flex-col border border-gray-400"
      >
        <div className="shrink-0 bg-gray-200 px-2 py-1 font-bold">
          {history ? 'ประวัติ ADR' : 'ข้อมูลใบสั่งยาของผู้ป่วย'}
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-white">
          {resource.loading ? (
            <p role="status" className="p-4 text-gray-500">
              กำลังโหลดข้อมูล…
            </p>
          ) : resource.error ? (
            <div role="alert" className="p-4 text-red-700">
              {resource.error}{' '}
              <button
                className="underline"
                onClick={() => setRefresh((value) => value + 1)}
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            <table
              aria-label={history ? 'ตารางประวัติ ADR' : 'ตารางรายการยา ADR'}
              className="w-full border-collapse text-left"
            >
              <thead className="sticky top-0 z-10 bg-custom-r1">
                <tr>
                  {!history && (
                    <th className="border border-gray-300 p-2">
                      <input
                        aria-label="เลือกยาทั้งหมดสำหรับ PDF"
                        type="checkbox"
                        checked={
                          rows.length > 0 && selectedCount === rows.length
                        }
                        disabled={!rows.length}
                        onChange={(e) =>
                          setSelection(
                            e.target.checked
                              ? new Set(
                                  rows
                                    .filter((row) => row.id)
                                    .map((row) => row.id)
                                )
                              : new Set()
                          )
                        }
                      />
                    </th>
                  )}
                  {columns.map(([field, title, width]) => (
                    <th
                      key={field}
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
                    key={history ? index : `${row.id}-${index}`}
                    className={row.inactive ? 'bg-[#c0c0c0]' : ''}
                  >
                    {!history && (
                      <td className="border border-gray-300 p-2">
                        <input
                          aria-label={`เลือกยา ${row.orderitemname} สำหรับ PDF`}
                          type="checkbox"
                          checked={selected.has(row.id)}
                          disabled={!row.id}
                          onChange={(e) =>
                            setSelection((old) => {
                              const next = new Set(old || selected);
                              if (e.target.checked) next.add(row.id);
                              else next.delete(row.id);
                              return next;
                            })
                          }
                        />
                      </td>
                    )}
                    {columns.map(([field]) => (
                      <td
                        key={field}
                        className="whitespace-nowrap border border-gray-300 p-2"
                        title={row[field] || ''}
                      >
                        {field === 'soi' ? (
                          <select
                            aria-label={`S,O,I ของ ${row.orderitemname}`}
                            className="min-w-14 border border-gray-300 bg-white"
                            value={soi[row.id] || ''}
                            onChange={(e) =>
                              setSoi((old) => ({
                                ...old,
                                [row.id]: e.target.value,
                              }))
                            }
                          >
                            <option value=""></option>
                            {['S', 'O', 'I'].map((value) => (
                              <option key={value}>{value}</option>
                            ))}
                          </select>
                        ) : [
                            'startdate',
                            'enddate',
                            'createdate',
                            'startadrddatetime',
                          ].includes(field) ? (
                          adrDate(row[field], history ? '-' : '/')
                        ) : (
                          (row[field] ?? '')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td
                      colSpan={columns.length + (history ? 0 : 1)}
                      role="status"
                      className="p-5 text-gray-500"
                    >
                      {ready
                        ? 'ไม่พบข้อมูลตามเงื่อนไข'
                        : history
                          ? 'เลือกช่วงวันที่แล้วกด OK เพื่อดูประวัติ ADR'
                          : 'กรอก AN แล้วกดค้นหาเพื่อดูรายการยา'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="shrink-0 bg-black px-2 py-1 text-yellow-300">
          จำนวน {resource.loading ? '—' : rows.length} รายการ
          {!history && rows.length > 0
            ? ` · เลือกสำหรับ PDF ${selectedCount} รายการ`
            : ''}
        </div>
      </section>
    </>
  );
}
AdrContents.propTypes = { history: () => null };

export default function AdrReport() {
  const { user, context } = useContext(IpdSessionContext);
  const location = useLocation();
  const navigate = useNavigate();
  const history = location.pathname.endsWith('/history');
  const [notice, setNotice] = useState('');
  return (
    <div className="flex h-screen min-h-[540px] flex-col bg-custom-or font-sans text-xs text-gray-900">
      <IpdHeader
        onNavigate={(path, label) => {
          const destinations = {
            '/': '/ipd',
            '/ipd': '/ipd',
            '/screening': '/ipd/screening?mode=continue-wait',
            '/quickorder': '/ipd/quick-order',
            '/checkout': '/ipd/checkout',
            '/medtranfer': '/ipd/med-transfer',
          };
          if (destinations[path]) navigate(destinations[path]);
          else setNotice(`เมนู ${label} ยังไม่เปิดใช้งานในรุ่นดูข้อมูล`);
        }}
      />
      <main
        className="flex min-h-0 flex-1 flex-col gap-1 p-1"
        aria-label="Report ADR"
      >
        <div className="flex shrink-0 items-center justify-between px-2 py-2">
          <h1 className="font-bold">
            Report &gt; ADR &gt; {history ? 'ประวัติ ADR' : 'ADR'}
          </h1>
          <span>ดูข้อมูลเท่านั้น</span>
        </div>
        <div
          role="tablist"
          aria-label="รายงาน ADR"
          className="flex shrink-0 gap-1"
        >
          {[
            ['/ipd/reports/adr', 'ADR'],
            ['/ipd/reports/adr/history', 'ประวัติ ADR'],
          ].map(([path, label], index) => (
            <button
              key={path}
              type="button"
              role="tab"
              aria-selected={history ? index === 1 : index === 0}
              onClick={() => {
                navigate(path);
                setNotice('');
              }}
              className={button}
              style={{
                backgroundColor: (history ? index === 1 : index === 0)
                  ? '#7cfc00'
                  : 'white',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {notice && (
          <p role="status" className="bg-blue-50 p-2">
            {notice}
          </p>
        )}
        <AdrContents key={history ? 'history' : 'adr'} history={history} />
      </main>
      <footer className="flex shrink-0 justify-between bg-blue-100 px-3 py-2">
        <span>
          [{context.roomCode}] {context.roomName} · ดูข้อมูลเท่านั้น
        </span>
        <span>
          {user.name || user.id} · {user.positionName}
          <button
            className="ml-3 rounded bg-red-500 px-3 py-1 text-white"
            onClick={() => {
              clearSessionToken();
              navigate('/login', { replace: true });
            }}
          >
            ออกจากระบบ
          </button>
        </span>
      </footer>
    </div>
  );
}
