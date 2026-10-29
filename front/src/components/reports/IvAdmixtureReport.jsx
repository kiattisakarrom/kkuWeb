import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import IpdHeader from '../../header/IpdHeader';
import { IpdSessionContext } from '../../services/ipdSession';
import { clearSessionToken, ipdApi } from '../../services/ipdApi';
import { useIpdRead } from '../../services/useIpdRead';
import { bangkokDay } from '../Profile/nativeProfileFormat';
import { Printer } from 'lucide-react';
import {
  ivModes,
  ivWardColumns,
  ivDrugColumnsFor,
  ivHeaderColumns,
  ivValidRange,
  ivBasketAdd,
  ivPdfIds,
} from './ivAdmixtureFormat';

const button =
  'border border-gray-400 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';
const input =
  'rounded border border-gray-400 bg-white px-2 py-1 text-sm text-gray-900';

function IvGrid({
  label,
  columns,
  rows,
  resource,
  empty,
  onSelect,
  onDoubleClick,
  selected,
  selection,
  onSelection,
  onRetry,
  controls,
}) {
  const [sort, setSort] = useState(null);
  const visibleRows = sort
    ? [...rows].sort(
        (a, b) =>
          String(a[sort.key] ?? '').localeCompare(
            String(b[sort.key] ?? ''),
            'th'
          ) * sort.direction
      )
    : rows;
  return (
    <section
      aria-label={label}
      className="flex min-h-0 flex-1 flex-col border border-gray-400 bg-white"
    >
      <h2 className="shrink-0 bg-gray-200 px-2 py-1 font-bold">{label}</h2>
      {controls && (
        <div className="shrink-0 border-b border-gray-400 bg-white p-2">
          {controls}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto">
        <table
          aria-label={`ตาราง${label}`}
          className="w-full border-collapse text-left"
        >
          <thead className="sticky top-0 z-10 bg-custom-r1">
            <tr>
              {selection && (
                <th className="border border-gray-300 p-2">
                  <input
                    aria-label="เลือกใบสั่งยาทั้งหมดสำหรับ PDF"
                    type="checkbox"
                    disabled={!rows.length}
                    checked={
                      rows.length > 0 &&
                      rows.every((row) => selection.has(row.id))
                    }
                    onChange={(e) =>
                      onSelection(
                        e.target.checked
                          ? new Set(rows.map((row) => row.id))
                          : new Set()
                      )
                    }
                  />
                </th>
              )}
              {columns.map(([key, title, width]) => (
                <th
                  key={key}
                  style={{ minWidth: width }}
                  aria-sort={
                    sort?.key === key
                      ? sort.direction === 1
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className="whitespace-nowrap border border-gray-300 p-2"
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() =>
                      setSort((old) => ({
                        key,
                        direction: old?.key === key ? -old.direction : 1,
                      }))
                    }
                  >
                    {title}
                    {sort?.key === key
                      ? sort.direction === 1
                        ? ' ▲'
                        : ' ▼'
                      : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!resource?.loading &&
              !resource?.error &&
              visibleRows.map((row, index) => (
                <tr
                  key={row.id || row.code || index}
                  className={
                    selected === (row.id || row.code)
                      ? 'bg-blue-100'
                      : onSelect
                        ? 'cursor-pointer hover:bg-blue-50'
                        : ''
                  }
                  onClick={onSelect ? () => onSelect(row) : undefined}
                  onDoubleClick={
                    onDoubleClick ? () => onDoubleClick(row) : undefined
                  }
                >
                  {selection && (
                    <td className="border border-gray-300 p-2">
                      <input
                        type="checkbox"
                        aria-label={`เลือกใบสั่งยา ${row.prescriptionno} สำหรับ PDF`}
                        checked={selection.has(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          onSelect?.(row);
                          const next = new Set(selection);
                          if (e.target.checked) next.add(row.id);
                          else next.delete(row.id);
                          onSelection(next);
                        }}
                      />
                    </td>
                  )}
                  {columns.map(([key], cellIndex) => (
                    <td
                      key={key}
                      className="whitespace-nowrap border border-gray-300 p-2"
                      title={String(row[key] ?? '')}
                    >
                      {onSelect && cellIndex === 0 ? (
                        <button
                          type="button"
                          className="text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(row);
                          }}
                        >
                          {row[key] ?? ''}
                        </button>
                      ) : (
                        (row[key] ?? '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            {(resource?.loading || resource?.error || !rows.length) && (
              <tr>
                <td
                  colSpan={columns.length + (selection ? 1 : 0)}
                  className="p-4 text-gray-500"
                >
                  {resource?.loading ? (
                    <span role="status">กำลังโหลดข้อมูล…</span>
                  ) : resource?.error ? (
                    <div role="alert" className="text-red-700">
                      {resource.error}{' '}
                      <button className="underline" onClick={onRetry}>
                        ลองใหม่
                      </button>
                    </div>
                  ) : (
                    <span role="status">
                      {empty || 'ไม่พบข้อมูลตามเงื่อนไข'}
                    </span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
IvGrid.propTypes = {
  label: () => null,
  columns: () => null,
  rows: () => null,
  resource: () => null,
  empty: () => null,
  onSelect: () => null,
  onDoubleClick: () => null,
  selected: () => null,
  selection: () => null,
  onSelection: () => null,
  onRetry: () => null,
  controls: () => null,
};

function IvCount({ count, loading }) {
  return (
    <span className="ml-auto self-end whitespace-nowrap" role="status">
      จำนวน {loading ? '—' : count} รายการ
    </span>
  );
}
IvCount.propTypes = { count: () => null, loading: () => null };

function IvFilters({
  draft,
  setDraft,
  changeKind,
  apply,
  total,
  printButton,
  count,
  loading,
}) {
  const times = (key, label) => {
    const [hour, minute] = draft[key].split(':');
    const set = (part, value) =>
      setDraft((old) => ({
        ...old,
        [key]: part === 'hour' ? `${value}:${minute}` : `${hour}:${value}`,
      }));
    return (
      <div className="flex items-center gap-1" role="group" aria-label={label}>
        <select
          aria-label={`${label} ชั่วโมง`}
          className="w-12 border border-gray-400 bg-white p-1"
          value={hour}
          onChange={(e) => set('hour', e.target.value)}
        >
          {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(
            (v) => (
              <option key={v}>{v}</option>
            )
          )}
        </select>
        <span>:</span>
        <select
          aria-label={`${label} นาที`}
          className="w-12 border border-gray-400 bg-white p-1"
          value={minute}
          onChange={(e) => set('minute', e.target.value)}
        >
          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(
            (v) => (
              <option key={v}>{v}</option>
            )
          )}
        </select>
      </div>
    );
  };
  const kinds = (
    <fieldset
      aria-label="ประเภทรายการยา"
      className="flex shrink-0 flex-col gap-2 py-1 font-bold"
    >
      {[
        ['iv', 'IV Admixture'],
        ['individual', 'ยาเตรียมเฉพาะราย'],
      ].map(([value, label]) => (
        <label key={value} className="flex items-center gap-1">
          <input
            type="radio"
            name="ivKind"
            checked={draft.kind === value}
            onChange={() => changeKind(value)}
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
  return (
    <form
      onSubmit={apply}
      aria-label="ตัวกรอง IV Admixture"
      className={`flex gap-2 ${total ? 'flex-wrap items-start' : 'flex-col'}`}
    >
      {total && kinds}
      <div className="flex items-stretch gap-2">
        <div className="grid grid-cols-[auto_auto_auto] items-center gap-x-1 gap-y-2">
          <label htmlFor={`iv-from-${draft.mode}`}>วันที่ :</label>
          <input
            id={`iv-from-${draft.mode}`}
            aria-label="วันที่เริ่ม"
            type="date"
            className={`${input} w-[126px]`}
            value={draft.from}
            onChange={(e) =>
              setDraft((old) => ({ ...old, from: e.target.value }))
            }
          />
          {times('startTime', 'เวลาเริ่ม')}
          <label htmlFor={`iv-to-${draft.mode}`}>ถึง :</label>
          <input
            id={`iv-to-${draft.mode}`}
            aria-label="วันที่สิ้นสุด"
            type="date"
            className={`${input} w-[126px]`}
            value={draft.to}
            onChange={(e) =>
              setDraft((old) => ({ ...old, to: e.target.value }))
            }
          />
          {times('endTime', 'เวลาสิ้นสุด')}
        </div>
        <button type="submit" className={`${button} bg-[#b0c4de]`}>
          ค้นหา
        </button>
        {total && printButton}
      </div>
      {total ? (
        <IvCount count={count} loading={loading} />
      ) : (
        <div className="flex items-end justify-between gap-2">
          {kinds}
          <IvCount count={count} loading={loading} />
        </div>
      )}
    </form>
  );
}
IvFilters.propTypes = {
  draft: () => null,
  setDraft: () => null,
  changeKind: () => null,
  apply: () => null,
  total: () => null,
  printButton: () => null,
  count: () => null,
  loading: () => null,
};

function IvContents({ mode }) {
  const { total, sent } = ivModes[mode];
  const [draft, setDraft] = useState(() => ({
    mode,
    kind: 'iv',
    from: bangkokDay(),
    to: bangkokDay(),
    startTime: '00:00',
    endTime: '23:59',
  }));
  const [applied, setApplied] = useState(draft);
  const [refresh, setRefresh] = useState(0);
  const [wardCode, setWardCode] = useState('');
  const [headerId, setHeaderId] = useState('');
  const [selection, setSelection] = useState(() => new Set());
  const [basket, setBasket] = useState([]);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const exportController = useRef(null);
  const key = JSON.stringify(draft),
    ready = key === JSON.stringify(applied);
  const contextKey = `${key}|${wardCode}`;
  useEffect(() => {
    exportController.current?.abort();
    setExporting(false);
    setSelection(new Set());
    setHeaderId('');
    setError('');
    return () => exportController.current?.abort();
  }, [contextKey]);
  useEffect(() => {
    setWardCode('');
    setBasket([]);
  }, [key]);
  const wards = useIpdRead(
    '/reports/iv-admixture/wards',
    applied,
    refresh,
    ready && !total
  );
  const filters = { ...applied, ...(!total ? { wardCode } : {}) };
  const headers = useIpdRead(
    '/reports/iv-admixture/prescriptions',
    filters,
    refresh,
    ready && (total || Boolean(wardCode))
  );
  const wardRows = wards.data?.wards || [],
    rows = headers.data?.items || [];
  const header = rows.find((row) => row.id === headerId);
  const details = useIpdRead(
    '/reports/iv-admixture/items',
    { ...filters, headerId },
    refresh,
    Boolean(header) && !sent
  );
  const selectedWard = wardRows.find((row) => row.code === wardCode);
  const selectedIds = rows
    .filter((row) => selection.has(row.id))
    .map((row) => row.id);
  const reload = () => setRefresh((value) => value + 1);
  const apply = (event) => {
    event.preventDefault();
    if (!ivValidRange(draft)) {
      setError('กรุณาเลือกช่วงวันที่และเวลาให้ถูกต้อง');
      return;
    }
    setError('');
    setApplied({ ...draft });
    setWardCode('');
    setHeaderId('');
    setSelection(new Set());
    setBasket([]);
    reload();
  };
  const changeKind = (kind) => {
    const next = { ...draft, kind };
    setDraft(next);
    if (ivValidRange(next)) setApplied(next);
  };
  const addBasket = (row) => setBasket((old) => ivBasketAdd(old, row));
  const download = async (ids) => {
    if (!ids.length || ids.length > 200) {
      setError('กรุณาเลือกใบสั่งยาไม่เกิน 200 ใบต่อครั้ง');
      return;
    }
    const controller = new AbortController();
    exportController.current = controller;
    setExporting(true);
    setError('');
    try {
      const response = await ipdApi.post(
        '/reports/iv-admixture/pdf',
        { ...filters, ids },
        { responseType: 'blob', signal: controller.signal, timeout: 60000 }
      );
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(response.data),
        anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = total ? 'IV-Admixture-total.pdf' : 'IV-Admixture.pdf';
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
          /* Use fallback. */
        }
      }
      if (!controller.signal.aborted) setError(message);
    } finally {
      if (!controller.signal.aborted) setExporting(false);
    }
  };
  const rowsEmpty = !ready
    ? 'กดค้นหาเพื่อแสดงข้อมูลตามเงื่อนไขใหม่'
    : !total && !wardCode
      ? 'เลือกหอผู้ป่วยทางซ้ายเพื่อดูใบสั่งยา'
      : 'ไม่พบข้อมูลตามเงื่อนไข';
  const count = (items, resource) => (
    <IvCount count={items.length} loading={resource.loading} />
  );
  const printSelected = (
    <button
      type="button"
      className={`${button} flex items-center justify-center gap-2`}
      aria-label="ออก PDF จากใบสั่งยาที่ติ๊กเลือก"
      disabled={!ready || headers.loading || !selectedIds.length || exporting}
      onClick={() => download(selectedIds)}
    >
      <Printer size={24} />
      {exporting
        ? 'กำลังสร้าง PDF…'
        : total
          ? 'Print (PDF)'
          : 'PrintByOrderNo (PDF)'}
    </button>
  );
  const filterForm = (
    <IvFilters
      draft={draft}
      setDraft={setDraft}
      changeKind={changeKind}
      apply={apply}
      total={total}
      printButton={printSelected}
      count={total ? rows.length : wardRows.length}
      loading={total ? headers.loading : wards.loading}
    />
  );
  const wardInfo = (
    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
      <span>รหัสหอผู้ป่วย:</span>
      <span>{wardCode || '-'}</span>
      <span>หอผู้ป่วย:</span>
      <span>{selectedWard?.name || '-'}</span>
    </div>
  );
  const patientInfo = (
    <div
      className={`grid flex-1 gap-x-4 gap-y-1 ${total ? 'grid-cols-2' : 'grid-cols-1'}`}
    >
      <div className="flex gap-8">
        <span>HN: {header?.hn || '-'}</span>
        <span>AN: {header?.an || '-'}</span>
      </div>
      {total && <span>รหัสหอผู้ป่วย: {header?.wardcode || '-'}</span>}
      <span>ชื่อผู้ป่วย: {header?.patientname || '-'}</span>
      {total && <span>หอผู้ป่วย: {header?.wardname || '-'}</span>}
    </div>
  );
  return (
    <>
      {error && (
        <p role="alert" className="shrink-0 bg-red-50 p-2 text-red-700">
          {error}
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="flex h-full min-w-[1100px] gap-1" data-iv-mode={mode}>
          {!total && (
            <div className="flex min-h-0 w-[31%] min-w-[365px] flex-col">
              <IvGrid
                label="หอผู้ป่วยที่ส่งห้องผลิต"
                columns={ivWardColumns}
                rows={wardRows}
                resource={wards}
                controls={filterForm}
                selected={wardCode}
                onSelect={(row) => {
                  setWardCode(row.code);
                  setHeaderId('');
                }}
                onRetry={reload}
                empty={
                  !ready ? 'กดค้นหาเพื่อแสดงข้อมูลตามเงื่อนไขใหม่' : undefined
                }
              />
            </div>
          )}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1">
            <IvGrid
              label="ใบสั่งยาของผู้ป่วย"
              columns={ivHeaderColumns(mode)}
              rows={rows}
              resource={headers}
              controls={
                total ? (
                  filterForm
                ) : (
                  <div className="flex min-h-[52px] items-start gap-3">
                    {printSelected}
                    {wardInfo}
                    {count(rows, headers)}
                  </div>
                )
              }
              empty={rowsEmpty}
              selected={headerId}
              onSelect={(row) => setHeaderId(row.id)}
              onDoubleClick={total ? addBasket : undefined}
              selection={selection}
              onSelection={setSelection}
              onRetry={reload}
            />
            {!sent && (
              <div className="flex min-h-0 flex-1 flex-col">
                <IvGrid
                  label="รายการยาของผู้ป่วย"
                  columns={ivDrugColumnsFor(mode)}
                  rows={details.data?.items || []}
                  resource={details}
                  controls={
                    <div className="flex min-h-[45px] items-start gap-2">
                      {patientInfo}
                      {count(details.data?.items || [], details)}
                    </div>
                  }
                  onRetry={reload}
                  empty={
                    header ? 'ไม่พบรายการยา' : 'เลือกใบสั่งยาเพื่อดูรายการยา'
                  }
                />
              </div>
            )}
          </div>
          {total && (
            <section
              aria-label="รายการรวมใบสั่งยา"
              className="flex min-h-0 w-[23%] min-w-[230px] flex-col border border-gray-400 bg-white"
            >
              <div className="flex h-[104px] shrink-0 flex-col items-start justify-between border-b border-gray-400 p-2">
                <button
                  type="button"
                  aria-label="ออก PDF จากรายการรวมใบสั่งยา"
                  className={`${button} flex min-h-[48px] items-center gap-2`}
                  disabled={
                    !ready || headers.loading || !basket.length || exporting
                  }
                  onClick={() => download(ivPdfIds(basket))}
                >
                  <Printer size={24} />
                  PrintByOrderNo (PDF)
                </button>
                <span role="status">จำนวน {basket.length} รายการ</span>
              </div>
              <div className="min-h-0 flex-1 overflow-auto">
                <table
                  aria-label="ตารางรายการรวมใบสั่งยา"
                  className="w-full border-collapse text-left"
                >
                  <thead className="sticky top-0 bg-custom-r1">
                    <tr>
                      <th className="min-w-[160px] border border-gray-300 p-2">
                        เลขที่ใบสั่งยา
                      </th>
                      <th className="border border-gray-300 p-2">ลบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {basket.map((row) => (
                      <tr key={row.entryId}>
                        <td className="border border-gray-300 p-2">
                          {row.prescriptionno}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <button
                            type="button"
                            aria-label={`นำใบสั่งยา ${row.prescriptionno} ออกจากรายการรวม`}
                            onClick={() =>
                              setBasket((old) =>
                                old.filter(
                                  (item) => item.entryId !== row.entryId
                                )
                              )
                            }
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
IvContents.propTypes = { mode: () => null };

export default function IvAdmixtureReport() {
  const { user, context } = useContext(IpdSessionContext);
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const mode = query.get('mode') || 'ward-wait';
  const [notice, setNotice] = useState('');
  const [pageVersion, setPageVersion] = useState(0);
  return (
    <div className="flex h-screen min-h-[580px] flex-col bg-custom-or font-sans text-xs text-gray-900">
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
        aria-label="Report IV Admixture"
        className="flex min-h-0 flex-1 flex-col gap-1 p-1"
      >
        <div className="flex shrink-0 justify-between px-2 py-2">
          <h1 className="font-bold">Report &gt; IV Admixture</h1>
          <span>ดูข้อมูลเท่านั้น</span>
        </div>
        <div
          role="tablist"
          aria-label="หน้า IV Admixture"
          className="flex shrink-0 flex-wrap gap-1"
        >
          {Object.entries(ivModes).map(([key, entry]) => (
            <button
              type="button"
              role="tab"
              aria-selected={mode === key}
              key={key}
              className={button}
              style={{
                minWidth: 144,
                minHeight: 64,
                backgroundColor:
                  mode === key ? (entry.sent ? '#fa8072' : '#7cfc00') : 'white',
              }}
              onClick={() => {
                setQuery({ mode: key });
                setPageVersion((value) => value + 1);
                setNotice('');
              }}
            >
              {entry.label}
            </button>
          ))}
        </div>
        {notice && (
          <p role="status" className="bg-blue-50 p-2">
            {notice}
          </p>
        )}
        {Object.hasOwn(ivModes, mode) ? (
          <IvContents key={`${mode}:${pageVersion}`} mode={mode} />
        ) : (
          <p role="alert" className="p-4 text-red-700">
            หน้ารายงาน IV Admixture ไม่ถูกต้อง
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
