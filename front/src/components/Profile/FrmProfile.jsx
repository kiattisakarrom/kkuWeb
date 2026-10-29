import { useEffect, useState } from 'react';
import { useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import { useIpdRead } from '../../services/useIpdRead';
import ProfileReadTable from './ProfileReadTable';
import { sidebarLabColumns } from './patientSidebarFormat';
import { drpColumns } from './pharmcareFields';
import { pharmcareText } from './pharmcareFormat';
import MedicationProfileTable from './MedicationProfileTable';
import PrescriptionHistory from './PrescriptionHistory';
import MedicalReconcile from './MedicalReconcile';
import DrugProfile from './DrugProfile';
import PharmcareHistory from './PharmcareHistory';
import PharmacistNotes from './PharmacistNotes';
import IhosDue from './IhosDue';
import LabHistory from './LabHistory';
import AllergyHistory from './AllergyHistory';
import PatientEntryAlerts from './PatientEntryAlerts';
import { dismissEntryAlert } from './profileEntryAlerts';
import { allergySummaryText } from './allergyFormat';
import { screeningReturnPath } from '../screening/screeningNavigation';
import { quickOrderReturnPath } from '../quickorder/quickOrderNavigation';
import { dateText, display, patientAge } from './profileFormat';
import profileIcon from '../../../img/idCard.png';
import noteBookIcon from '../../../img/notebook.png';
import editIcon from '../../../img/icon4.png';
import drugFile from '../../../img/profileIcon.png';
import labImg from '../../../img/lab.png';
import drugIcon from '../../../img/drug.png';
import noteIcon from '../../../img/note.png';
import backIcon from '../../../img/back.png';
import IPDRoom from '../../../img/IPDRoom.png';
import IVRoom from '../../../img/IVRoom.png';
import chemoRoom from '../../../img/chemoRoom.png';
import TPNRoom from '../../../img/TPNRoom.png';

export default function FrmProfile() {
  const match = useMatch('/ipd/patients/:an');
  const an = match?.params.an || '';
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const mainView = [
    'prescriptions',
    'reconcile',
    'drug-profile',
    'pharmcare',
    'pharmacist-notes',
    'lab-history',
    'allergy-history',
  ].includes(query.get('view'))
    ? query.get('view')
    : 'medications';
  const wardCode = query.get('wardCode') || '';
  const orderdate = query.get('orderdate') || '';
  const [workdateChoice, setWorkdate] = useState(null);
  const [category, setCategory] = useState('IPD');
  const [includeOff, setIncludeOff] = useState(false);
  const [sideTab, setSideTab] = useState('labs');
  const [refresh, setRefresh] = useState(0);
  const [dueRefresh, setDueRefresh] = useState(0);
  const [allergyRefresh, setAllergyRefresh] = useState(0);
  const [medicationSelection, setMedicationSelection] = useState(null);
  const [entryAlertRead, setEntryAlertRead] = useState({
    context: '',
    ids: [],
  });
  const entryAlertContext = `${an}|${wardCode}`;
  const base = `/ipd/patients/${encodeURIComponent(an)}`;
  const scope = { wardCode, orderdate };
  const summary = useIpdRead(base, scope, refresh);
  const workdate = workdateChoice ?? summary.data?.medicationDate ?? orderdate;
  const allergies = useIpdRead(
    `${base}/allergies`,
    scope,
    refresh + allergyRefresh,
    Boolean(summary.data)
  );
  const labs = useIpdRead(
    `${base}/labs`,
    scope,
    refresh,
    Boolean(summary.data) && sideTab === 'labs'
  );
  const notes = useIpdRead(
    `${base}/notes`,
    scope,
    refresh,
    Boolean(summary.data) && sideTab === 'notes'
  );
  const due = useIpdRead(
    `${base}/ihos-due`,
    scope,
    refresh + dueRefresh,
    Boolean(summary.data) && (sideTab === 'due' || mainView === 'medications')
  );
  const medications = useIpdRead(
    `${base}/medications`,
    { ...scope, workdate, category, includeOff },
    refresh,
    Boolean(summary.data) && Boolean(workdate) && mainView === 'medications'
  );
  const patient = summary.data?.patient;
  const selectedMedication =
    medicationSelection?.data === medications.data
      ? medications.data?.medications.find(
          (row) => row.meditemindex === medicationSelection.id
        )
      : null;
  const returnQuery = new URLSearchParams(query);
  [
    'view',
    'rxDate',
    'rx',
    'mrFilter',
    'mrSource',
    'mrId',
    'mrDate',
    'dpFrom',
    'dpTo',
    'dpWeek',
    'pcEvent',
    'pcTab',
    'pcItem',
    'pnId',
    'labFrom',
    'labTo',
    'labDate',
    'adrId',
    'fromScreening',
    'screenDate',
    'screenSearch',
    'screenWard',
    'screenRx',
    'screenRound',
    'screenRoom',
    'screenStatus',
    'screenOrderType',
    'fromQuickOrder',
    'quickReturn',
  ].forEach((key) => returnQuery.delete(key));
  const returnPath =
    quickOrderReturnPath(query) ||
    screeningReturnPath(query) ||
    `/ipd?${returnQuery}`;
  const back = () => navigate(returnPath);
  useEffect(() => {
    const onKey = (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        navigate(returnPath);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, returnPath]);
  const renderReadState = (resource) =>
    resource.loading ? (
      <p role="status" className="p-4 text-gray-500">
        กำลังโหลดข้อมูล…
      </p>
    ) : resource.error ? (
      <div role="alert" className="p-4 text-red-700">
        <p>{resource.error}</p>
        <button
          onClick={() => setRefresh((value) => value + 1)}
          className="mt-2 underline"
        >
          ลองใหม่
        </button>
      </div>
    ) : null;
  const field = (label, value, title) => (
    <label key={label} className="flex min-w-0 items-center gap-1">
      <span className="shrink-0 text-gray-700">{label}:</span>
      <input
        readOnly
        value={display(value)}
        title={title || display(value)}
        className="min-w-0 flex-1 border border-gray-300 bg-white px-1 py-0.5 text-gray-900"
      />
    </label>
  );
  const allergyText = allergySummaryText(allergies.data?.allergies || []);
  const clinicalField = (label, key) => {
    const source = patient?.clinicalSources?.[key];
    const description =
      source?.source === 'lab'
        ? 'ผล LAB ล่าสุด'
        : source?.source === 'calculated'
          ? 'คำนวณเพื่อแสดงผลตามโปรแกรมเดิม ไม่บันทึกกลับ'
          : 'ค่าที่บันทึกในระบบ';
    const value =
      ['bsa', 'Crcl'].includes(key) && typeof patient?.[key] === 'number'
        ? patient[key].toFixed(2)
        : patient?.[key];
    return field(
      label,
      value,
      `${description} · ${dateText(source?.date, true)}`
    );
  };

  if (summary.loading || summary.error)
    return (
      <section className="flex min-h-0 flex-1 flex-col">
        <button
          onClick={back}
          className="mb-2 w-fit rounded border bg-white px-4 py-2"
        >
          กลับหน้ารายการผู้ป่วย
        </button>
        {renderReadState(summary)}
      </section>
    );
  return (
    <section
      aria-label="รายละเอียดผู้ป่วย"
      className="flex min-h-0 min-w-[960px] flex-1 flex-col gap-1"
    >
      <PatientEntryAlerts
        key={entryAlertContext}
        patient={patient}
        scope={scope}
        allergies={allergies}
        onRetryAllergies={() => setAllergyRefresh((value) => value + 1)}
        dismissed={
          entryAlertRead.context === entryAlertContext ? entryAlertRead.ids : []
        }
        onDismiss={(id) =>
          setEntryAlertRead((previous) =>
            dismissEntryAlert(previous, entryAlertContext, id)
          )
        }
        onReopen={() =>
          setEntryAlertRead({ context: entryAlertContext, ids: [] })
        }
      />
      <div
        className="grid min-h-[330px] shrink-0 grid-cols-[12%_57%_31%] border border-gray-300"
        style={{ height: '46%' }}
      >
        <aside className="flex flex-col items-center gap-2 p-2">
          <h1 className="w-full rounded-sm bg-gray-500 p-2 text-center text-white">
            รายละเอียดผู้ป่วย
          </h1>
          <div
            aria-hidden="true"
            className="flex h-16 w-14 items-center justify-center bg-gray-300 text-3xl text-gray-600"
          >
            ♙
          </div>
          <div className="w-full">
            <p>วันที่ Admit</p>
            <p className="border border-gray-400 bg-white p-1">
              {dateText(patient.admitteddate)}
            </p>
          </div>
          <p className="w-full">
            ใบสั่งยา ({dateText(orderdate)}):{' '}
            <strong>{patient.prescriptionCount}</strong>
          </p>
          <p className="w-full">
            ทั้งหมดใน AN: {patient.totalPrescriptionCount}
          </p>
          <button
            type="button"
            disabled
            title="ดูข้อมูลเท่านั้น"
            className="mt-auto w-full border border-gray-400 bg-yellow-200 p-2 text-gray-500"
          >
            จ่ายแบบ ROBOT
          </button>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-col gap-1 p-1">
          <div className="flex shrink-0 gap-px overflow-x-auto">
            {[
              [profileIcon, 'Medication Profile', null],
              [noteBookIcon, 'รายการสั่งยา', 'prescriptions'],
              [editIcon, 'Medical Reconcile', 'reconcile'],
              [drugFile, 'Drug Profile', 'drug-profile'],
              [labImg, 'LAB', 'lab-history'],
              [drugIcon, 'ME/DRP', 'pharmcare'],
              [noteIcon, 'Note', 'pharmacist-notes'],
            ].map(([icon, label, target]) => (
              <button
                key={label}
                type="button"
                disabled={target === 'disabled'}
                title={
                  target === 'disabled' ? 'ยังไม่เชื่อมหน้าดูข้อมูลนี้' : label
                }
                onClick={() => {
                  if (
                    target === null ||
                    [
                      'prescriptions',
                      'reconcile',
                      'drug-profile',
                      'pharmcare',
                      'pharmacist-notes',
                      'lab-history',
                    ].includes(target)
                  ) {
                    const next = new URLSearchParams(query);
                    if (target) next.set('view', target);
                    else next.delete('view');
                    setQuery(next, { replace: true });
                  } else setSideTab(target);
                }}
                className={`flex min-w-[72px] flex-1 items-center justify-center gap-1 border bg-white px-1 py-1 text-[10px] disabled:cursor-not-allowed disabled:text-gray-400 ${(target === null && mainView === 'medications') || target === mainView ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}
              >
                <img src={icon} alt="" className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
            <button
              onClick={back}
              title="Ctrl+E"
              className="flex shrink-0 items-center gap-1 border border-gray-400 bg-white px-2"
            >
              <img src={backIcon} alt="" className="h-5 w-5" />
              กลับ
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-auto">
            <div className="grid grid-cols-3 gap-1">
              {field('HN', patient.hn)}
              {field('AN', patient.an)}
              {field('แพทย์', patient.doctorname)}
              {field('ชื่อ', patient.patientname)}
              {field('วันเกิด', dateText(patient.patientdob))}
              {field('อายุ', patientAge(patient.patientdob))}
              {field('บัตร ปชช.', patient.id_card)}
              {field(
                'เพศ',
                String(patient.sex).trim() === '1'
                  ? 'ชาย'
                  : String(patient.sex).trim() === '2'
                    ? 'หญิง'
                    : patient.sex
              )}
              {field('สิทธิ์ผู้ป่วย', patient.rightname)}
              {field('รหัสสิทธิ์', patient.rightid)}
              {field('รหัสแพทย์', patient.doctorcode)}
              {field('วันจำหน่าย', dateText(patient.dischargeddate))}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {field('หอผู้ป่วย', `[${patient.wardcode}] ${patient.warddesc}`)}
              {field('ห้อง', patient.room)}
              {field('เตียง', patient.bed)}
            </div>
            {field(
              'ที่อยู่',
              [
                patient.address && `บ้านเลขที่ ${patient.address}`,
                patient.moo && `หมู่ ${patient.moo}`,
                patient.tambol && `ต.${patient.tambol}`,
                patient.amp && `อ.${patient.amp}`,
                patient.provname && `จ.${patient.provname}`,
              ]
                .filter(Boolean)
                .join(' ')
            )}
            <div className="grid grid-cols-4 gap-1">
              {[
                ['น้ำหนัก kg', 'weight'],
                ['ส่วนสูง cm', 'height'],
                ['BSA', 'bsa'],
                ['eGFR', 'eGFR'],
                ['Scr', 'scr'],
                ['CrCl', 'Crcl'],
                ['WBC', 'wbc'],
                ['Neutrophil %', 'Neutrophil'],
                ['Band form %', 'BandformNeutrophil'],
                ['ANC', 'ANC'],
              ].map(([label, key]) => clinicalField(label, key))}
              {field(
                'วินิจฉัย / ICD10',
                [patient.icd10, patient.dx1, patient.dx2, patient.dx3]
                  .filter(Boolean)
                  .join(' / ')
              )}
            </div>
            {field(
              'Protocol (รายการยาที่เลือก)',
              selectedMedication
                ? [
                    selectedMedication.protocolcode,
                    selectedMedication.protocolname,
                  ]
                    .filter(
                      (value) =>
                        value !== null && value !== undefined && value !== ''
                    )
                    .join(' · ')
                : '',
              'กดชื่อยาใน Medication Profile เพื่อดู Protocol ที่บันทึกกับรายการนั้น'
            )}
            <p className="text-[10px] text-gray-500">
              ข้อมูลบันทึก {dateText(patient.clinicalUpdatedAt, true)} · เลือกผล
              LAB ล่าสุดตามโปรแกรมเดิม · BSA / CrCl / ANC
              คำนวณเพื่อแสดงผลเท่านั้น
            </p>
            <div className="border border-gray-300 bg-yellow-50 p-1">
              <div className="flex items-center justify-between gap-1">
                <p className="font-bold">ประวัติแพ้ยา</p>
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(query);
                    next.set('view', 'allergy-history');
                    setQuery(next, { replace: true });
                  }}
                  className="px-1 text-blue-800 underline"
                >
                  ดูประวัติแพ้ยาทั้งหมด
                  {allergies.data
                    ? ` (${allergies.data.allergies.length})`
                    : ''}
                </button>
              </div>
              {allergies.loading || allergies.error ? (
                renderReadState(allergies)
              ) : (
                <textarea
                  aria-label="ประวัติแพ้ยา"
                  readOnly
                  value={allergyText}
                  className="h-12 w-full bg-yellow-50 text-red-800"
                />
              )}
            </div>
          </div>
        </div>
        <aside className="flex min-h-0 min-w-0 flex-col border-l border-gray-300 bg-white">
          <div
            role="tablist"
            aria-label="ข้อมูลประกอบผู้ป่วย"
            className="flex border-b border-gray-300 bg-gray-100"
          >
            {[
              ['labs', 'LAB Result'],
              ['notes', 'Note Drp'],
              ['due', 'IHOS DUE'],
            ].map(([value, title]) => (
              <button
                key={value}
                role="tab"
                aria-selected={sideTab === value}
                aria-controls="patient-side-panel"
                id={`patient-tab-${value}`}
                onClick={() => setSideTab(value)}
                className={`flex-1 border-r border-gray-300 px-1 py-2 ${sideTab === value ? 'bg-white font-bold text-blue-800' : ''}`}
              >
                {title}
                {value === 'labs' && labs.data
                  ? ` (${labs.data.labs.length})`
                  : value === 'notes' && notes.data
                    ? ` (${notes.data.notes.length})`
                    : value === 'due' && due.data
                      ? ` (${due.data.items.length})`
                      : ''}
              </button>
            ))}
          </div>
          <div
            id="patient-side-panel"
            role="tabpanel"
            aria-labelledby={`patient-tab-${sideTab}`}
            className="flex min-h-0 flex-1 flex-col"
          >
            {sideTab === 'labs' ? (
              labs.loading || labs.error ? (
                renderReadState(labs)
              ) : (
                <>
                  <p className="border-b bg-blue-50 p-1 text-gray-600">
                    ผลย้อนหลัง 7 วันตามหน้าหลักเดิม · ประวัติ HN
                  </p>
                  <div className="min-h-0 flex-1">
                    <ProfileReadTable
                      label="ผล LAB ผู้ป่วย"
                      columns={sidebarLabColumns}
                      rows={labs.data?.labs || []}
                    />
                  </div>
                </>
              )
            ) : sideTab === 'notes' ? (
              notes.loading || notes.error ? (
                renderReadState(notes)
              ) : (
                <>
                  <p className="border-b bg-blue-50 p-1 text-gray-600">
                    ประวัติ Note DRP ทุก AN ของ HN นี้ ·
                    แสดงชื่อจากตารางรหัสและข้อมูลที่บันทึก
                  </p>
                  <div className="min-h-0 flex-1">
                    <ProfileReadTable
                      label="Note DRP ผู้ป่วย"
                      columns={drpColumns}
                      rows={notes.data?.notes || []}
                      text={pharmcareText}
                    />
                  </div>
                </>
              )
            ) : (
              <IhosDue
                resource={due}
                onRetry={() => setDueRefresh((value) => value + 1)}
              />
            )}
          </div>
        </aside>
      </div>
      {mainView === 'prescriptions' ? (
        <PrescriptionHistory />
      ) : mainView === 'reconcile' ? (
        <MedicalReconcile />
      ) : mainView === 'drug-profile' ? (
        <DrugProfile />
      ) : mainView === 'pharmcare' ? (
        <PharmcareHistory />
      ) : mainView === 'pharmacist-notes' ? (
        <PharmacistNotes />
      ) : mainView === 'lab-history' ? (
        <LabHistory />
      ) : mainView === 'allergy-history' ? (
        <AllergyHistory
          resource={allergies}
          onRetry={() => setAllergyRefresh((value) => value + 1)}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 py-1">
            {[
              [IPDRoom, 'IPD'],
              [IVRoom, 'IV'],
              [chemoRoom, 'Chemo'],
              [TPNRoom, 'TPN'],
            ].map(([icon, value]) => (
              <button
                key={value}
                disabled={includeOff}
                onClick={() => setCategory(value)}
                className={`flex items-center gap-1 rounded-sm border border-gray-400 px-2 py-1 disabled:opacity-50 ${category === value ? 'bg-green-200' : 'bg-white'}`}
              >
                <img src={icon} alt="" className="h-5 w-5" />
                ห้องยา {value}
              </button>
            ))}
            <label className="flex items-center gap-1">
              วันที่เริ่มรอบยา
              <input
                aria-label="วันที่เริ่มรอบยา"
                type="date"
                min="1753-01-02"
                max="9999-12-30"
                value={workdate}
                disabled={includeOff}
                onChange={(event) => setWorkdate(event.target.value)}
                className="border border-gray-300 bg-white px-1 py-1"
              />
            </label>
            <button
              onClick={() => setRefresh((value) => value + 1)}
              className="rounded border border-gray-400 bg-white px-2 py-1"
            >
              โหลดรายละเอียดใหม่
            </button>
            <span className="text-gray-600">
              {includeOff
                ? 'แสดงทุกวันและทุกห้องยาใน AN ตามโหมด Off เดิม'
                : 'รอบยา 08:00–07:59 วันถัดไป'}
            </span>
          </div>
          <div
            className="min-h-0 flex-1 border border-gray-300 bg-white"
            aria-busy={medications.loading}
          >
            {!workdate ? (
              <p role="alert" className="p-4 text-red-700">
                กรุณาเลือกวันที่เริ่มรอบยา
              </p>
            ) : medications.loading || medications.error ? (
              renderReadState(medications)
            ) : (
              <MedicationProfileTable
                rows={medications.data?.medications || []}
                workdate={workdate}
                due={due}
                selected={selectedMedication?.meditemindex}
                onSelect={(row) =>
                  setMedicationSelection({
                    data: medications.data,
                    id: row.meditemindex,
                  })
                }
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-700">
            <span className="bg-[#afeeee] px-1">ตั้งค่าพิมพ์ / เครื่อง</span>
            <span className="bg-[#ffff80] px-1">เริ่มยาในรอบ</span>
            <span className="bg-[#b7ffbc] px-1">
              มีใบยาในรอบ (จัดแล้วตามโปรแกรมเดิม)
            </span>
            <span className="bg-[#d3d3d3] px-1">Off / Hold</span>
            {due.error && (
              <button
                type="button"
                onClick={() => setDueRefresh((value) => value + 1)}
                className="text-red-700 underline"
              >
                โหลด DUE Online ไม่ได้ · ลองใหม่
              </button>
            )}
          </div>
          <div className="flex shrink-0 items-center justify-between bg-black px-3 py-1.5 text-white">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeOff}
                onChange={(event) => setIncludeOff(event.target.checked)}
              />
              แสดงรายการ Off / ทั้งหมด
            </label>
            <p role="status">
              {medications.loading
                ? 'กำลังโหลดรายการยา…'
                : `จำนวนรายการยา ${medications.data?.medications.length ?? '—'} รายการ`}
            </p>
            <span className="text-yellow-300">ดูข้อมูลเท่านั้น</span>
          </div>
        </>
      )}
      <div className="flex shrink-0 gap-1">
        {[
          'เพิ่ม [F5]',
          'แก้ไข [F7]',
          'ลบ',
          'Off',
          'Hold',
          'บันทึก [Ctrl+S]',
          'สร้างรายการยากลับบ้าน',
          'สร้างรายการยา',
        ].map((label) => (
          <button
            key={label}
            type="button"
            disabled
            title="ดูข้อมูลเท่านั้น"
            className="border border-gray-400 bg-white px-3 py-1.5 text-gray-400 disabled:cursor-not-allowed"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
