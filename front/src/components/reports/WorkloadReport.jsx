import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IpdSessionContext } from '../../services/ipdSession';
import { apiMessage, clearSessionToken, ipdApi } from '../../services/ipdApi';
import { useIpdRead } from '../../services/useIpdRead';
import { bangkokDay } from '../Profile/nativeProfileFormat';
import IpdHeader from '../../header/IpdHeader';
import ReportPdfPreview from './ReportPdfPreview';

const button =
  'border border-gray-400 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';
const field =
  'min-w-0 rounded border border-gray-400 bg-white px-2 py-2 text-sm';
export default function WorkloadReport() {
  const { user, context } = useContext(IpdSessionContext);
  const navigate = useNavigate();
  const [from, setFrom] = useState(bangkokDay),
    [to, setTo] = useState(bangkokDay);
  const [result, setResult] = useState(null),
    [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''),
    [notice, setNotice] = useState('');
  const [picker, setPicker] = useState(false),
    [query, setQuery] = useState(''),
    [retry, setRetry] = useState(0);
  const [page, setPage] = useState(1),
    [zoom, setZoom] = useState('FitH');
  const controller = useRef(null),
    urlRef = useRef(null);
  const users = useIpdRead('/reports/workload/users', {}, retry, picker);
  const matches = (users.data?.users || []).filter(
    (item) =>
      item.code
        .toLocaleLowerCase('th')
        .startsWith(query.toLocaleLowerCase('th')) ||
      item.name
        .toLocaleLowerCase('th')
        .startsWith(query.toLocaleLowerCase('th'))
  );
  useEffect(() => {
    controller.current?.abort();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setResult(null);
    setLoading(false);
    setMessage('');
    setPage(1);
    return () => {
      controller.current?.abort();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, [from, to]);
  const search = async (userId) => {
    setPicker(false);
    if (!from || !to || from > to) {
      setMessage('กรุณาเลือกช่วงวันที่ให้ถูกต้อง');
      return;
    }
    controller.current?.abort();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    const request = new AbortController();
    controller.current = request;
    setResult(null);
    setLoading(true);
    setMessage('');
    setPage(1);
    try {
      const response = await ipdApi.post(
        '/reports/workload/pdf',
        { from, to, userId },
        { responseType: 'blob', signal: request.signal, timeout: 60000 }
      );
      if (request.signal.aborted) return;
      const url = URL.createObjectURL(response.data);
      urlRef.current = url;
      setResult({
        url,
        file: response.data,
        pages: Math.max(1, Number(response.headers['x-report-pages']) || 1),
      });
    } catch (error) {
      if (request.signal.aborted) return;
      let text = 'โหลดรายงานไม่ได้ กรุณาลองใหม่';
      if (error.response?.data instanceof Blob) {
        try {
          text = JSON.parse(await error.response.data.text()).message || text;
        } catch {
          /* Fallback. */
        }
      } else text = apiMessage(error, text);
      if (!request.signal.aborted) setMessage(text);
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  };
  const download = () => {
    if (!result) return;
    const anchor = document.createElement('a');
    anchor.href = result.url;
    anchor.download = 'Workload-Report.pdf';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };
  const changePage = (value) =>
    setPage(Math.min(result?.pages || 1, Math.max(1, value || 1)));
  return (
    <div className="flex h-screen min-h-[540px] flex-col bg-custom-or font-sans text-xs text-gray-900">
      <IpdHeader
        onNavigate={(path, label) => {
          const targets = {
            '/': '/ipd',
            '/ipd': '/ipd',
            '/screening': '/ipd/screening?mode=continue-wait',
            '/quickorder': '/ipd/quick-order',
            '/checkout': '/ipd/checkout',
            '/medtranfer': '/ipd/med-transfer',
          };
          if (targets[path]) navigate(targets[path]);
          else setNotice(`เมนู ${label} ยังไม่เปิดใช้งานในรุ่นดูข้อมูล`);
        }}
      />
      <main
        aria-label="Report Workload"
        className="flex min-h-0 flex-1 flex-col gap-1 p-1"
      >
        <div className="flex shrink-0 justify-between px-2 py-1">
          <h1>Report &gt; Workload</h1>
          <span>ดูข้อมูลเท่านั้น</span>
        </div>
        {notice && (
          <p role="status" className="bg-blue-50 p-2">
            {notice}
          </p>
        )}
        <div className="flex min-h-0 flex-1 gap-1">
          <form
            aria-label="เงื่อนไขรายงาน Workload"
            onSubmit={(event) => {
              event.preventDefault();
              search('');
            }}
            className="w-[288px] min-w-[240px] shrink-0 border border-gray-400 bg-white p-2"
          >
            <fieldset className="border border-gray-400 px-3 pb-4 pt-3">
              <legend className="px-1 text-base font-bold">ช่วงวันที่ :</legend>
              <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                <label htmlFor="workload-from">วันที่ :</label>
                <input
                  id="workload-from"
                  aria-label="วันที่เริ่ม"
                  type="date"
                  value={from}
                  required
                  onChange={(event) => setFrom(event.target.value)}
                  className={field}
                />
                <label htmlFor="workload-to">ถึง :</label>
                <input
                  id="workload-to"
                  aria-label="วันที่สิ้นสุด"
                  type="date"
                  value={to}
                  required
                  onChange={(event) => setTo(event.target.value)}
                  className={field}
                />
              </div>
            </fieldset>
            <fieldset className="mt-2 border border-gray-400 px-3 pb-5 pt-4">
              <legend className="px-1 text-base font-bold">
                ชื่อผู้ใช้งาน :
              </legend>
              <button
                type="button"
                className={`${button} mx-auto block min-h-[68px] bg-green-50 px-6 text-base font-bold`}
                disabled={loading}
                onClick={() => {
                  setQuery('');
                  setPicker(true);
                }}
              >
                เลือกผู้ใช้งาน
              </button>
            </fieldset>
            <button
              type="submit"
              disabled={loading}
              className={`${button} mx-auto mt-8 block min-h-[68px] min-w-[125px] bg-[#3cb371] text-lg font-bold text-white`}
            >
              {loading ? 'กำลังค้นหา…' : 'ค้นหา'}
            </button>
          </form>
          <section
            aria-label="ตัวอย่างรายงาน Workload"
            className="flex min-h-0 min-w-0 flex-1 flex-col border border-gray-400 bg-gray-200"
          >
            <div
              role="toolbar"
              aria-label="เครื่องมือรายงาน"
              className="flex shrink-0 flex-wrap items-center gap-1 border-b border-gray-400 bg-gray-100 p-1"
            >
              <button
                type="button"
                className={button}
                disabled={!result || loading}
                onClick={download}
              >
                ดาวน์โหลด PDF
              </button>
              <button
                aria-label="หน้าแรก"
                className={button}
                disabled={!result || page <= 1}
                onClick={() => changePage(1)}
              >
                «
              </button>
              <button
                aria-label="หน้าก่อนหน้า"
                className={button}
                disabled={!result || page <= 1}
                onClick={() => changePage(page - 1)}
              >
                ‹
              </button>
              <label className="flex items-center gap-1">
                หน้า{' '}
                <input
                  aria-label="หน้ารายงาน"
                  type="number"
                  min="1"
                  max={result?.pages || 1}
                  disabled={!result}
                  value={page}
                  onChange={(event) => changePage(Number(event.target.value))}
                  className="w-12 border border-gray-400 p-1"
                />{' '}
                / {result?.pages || 0}
              </label>
              <button
                aria-label="หน้าถัดไป"
                className={button}
                disabled={!result || page >= (result?.pages || 1)}
                onClick={() => changePage(page + 1)}
              >
                ›
              </button>
              <button
                aria-label="หน้าสุดท้าย"
                className={button}
                disabled={!result || page >= (result?.pages || 1)}
                onClick={() => changePage(result.pages)}
              >
                »
              </button>
              <select
                aria-label="ขนาดการแสดงรายงาน"
                value={zoom}
                disabled={!result}
                onChange={(event) => setZoom(event.target.value)}
                className="border border-gray-400 bg-white p-1.5"
              >
                <option value="FitH">พอดีความกว้าง</option>
                <option value="Fit">พอดีหน้า</option>
                {[50, 75, 100, 125, 150, 200].map((value) => (
                  <option key={value} value={value}>
                    {value}%
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <p role="status" className="p-6 text-center">
                กำลังโหลดรายงาน…
              </p>
            ) : result ? (
              <ReportPdfPreview
                file={result.file}
                page={page}
                zoom={zoom}
                title="Workload Report"
              />
            ) : (
              <p role="status" className="p-6 text-center text-gray-600">
                เลือกช่วงวันที่แล้วกดค้นหา
                หรือเลือกผู้ใช้งานเพื่อแสดงรายงานรายคน
              </p>
            )}
          </section>
        </div>
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
      {picker && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setPicker(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="workload-picker-title"
            className="flex max-h-[85vh] w-[620px] max-w-[95vw] flex-col border border-gray-500 bg-white shadow-xl"
          >
            <div className="flex shrink-0 items-center justify-between bg-slate-500 p-3 text-white">
              <h2 id="workload-picker-title" className="text-lg font-bold">
                Pharmacist
              </h2>
              <button
                className={button}
                aria-label="ปิดเลือกผู้ใช้งาน"
                onClick={() => setPicker(false)}
              >
                ปิด
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-2 p-3">
              <input
                autoFocus
                aria-label="ค้นหาผู้ใช้งาน"
                placeholder="ค้นหาชื่อหรือรหัส"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={`${field} flex-1`}
              />
              <button className={button} onClick={() => setQuery('')}>
                ล้าง
              </button>
              <span>จำนวน {matches.length} รายการ</span>
            </div>
            {users.loading ? (
              <p role="status" className="p-4">
                กำลังโหลดผู้ใช้งาน…
              </p>
            ) : users.error ? (
              <p role="alert" className="p-4 text-red-700">
                {users.error}{' '}
                <button
                  className="underline"
                  onClick={() => setRetry((value) => value + 1)}
                >
                  ลองใหม่
                </button>
              </p>
            ) : (
              <div className="min-h-0 overflow-auto">
                <table
                  aria-label="ผู้ใช้งาน Workload"
                  className="w-full border-collapse text-sm"
                >
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      <th className="border p-2">รหัส</th>
                      <th className="border p-2">ชื่อ - นามสกุล</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((item, index) => (
                      <tr key={`${item.code}-${index}`}>
                        <td className="border p-0">
                          <button
                            className="w-full p-2 text-left hover:bg-blue-50"
                            onClick={() => search(item.code)}
                          >
                            {item.code}
                          </button>
                        </td>
                        <td className="border p-0">
                          <button
                            className="w-full p-2 text-left hover:bg-blue-50"
                            onClick={() => search(item.code)}
                          >
                            {item.name}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!matches.length && (
                  <p className="p-4 text-center">ไม่พบข้อมูล</p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
      {message && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setMessage('');
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="workload-message-title"
            className="w-[400px] max-w-[95vw] border border-gray-400 bg-white shadow-xl"
          >
            <h2
              id="workload-message-title"
              className="bg-blue-100 px-4 py-2 font-bold"
            >
              ระบบแจ้งเตือน
            </h2>
            <p className="p-5 text-sm">{message}</p>
            <div className="flex justify-end p-3">
              <button
                autoFocus
                className={button}
                onClick={() => setMessage('')}
              >
                ตกลง
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
