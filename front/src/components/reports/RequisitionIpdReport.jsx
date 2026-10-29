import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IpdHeader from '../../header/IpdHeader';
import { IpdSessionContext } from '../../services/ipdSession';
import { apiMessage, clearSessionToken, ipdApi } from '../../services/ipdApi';
import { bangkokDay } from '../Profile/nativeProfileFormat';
import ReportPdfPreview from './ReportPdfPreview';

const button =
  'border border-gray-400 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';
const field =
  'min-w-0 rounded border border-gray-400 bg-white px-2 py-2 text-sm';
const variants = {
  opdrad: {
    room: 'ห้องยา OPD อาคารรังสี',
    api: '/reports/requisition-opdrad/preview',
    filename: 'OPDRAD-Requisition-Report.pdf',
    bundle: true,
    missingFilename: 'OPDRAD-Unmapped-Drugs.pdf',
  },
  ivrad: {
    room: 'ห้องยาเตรียมอาคารรังสี',
    api: '/reports/requisition-ivrad/pdf',
    filename: 'IVRAD-Requisition-Report.pdf',
  },
  'fixed-stock': {
    label: 'ห้องยาเสพติดและ Fixed Stock',
    room: 'ห้องจ่ายยาเสพติด และ Fixed Stock',
    api: '/reports/requisition-fixed-stock/pdf',
    filename: 'Fixed-Stock-Requisition-Report.pdf',
  },
  ipd: {
    room: 'ห้องยา IPD',
    api: '/reports/requisition-ipd/pdf',
    filename: 'IPD-Requisition-Report.pdf',
  },
  dc: {
    room: 'ห้องยา D/C',
    api: '/reports/requisition-dc/pdf',
    filename: 'DC-Requisition-Report.pdf',
  },
  iv: {
    room: 'ห้องเตรียมยาอาคารเภสัชกรรม',
    api: '/reports/requisition-iv/pdf',
    filename: 'IV-Requisition-Report.pdf',
  },
  er: {
    room: 'ห้องยา ER',
    api: '/reports/requisition-er/preview',
    filename: 'ER-Requisition-Report.pdf',
    bundle: true,
    missingFilename: 'ER-Unmapped-Drugs.pdf',
  },
};
const pdfBlob = (base64) =>
  new Blob([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], {
    type: 'application/pdf',
  });
// These Windows menu entries open the same ucUD form and Crystal template.
export default function RequisitionIpdReport({ variant = 'ipd' }) {
  const report = Object.hasOwn(variants, variant)
    ? variants[variant]
    : variants.ipd;
  const label = report.label || report.room;
  const { user, context } = useContext(IpdSessionContext),
    navigate = useNavigate();
  const [from, setFrom] = useState(bangkokDay),
    [to, setTo] = useState(bangkokDay),
    [kind, setKind] = useState('floor4');
  const [result, setResult] = useState(null),
    [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''),
    [notice, setNotice] = useState('');
  const [sourceWarning, setSourceWarning] = useState(''),
    [missingOpen, setMissingOpen] = useState(false);
  const [page, setPage] = useState(1),
    [zoom, setZoom] = useState('FitH');
  const controller = useRef(null),
    urlRef = useRef(null);
  useEffect(() => {
    controller.current?.abort();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setResult(null);
    setLoading(false);
    setMessage('');
    setSourceWarning('');
    setMissingOpen(false);
    setPage(1);
    return () => {
      controller.current?.abort();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, [from, to, kind, variant]);
  const search = async (event) => {
    event.preventDefault();
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
        report.api,
        { from, to, kind },
        {
          responseType: report.bundle ? 'json' : 'blob',
          signal: request.signal,
          // ER can read MSSQL then OPD before rendering the PDF (120s each).
          timeout: 300000,
        }
      );
      if (request.signal.aborted) return;
      const er = report.bundle ? response.data : null;
      if (er) {
        setSourceWarning(er.sourceWarning || '');
        if (er.sourceReady === false) return;
        if (!er.pdf) {
          setMessage(er.message || 'ไม่พบข้อมูลใบสั่งยา');
          return;
        }
      }
      const file = er ? pdfBlob(er.pdf) : response.data;
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setResult({
        url,
        file,
        pages: Math.max(
          1,
          Number(er ? er.pages : response.headers['x-report-pages']) || 1
        ),
        missingDrugs: er?.missingDrugs || [],
        missingFile: er?.missingPdf ? pdfBlob(er.missingPdf) : null,
      });
      if (er?.missingDrugs?.length) setMissingOpen(true);
      if (er?.message) setMessage(er.message);
      if (!er && Number(response.headers['x-report-rows']) === 0)
        setMessage('ไม่พบข้อมูล');
    } catch (error) {
      if (request.signal.aborted) return;
      let text = 'โหลดรายงานไม่ได้ กรุณาลองใหม่';
      if (error.code === 'ECONNABORTED') {
        text =
          'การรวมข้อมูลใบเบิกใช้เวลาเกินกำหนด กรุณาลองใหม่หรือลดช่วงวันที่';
      } else if (error.response?.data instanceof Blob) {
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
    anchor.download = report.filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };
  const downloadMissing = () => {
    if (!result?.missingFile) return;
    const url = URL.createObjectURL(result.missingFile);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = report.missingFilename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const changePage = (value) =>
    setPage(Math.min(result?.pages || 1, Math.max(1, value || 1)));
  const radio = (value, label, large = false) => (
    <label
      className={`flex items-center gap-2 font-bold ${large ? 'text-lg text-red-600' : 'pl-6 text-base'}`}
    >
      <input
        type="radio"
        name="requisitionKind"
        checked={kind === value}
        onChange={() => setKind(value)}
      />
      {label}
    </label>
  );
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
        aria-label={`Report ใบเบิก ${label}`}
        className="flex min-h-0 flex-1 flex-col gap-1 p-1"
      >
        <div className="flex shrink-0 justify-between px-2 py-1">
          <h1>Report &gt; ใบเบิก &gt; {label}</h1>
          <span>ดูข้อมูลเท่านั้น</span>
        </div>
        {notice && (
          <p role="status" className="bg-blue-50 p-2">
            {notice}
          </p>
        )}
        {sourceWarning && (
          <p
            role="status"
            className="border border-amber-500 bg-amber-50 p-2 text-amber-900"
          >
            {sourceWarning}
          </p>
        )}
        {!!result?.missingDrugs?.length && (
          <button
            type="button"
            className={`${button} self-start`}
            onClick={() => setMissingOpen(true)}
          >
            รหัสยาที่ไม่มีใน Unitdose ({result.missingDrugs.length})
          </button>
        )}
        <div className="flex min-h-0 flex-1 gap-1">
          <form
            aria-label={`เงื่อนไขใบเบิก${report.room}`}
            onSubmit={search}
            className="w-[313px] min-w-[255px] shrink-0 overflow-y-auto border border-gray-400 bg-white p-4"
          >
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
              <label htmlFor="requisition-from" className="text-base">
                วันที่ :
              </label>
              <input
                id="requisition-from"
                aria-label="วันที่เริ่ม"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className={field}
                required
              />
              <label htmlFor="requisition-to" className="text-base">
                ถึง :
              </label>
              <input
                id="requisition-to"
                aria-label="วันที่สิ้นสุด"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className={field}
                required
              />
            </div>
            <fieldset className="mt-7 px-4">
              <legend className="mb-2 text-lg font-bold text-red-600">
                ส่งใบเบิกชั้น 3
              </legend>
              <div className="flex flex-col gap-2">
                {radio('hospital', 'รพ.ผลิตเอง')}
                {radio('antibiotic', 'ยาฆ่าเชื้อ')}
              </div>
            </fieldset>
            <div className="mt-4 flex flex-col gap-2 px-4">
              {radio('floor4', 'ส่งใบเบิกชั้น 4', true)}
              {radio('narcotic', 'ยาเสพติด', true)}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mx-auto mt-14 block min-h-[50px] min-w-[136px] border border-gray-400 bg-slate-500 px-3 py-2 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              {loading ? 'กำลังโหลด…' : 'OK'}
            </button>
          </form>
          <section
            aria-label={`ตัวอย่างใบเบิก${report.room}`}
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
                title={`ใบเบิก${report.room}`}
              />
            ) : (
              <p role="status" className="p-6 text-center text-gray-600">
                เลือกช่วงวันที่และประเภทใบเบิก แล้วกด OK เพื่อแสดงรายงาน
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
      {missingOpen && result?.missingDrugs?.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="requisition-missing-title"
            className="flex max-h-[85vh] w-[876px] max-w-[95vw] flex-col border border-gray-400 bg-white shadow-xl"
          >
            <h2
              id="requisition-missing-title"
              className="bg-blue-100 px-4 py-2 font-bold"
            >
              ระบบแจ้งเตือนรหัสยา OPD ที่ไม่มีใน Unitdose
            </h2>
            <div className="flex items-center justify-between p-3">
              <span className="font-bold text-red-600">
                จำนวน {result.missingDrugs.length} รายการ
              </span>
              <button
                type="button"
                className={button}
                onClick={downloadMissing}
              >
                PDF รายการยา
              </button>
            </div>
            <div className="min-h-0 overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="border p-2">รหัสยา</th>
                    <th className="border p-2">ชื่อยา</th>
                  </tr>
                </thead>
                <tbody>
                  {result.missingDrugs.map((row, index) => (
                    <tr key={index}>
                      <td className="border p-2">{row.orderitemcode}</td>
                      <td className="border p-2">{row.orderitemname}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end p-3">
              <button
                type="button"
                autoFocus
                className={button}
                onClick={() => setMissingOpen(false)}
              >
                ปิด
              </button>
            </div>
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
            aria-labelledby="requisition-message-title"
            className="w-[400px] max-w-[95vw] border border-gray-400 bg-white shadow-xl"
          >
            <h2
              id="requisition-message-title"
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
RequisitionIpdReport.propTypes = { variant: () => null };
