import { useState } from 'react';
import { useMatch, useSearchParams } from 'react-router-dom';
import { useIpdRead } from '../../services/useIpdRead';
import DrugProfileTable from './DrugProfileTable';
import { addProfileDays, validProfileDate } from './drugProfileDates';

export default function DrugProfile() {
  const an = useMatch('/ipd/patients/:an')?.params.an || '';
  const [query, setQuery] = useSearchParams();
  const from = query.get('dpFrom') ?? query.get('orderdate') ?? '';
  const to = query.get('dpTo') ?? addProfileDays(from, 6);
  const [formError, setFormError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const validRange =
    validProfileDate(from) && validProfileDate(to) && from <= to;
  const history = useIpdRead(
    `/ipd/patients/${encodeURIComponent(an)}/drug-profile`,
    {
      wardCode: query.get('wardCode') || '',
      orderdate: query.get('orderdate') || '',
      from,
      to,
    },
    refresh,
    validRange
  );
  const items = history.data?.items || [];
  const applyDates = (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const draftFrom = values.get('from');
    const draftTo = values.get('to');
    if (
      !validProfileDate(draftFrom) ||
      !validProfileDate(draftTo) ||
      draftFrom > draftTo
    ) {
      setFormError('กรุณาเลือกวันที่เริ่มต้นไม่เกินวันที่สิ้นสุด');
      return;
    }
    setFormError('');
    const next = new URLSearchParams(query);
    next.set('dpFrom', draftFrom);
    next.set('dpTo', draftTo);
    next.delete('dpWeek');
    setQuery(next, { replace: true });
    setRefresh((value) => value + 1);
  };
  return (
    <section
      aria-label="Drug Profile"
      className="flex min-h-0 flex-1 flex-col border border-gray-300 bg-white"
    >
      <div className="shrink-0 space-y-1 border-b border-gray-300 bg-custom-r1 p-2">
        <form
          onSubmit={applyDates}
          aria-label="ค้นหาประวัติ Drug Profile"
          className="flex flex-wrap items-center gap-2"
        >
          <strong>Drug Profile</strong>
          <label className="flex items-center gap-1">
            วันที่เริ่มต้น
            <input
              required
              type="date"
              aria-label="วันที่เริ่มต้น Drug Profile"
              min="1753-01-01"
              max="9999-12-31"
              name="from"
              defaultValue={from}
              className="border border-gray-300 bg-white px-1 py-1"
            />
          </label>
          <label className="flex items-center gap-1">
            ถึง
            <input
              required
              type="date"
              aria-label="วันที่สิ้นสุด Drug Profile"
              min="1753-01-01"
              max="9999-12-31"
              name="to"
              defaultValue={to}
              className="border border-gray-300 bg-white px-1 py-1"
            />
          </label>
          <button
            type="submit"
            className="rounded border border-gray-400 bg-white px-3 py-1"
          >
            ค้นหาประวัติยา
          </button>
          <button
            type="button"
            onClick={() => setRefresh((value) => value + 1)}
            disabled={!validRange}
            className="rounded border border-gray-400 bg-white px-3 py-1 disabled:opacity-50"
          >
            โหลด Drug Profile ใหม่
          </button>
        </form>
        {formError && (
          <p role="alert" className="text-red-700">
            {formError}
          </p>
        )}
        <p className="text-gray-600">
          แสดงทุกรายการในช่วงวันที่ค้นหา · ช่องวันที่ 7
          วันเว้นว่างตามโปรแกรมเดิม
        </p>
      </div>
      <div className="min-h-0 flex-1" aria-busy={history.loading}>
        {!validRange ? (
          <p role="alert" className="p-4 text-red-700">
            ช่วงวันที่ Drug Profile ไม่ถูกต้อง กรุณาเลือกช่วงวันที่ใหม่
          </p>
        ) : history.loading ? (
          <p role="status" className="p-6 text-center text-gray-500">
            กำลังโหลดประวัติ Drug Profile…
          </p>
        ) : history.error ? (
          <div role="alert" className="p-4 text-red-700">
            <p>{history.error}</p>
            <button
              onClick={() => setRefresh((value) => value + 1)}
              className="mt-2 underline"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          <DrugProfileTable from={from} rows={items} />
        )}
      </div>
      <div className="flex shrink-0 justify-between bg-black px-3 py-1.5 text-white">
        <p role="status">แสดง {history.data ? items.length : '—'} รายการ</p>
        <span className="text-yellow-300">ดูข้อมูลเท่านั้น</span>
      </div>
    </section>
  );
}
