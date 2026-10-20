import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIpdRead } from '../../services/useIpdRead';
import {
  profileEntrySources,
  nextProfileEntryAlert,
} from './profileEntryAlerts';
import {
  pharmacistNoteColumns,
  pharmacistNoteDate,
  pharmacistNoteText,
} from './pharmacistNoteFormat';

function EntryNoteList({ notes }) {
  const [chosen, setChosen] = useState(null);
  const selected = notes.find((row) => row.id === chosen);
  return (
    <>
      <p className="mb-2 text-sm text-gray-600">
        ประวัติของผู้ป่วยนี้ทุก AN · เลือกบันทึกเพื่ออ่านรายละเอียด
      </p>
      <div className="max-h-[28vh] overflow-auto border border-gray-300">
        <table
          aria-label="บันทึกเภสัชกรในแจ้งเตือน"
          className="w-full table-fixed text-left text-sm"
        >
          <thead className="sticky top-0 bg-custom-r1">
            <tr>
              {pharmacistNoteColumns.map((label, index) => (
                <th
                  key={label}
                  style={{ width: ['15%', '30%', '35%', '20%'][index] }}
                  className="border border-gray-300 px-2 py-1"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notes.map((row) => (
              <tr
                key={row.id}
                aria-selected={chosen === row.id}
                onClick={() => setChosen(row.id)}
                className={
                  chosen === row.id
                    ? 'bg-blue-100'
                    : 'cursor-pointer hover:bg-blue-50'
                }
              >
                <td className="border border-gray-300 p-2">
                  <button
                    type="button"
                    aria-label={`อ่านบันทึกแจ้งเตือน ${row.id}`}
                    aria-pressed={chosen === row.id}
                    onClick={() => setChosen(row.id)}
                    className="text-blue-800 underline"
                  >
                    {pharmacistNoteDate(row.updatedAt) || 'อ่านบันทึก'}
                  </button>
                </td>
                <td className="border border-gray-300 p-2 align-top">
                  <div className="max-h-20 overflow-auto whitespace-pre-wrap break-words">
                    {pharmacistNoteText(row.problem)}
                  </div>
                </td>
                <td className="border border-gray-300 p-2 align-top">
                  <div className="max-h-20 overflow-auto whitespace-pre-wrap break-words">
                    {pharmacistNoteText(row.note)}
                  </div>
                </td>
                <td className="border border-gray-300 p-2 align-top">
                  {pharmacistNoteText(row.recorder)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-sm">
          ปัญหา
          <textarea
            aria-label="ปัญหาในบันทึกแจ้งเตือน"
            readOnly
            value={pharmacistNoteText(selected?.problem)}
            className="mt-1 h-28 w-full border border-gray-300 bg-gray-50 p-2"
          />
        </label>
        <label className="text-sm">
          เพิ่มเติม
          <textarea
            aria-label="รายละเอียดในบันทึกแจ้งเตือน"
            readOnly
            value={pharmacistNoteText(selected?.note)}
            className="mt-1 h-28 w-full border border-gray-300 bg-gray-50 p-2"
          />
        </label>
      </div>
    </>
  );
}
EntryNoteList.propTypes = { notes: () => null };

function EntryAlertDialog({ alert, patient, onDismiss }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialogRef}
      role={alert.id === 'notes' ? 'dialog' : 'alertdialog'}
      aria-labelledby="patient-entry-alert-title"
      aria-describedby="patient-entry-alert-context"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      className="m-auto max-h-[90vh] w-[min(900px,95vw)] overflow-y-auto rounded-lg border border-gray-400 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/50"
    >
      <header className="border-b border-amber-300 bg-amber-100 px-5 py-3">
        <h2 id="patient-entry-alert-title" className="text-lg font-bold">
          {alert.title}
        </h2>
        <p id="patient-entry-alert-context" className="mt-1 text-sm">
          {patient.patientname} · HN {patient.hn} · AN {patient.an}
        </p>
      </header>
      <div className="p-5">
        {alert.id === 'notes' ? (
          <EntryNoteList notes={alert.notes} />
        ) : (
          <>
            <div className="max-h-[55vh] overflow-auto whitespace-pre-wrap break-words text-sm leading-6">
              {alert.text}
            </div>
            {alert.id === 'operating-room' && (
              <p className="mt-4 border-t pt-3 text-sm">
                รายการใน Medication Profile {alert.medicationCount} ·
                รายการในใบยา {alert.prescriptionCount}
              </p>
            )}
          </>
        )}
      </div>
      <footer className="flex items-center justify-between gap-3 border-t bg-gray-50 px-5 py-3">
        <span className="text-xs text-gray-600">ดูข้อมูลเท่านั้น</span>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded bg-blue-700 px-6 py-2 text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-700"
        >
          ปิดแจ้งเตือน
        </button>
      </footer>
    </dialog>,
    document.body
  );
}
EntryAlertDialog.propTypes = {
  alert: () => null,
  patient: () => null,
  onDismiss: () => null,
};

export default function PatientEntryAlerts({
  patient,
  scope,
  allergies,
  onRetryAllergies,
  dismissed,
  onDismiss,
  onReopen,
}) {
  const [retry, setRetry] = useState(0);
  const base = `/ipd/patients/${encodeURIComponent(patient.an)}`;
  const notes = useIpdRead(`${base}/pharmacist-notes`, scope, retry);
  const operatingRoom = useIpdRead(
    `${base}/operating-room-alert`,
    scope,
    retry
  );
  const sources = profileEntrySources(allergies, notes, operatingRoom);
  const current = nextProfileEntryAlert(sources, dismissed);
  const count = sources.filter(
    (source) => !source.loading && !source.error && source.alert
  ).length;
  const errors = sources.filter((source) => source.error);
  return (
    <>
      {(count > 0 || errors.length > 0) && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs">
          {count > 0 && (
            <button
              type="button"
              onClick={onReopen}
              className="rounded border border-amber-400 bg-amber-50 px-2 py-1 text-amber-950"
            >
              ดูแจ้งเตือนผู้ป่วยอีกครั้ง ({count})
            </button>
          )}
          {errors.length > 0 && (
            <p role="alert" className="text-red-700">
              ตรวจแจ้งเตือนได้ไม่ครบ:{' '}
              {errors.map((source) => source.label).join(', ')}{' '}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  if (allergies.error) onRetryAllergies();
                  setRetry((value) => value + 1);
                }}
              >
                ลองโหลดแจ้งเตือนใหม่
              </button>
            </p>
          )}
        </div>
      )}
      {current && (
        <EntryAlertDialog
          key={current.id}
          alert={current}
          patient={patient}
          onDismiss={() => onDismiss(current.id)}
        />
      )}
    </>
  );
}
PatientEntryAlerts.propTypes = {
  patient: () => null,
  scope: () => null,
  allergies: () => null,
  onRetryAllergies: () => null,
  dismissed: () => null,
  onDismiss: () => null,
  onReopen: () => null,
};
