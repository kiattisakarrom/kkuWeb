import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import IpdHeader from '../../header/IpdHeader';
import { IpdSessionContext } from '../../services/ipdSession';
import { apiMessage, clearSessionToken, ipdApi } from '../../services/ipdApi';
import { useIpdRead } from '../../services/useIpdRead';
import { bangkokDay } from '../Profile/nativeProfileFormat';
import ReportPdfPreview from './ReportPdfPreview';

const button =
  'flex items-center justify-center gap-1 border border-gray-400 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';
const field =
  'rounded border border-gray-400 bg-white px-2 py-2 text-sm text-gray-900';
export default function MedTransferReport() {
  const { user, context } = useContext(IpdSessionContext);
  const navigate = useNavigate();
  const [date, setDate] = useState(bangkokDay),
    [wardCode, setWardCode] = useState(null);
  const [retry, setRetry] = useState(0),
    [result, setResult] = useState(null),
    [loading, setLoading] = useState(false);
  const [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [page, setPage] = useState(1),
    [zoom, setZoom] = useState('FitH');
  const controller = useRef(null),
    urlRef = useRef(null);
  const wards = useIpdRead('/reports/med-transfer/wards', {}, retry);
  useEffect(() => {
    if (wards.data)
      setWardCode((old) => old ?? wards.data.wards[0]?.code ?? null);
  }, [wards.data]);
  useEffect(() => {
    controller.current?.abort();
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setResult(null);
    setError('');
    setLoading(false);
    setPage(1);
    return () => {
      controller.current?.abort();
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [date, wardCode]);
  const search = async (event) => {
    event.preventDefault();
    if (!date || !wardCode) {
      setError('กรุณาเลือกวันที่และหอผู้ป่วย');
      return;
    }
    controller.current?.abort();
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    const request = new AbortController();
    controller.current = request;
    setLoading(true);
    setResult(null);
    setError('');
    setPage(1);
    try {
      const response = await ipdApi.post(
        '/reports/med-transfer/pdf',
        { date, wardCode },
        { responseType: 'blob', signal: request.signal, timeout: 60000 }
      );
      if (request.signal.aborted) return;
      const url = URL.createObjectURL(response.data);
      urlRef.current = url;
      setResult({
        url,
        file: response.data,
        pages: Math.max(1, Number(response.headers['x-report-pages']) || 1),
        rows: Number(response.headers['x-report-rows']) || 0,
      });
    } catch (requestError) {
      if (request.signal.aborted) return;
      let message = apiMessage(requestError, 'โหลดรายงานไม่ได้ กรุณาลองใหม่');
      if (requestError.response?.data instanceof Blob) {
        try {
          message =
            JSON.parse(await requestError.response.data.text()).message ||
            'โหลดรายงานไม่ได้ กรุณาลองใหม่';
        } catch {
          message = 'โหลดรายงานไม่ได้ กรุณาลองใหม่';
        }
      }
      if (!request.signal.aborted)
        setError(
          typeof message === 'string'
            ? message
            : 'โหลดรายงานไม่ได้ กรุณาลองใหม่'
        );
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  };
  const download = () => {
    if (!result) return;
    const anchor = document.createElement('a');
    anchor.href = result.url;
    anchor.download = 'Medicine-Cart-Report.pdf';
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
        aria-label="Report Med Transfer"
        className="flex min-h-0 flex-1 flex-col gap-1 p-1"
      >
        <div className="flex shrink-0 justify-between px-2 py-1">
          <span>Report &gt; Med Transfer</span>
          <span>ดูข้อมูลเท่านั้น</span>
        </div>
        <section
          aria-label="เงื่อนไขรายงานการบรรจุยาเข้ารถเข็น"
          className="shrink-0 border border-gray-400 bg-white p-3"
        >
          <h1 className="text-center text-xl font-bold">
            รายงานการบรรจุยาเข้ารถเข็น
          </h1>
          <form
            onSubmit={search}
            className="mt-3 flex flex-wrap items-center justify-center gap-3"
          >
            <label className="flex items-center gap-2 text-base">
              วันที่ :{' '}
              <input
                aria-label="วันที่รายงาน"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={field}
                required
              />
            </label>
            <label className="flex items-center gap-2 text-base">
              หอผู้ป่วย :
              <select
                aria-label="หอผู้ป่วย"
                className={`${field} w-[290px]`}
                value={wardCode ?? ''}
                disabled={wards.loading || Boolean(wards.error)}
                onChange={(e) => setWardCode(e.target.value)}
              >
                {!wards.data?.wards.length && (
                  <option value="">
                    {wards.loading ? 'กำลังโหลดหอผู้ป่วย…' : 'ไม่พบหอผู้ป่วย'}
                  </option>
                )}
                {(wards.data?.wards || []).map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className={`${button} min-h-[52px] bg-[#b0c4de]`}
              disabled={
                loading ||
                wards.loading ||
                Boolean(wards.error) ||
                wardCode === null
              }
            >
              {loading ? 'กำลังค้นหา…' : 'ค้นหา'}
            </button>
          </form>
          {wards.error && (
            <p role="alert" className="mt-2 text-center text-red-700">
              {wards.error}{' '}
              <button
                className="underline"
                onClick={() => setRetry((value) => value + 1)}
              >
                ลองใหม่
              </button>
            </p>
          )}
        </section>
        {notice && (
          <p role="status" className="bg-blue-50 p-2">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="bg-red-50 p-2 text-red-700">
            {error}
          </p>
        )}
        <section
          aria-label="ตัวอย่างรายงานการบรรจุยาเข้ารถเข็น"
          className="flex min-h-0 flex-1 flex-col border border-gray-400 bg-gray-200"
        >
          <div
            role="toolbar"
            aria-label="เครื่องมือรายงาน"
            className="flex shrink-0 flex-wrap items-center gap-1 border-b border-gray-400 bg-gray-100 p-1"
          >
            <button
              type="button"
              className={button}
              onClick={download}
              disabled={!result || loading}
            >
              <Download size={17} />
              ดาวน์โหลด PDF
            </button>
            <button
              type="button"
              aria-label="หน้าแรก"
              className={button}
              disabled={!result || page <= 1}
              onClick={() => changePage(1)}
            >
              <ChevronFirst size={16} />
            </button>
            <button
              type="button"
              aria-label="หน้าก่อนหน้า"
              className={button}
              disabled={!result || page <= 1}
              onClick={() => changePage(page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <label className="flex items-center gap-1 px-1">
              หน้า{' '}
              <input
                aria-label="หน้ารายงาน"
                type="number"
                min="1"
                max={result?.pages || 1}
                value={page}
                disabled={!result}
                onChange={(e) => changePage(Number(e.target.value))}
                className="w-14 border border-gray-400 bg-white p-1"
              />{' '}
              / {result?.pages || 0}
            </label>
            <button
              type="button"
              aria-label="หน้าถัดไป"
              className={button}
              disabled={!result || page >= result.pages}
              onClick={() => changePage(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              aria-label="หน้าสุดท้าย"
              className={button}
              disabled={!result || page >= result.pages}
              onClick={() => changePage(result.pages)}
            >
              <ChevronLast size={16} />
            </button>
            <select
              aria-label="ขนาดการแสดงรายงาน"
              className="ml-2 border border-gray-400 bg-white p-1.5"
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              disabled={!result}
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
            <>
              {result.rows === 0 && (
                <p role="status" className="shrink-0 bg-white p-2 text-center">
                  ไม่พบข้อมูลตามวันที่และหอผู้ป่วยที่เลือก
                </p>
              )}
              <ReportPdfPreview file={result.file} page={page} zoom={zoom} />
            </>
          ) : (
            <p role="status" className="p-6 text-center text-gray-600">
              เลือกวันที่และหอผู้ป่วยแล้วกดค้นหาเพื่อแสดงรายงาน
            </p>
          )}
        </section>
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
