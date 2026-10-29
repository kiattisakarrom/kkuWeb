import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IpdHeader from '../../header/IpdHeader';
import { IpdSessionContext } from '../../services/ipdSession';
import { apiMessage, clearSessionToken, ipdApi } from '../../services/ipdApi';
import { bangkokDay } from '../Profile/nativeProfileFormat';
import columns from './pharmcareSummaryColumns.json';

const button =
  'border border-gray-400 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';
const input =
  'min-w-0 rounded border border-gray-400 bg-white px-2 py-1.5 text-sm';
const rowHeight = 32,
  headerHeight = 40;
export default function PharmcareSummaryReport() {
  const { user, context } = useContext(IpdSessionContext);
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => ({
    from: bangkokDay(),
    to: bangkokDay(),
    type: 'IPD',
  }));
  const [result, setResult] = useState(null),
    [loading, setLoading] = useState(false),
    [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(''),
    [notice, setNotice] = useState(''),
    [sort, setSort] = useState(null),
    [selected, setSelected] = useState(null);
  const [scrollTop, setScrollTop] = useState(0),
    [height, setHeight] = useState(500);
  const readController = useRef(null),
    exportController = useRef(null),
    grid = useRef(null);
  const key = JSON.stringify(draft);
  useEffect(() => {
    readController.current?.abort();
    exportController.current?.abort();
    setResult(null);
    setLoading(false);
    setExporting(false);
    setMessage('');
    setSort(null);
    setSelected(null);
    setScrollTop(0);
    if (grid.current) grid.current.scrollTop = 0;
    return () => {
      readController.current?.abort();
      exportController.current?.abort();
    };
  }, [key]);
  useEffect(() => {
    const observer = new ResizeObserver((entries) =>
      setHeight(entries[0].contentRect.height)
    );
    observer.observe(grid.current);
    return () => observer.disconnect();
  }, []);
  const rows = useMemo(() => {
    const items = (result?.rows || []).map((row, index) => ({ ...row, index }));
    return sort
      ? items.sort(
          (a, b) =>
            a[sort.key].localeCompare(b[sort.key], 'th') *
            (sort.direction === 'asc' ? 1 : -1)
        )
      : items;
  }, [result, sort]);
  const start = Math.max(
    0,
    Math.floor(Math.max(0, scrollTop - headerHeight) / rowHeight) - 8
  );
  const end = Math.min(rows.length, start + Math.ceil(height / rowHeight) + 18);
  const visible = rows.slice(start, end);
  const search = async (event) => {
    event.preventDefault();
    if (!draft.from || !draft.to || draft.from > draft.to) {
      setMessage('กรุณาเลือกช่วงวันที่ให้ถูกต้อง');
      return;
    }
    readController.current?.abort();
    exportController.current?.abort();
    setExporting(false);
    const request = new AbortController();
    readController.current = request;
    setResult(null);
    setLoading(true);
    setMessage('');
    setSelected(null);
    setSort(null);
    grid.current.scrollTop = 0;
    setScrollTop(0);
    try {
      const { data } = await ipdApi.get('/reports/pharmcare-summary/rows', {
        params: draft,
        signal: request.signal,
        timeout: 60000,
      });
      if (request.signal.aborted) return;
      setResult(data);
      if (!data.rows.length) setMessage('ไม่พบข้อมูล');
    } catch (error) {
      if (!request.signal.aborted)
        setMessage(apiMessage(error, 'เกิดข้อผิดพลาดขณะประมวลผล'));
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  };
  const exportReport = async (format) => {
    if (!result?.rows.length) return;
    const request = new AbortController();
    exportController.current?.abort();
    exportController.current = request;
    setExporting(format);
    setMessage('');
    try {
      const { data } = await ipdApi.post(
        `/reports/pharmcare-summary/${format}`,
        {
          ...result.filters,
          snapshot: result.snapshot,
          ...(sort ? { sortKey: sort.key, sortDirection: sort.direction } : {}),
        },
        { responseType: 'blob', signal: request.signal, timeout: 60000 }
      );
      if (request.signal.aborted) return;
      const url = URL.createObjectURL(data),
        anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Pharmcare-Summary.${format}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      if (request.signal.aborted) return;
      let text = `Export ${format === 'pdf' ? 'PDF' : 'Excel'} ไม่สำเร็จ กรุณาลองใหม่`;
      if (error.response?.data instanceof Blob) {
        try {
          text = JSON.parse(await error.response.data.text()).message || text;
        } catch {
          /* Fallback. */
        }
      } else text = apiMessage(error, text);
      if (!request.signal.aborted) setMessage(text);
    } finally {
      if (!request.signal.aborted) setExporting(false);
    }
  };
  const navigateRows = (event) => {
    const amount = {
      ArrowDown: 1,
      ArrowUp: -1,
      PageDown: Math.max(1, Math.floor(height / rowHeight) - 1),
      PageUp: -Math.max(1, Math.floor(height / rowHeight) - 1),
    }[event.key];
    if (amount === undefined || !rows.length) return;
    event.preventDefault();
    const current = rows.findIndex((row) => row.index === selected);
    const next = Math.min(
      rows.length - 1,
      Math.max(0, current < 0 ? 0 : current + amount)
    );
    setSelected(rows[next].index);
    const top = headerHeight + next * rowHeight,
      bottom = top + rowHeight;
    if (top < grid.current.scrollTop + headerHeight)
      grid.current.scrollTop = next * rowHeight;
    else if (bottom > grid.current.scrollTop + height)
      grid.current.scrollTop = bottom - height;
  };
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
        aria-label="รายงานสรุปการทำ Pharmcare"
        className="flex min-h-0 flex-1 flex-col gap-1 p-1"
      >
        <div className="flex shrink-0 justify-between px-2 py-2">
          <h1>Report &gt; Pharmcare &gt; รายงานสรุปการทำ Pharmcare</h1>
          <span>ดูข้อมูลเท่านั้น</span>
        </div>
        {notice && (
          <p role="status" className="shrink-0 bg-blue-50 p-2">
            {notice}
          </p>
        )}
        <div className="flex min-h-0 flex-1 gap-1">
          <form
            aria-label="เงื่อนไขรายงาน Pharmcare"
            onSubmit={search}
            className="w-[288px] min-w-[230px] shrink-0 border border-gray-400 bg-white px-2 pt-6"
          >
            <fieldset className="border border-gray-400 px-3 pb-4 pt-2">
              <legend className="px-1 text-sm">เลือกช่วงวันที่ :</legend>
              <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-2">
                <label htmlFor="pharm-summary-from">วันที่ :</label>
                <input
                  id="pharm-summary-from"
                  type="date"
                  className={input}
                  aria-label="วันที่เริ่ม"
                  value={draft.from}
                  onChange={(e) => setDraft({ ...draft, from: e.target.value })}
                  required
                />
                <label htmlFor="pharm-summary-to">ถึง :</label>
                <input
                  id="pharm-summary-to"
                  type="date"
                  className={input}
                  aria-label="วันที่สิ้นสุด"
                  value={draft.to}
                  onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                  required
                />
              </div>
            </fieldset>
            <fieldset className="mt-2 border border-gray-400 px-3 pb-6 pt-4">
              <legend className="px-1 text-sm">เลือกห้องยา :</legend>
              <div className="flex justify-evenly gap-4 text-base">
                {['IPD', 'OPD'].map((type) => (
                  <label key={type} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="pharmSummaryType"
                      checked={draft.type === type}
                      onChange={() => setDraft({ ...draft, type })}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="submit"
                className={button}
                disabled={loading || exporting}
              >
                {loading ? 'กำลังโหลด…' : 'OK'}
              </button>
              <button
                type="button"
                className={button}
                onClick={() => exportReport('pdf')}
                disabled={!result?.rows.length || loading || exporting}
              >
                {exporting === 'pdf' ? 'กำลัง Export…' : 'Export (PDF)'}
              </button>
              <button
                type="button"
                className={`${button} col-span-2`}
                onClick={() => exportReport('xlsx')}
                disabled={!result?.rows.length || loading || exporting}
              >
                {exporting === 'xlsx'
                  ? 'กำลัง Export…'
                  : 'Export Excel (.xlsx)'}
              </button>
            </div>
          </form>
          <section
            aria-label="รายการสรุป Pharmcare"
            className="flex min-h-0 min-w-0 flex-1 flex-col border border-gray-400 bg-white"
          >
            <div role="status" className="shrink-0 bg-gray-100 px-2 py-2">
              จำนวน {loading ? '—' : rows.length} รายการ
            </div>
            <div
              ref={grid}
              tabIndex={0}
              aria-label="เลื่อนดูตารางสรุป Pharmcare"
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
              onKeyDown={navigateRows}
              className="min-h-0 flex-1 overflow-auto"
            >
              <table
                aria-label="ตารางสรุปการทำ Pharmcare"
                aria-rowcount={rows.length + 1}
                className="border-collapse text-left"
                style={{
                  width: columns.reduce((sum, col) => sum + col[2], 0),
                  tableLayout: 'fixed',
                }}
              >
                <colgroup>
                  {columns.map(([key, , width]) => (
                    <col key={key} style={{ width }} />
                  ))}
                </colgroup>
                <thead className="sticky top-0 z-10 bg-custom-r1">
                  <tr style={{ height: headerHeight }}>
                    {columns.map(([key, label]) => (
                      <th
                        key={key}
                        aria-sort={
                          sort?.key === key
                            ? sort.direction === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                        className="border border-gray-300 px-2 py-1"
                      >
                        <button
                          type="button"
                          className="w-full whitespace-nowrap text-left"
                          onClick={() => {
                            setSort((old) => ({
                              key,
                              direction:
                                old?.key === key && old.direction === 'asc'
                                  ? 'desc'
                                  : 'asc',
                            }));
                            grid.current.scrollTop = 0;
                            setScrollTop(0);
                          }}
                        >
                          {label}
                          {sort?.key === key
                            ? sort.direction === 'asc'
                              ? ' ▲'
                              : ' ▼'
                            : ''}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {start > 0 && (
                    <tr
                      aria-hidden="true"
                      style={{ height: start * rowHeight }}
                    >
                      <td colSpan={columns.length} />
                    </tr>
                  )}
                  {!loading &&
                    visible.map((row, index) => (
                      <tr
                        key={row.index}
                        aria-rowindex={start + index + 2}
                        aria-selected={selected === row.index}
                        style={{ height: rowHeight }}
                        className={
                          selected === row.index
                            ? 'bg-blue-100'
                            : 'hover:bg-blue-50'
                        }
                        onClick={() => {
                          setSelected(row.index);
                          grid.current.focus({ preventScroll: true });
                        }}
                      >
                        {columns.map(([key]) => (
                          <td
                            key={key}
                            title={row[key]}
                            className="overflow-hidden text-ellipsis whitespace-nowrap border border-gray-300 px-2 py-1"
                          >
                            {row[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  {rows.length > end && (
                    <tr
                      aria-hidden="true"
                      style={{ height: (rows.length - end) * rowHeight }}
                    >
                      <td colSpan={columns.length} />
                    </tr>
                  )}
                  {(loading || !rows.length) && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="p-4 text-gray-500"
                      >
                        <span role="status">
                          {loading
                            ? 'กำลังโหลดข้อมูล…'
                            : result
                              ? 'ไม่พบข้อมูล'
                              : 'เลือกช่วงวันที่และห้องยา แล้วกด OK'}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
      {message && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setMessage('');
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="pharm-summary-message-title"
            aria-describedby="pharm-summary-message"
            className="w-[400px] max-w-[95vw] rounded border border-gray-400 bg-white shadow-xl"
          >
            <h2
              id="pharm-summary-message-title"
              className="bg-blue-100 px-4 py-2 font-bold"
            >
              ระบบแจ้งเตือน
            </h2>
            <p id="pharm-summary-message" className="p-5 text-sm">
              {message}
            </p>
            <div className="flex justify-end p-3">
              <button
                autoFocus
                type="button"
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
