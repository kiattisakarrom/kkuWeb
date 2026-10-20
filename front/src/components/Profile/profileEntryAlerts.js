import { allergySummaryText } from './allergyFormat.js';

// Match only the active profile-entry paths: showadr, frmNote.Getdata and
// CheckOrderOR. Drug/LAB/duplicate-drug checks are commented out at that entry
// point in Windows and must not become newly invented clinical alerts here.
export function profileEntrySources(allergies, notes, operatingRoom) {
  const adr = allergies.data?.allergies || [];
  const savedNotes = notes.data?.notes || [];
  const counts = operatingRoom.data?.['operating-room-alert']?.[0];
  const medCount = Number(counts?.medicationCount);
  const rxCount = Number(counts?.prescriptionCount);
  const orWarning =
    Number.isSafeInteger(medCount) &&
    Number.isSafeInteger(rxCount) &&
    medCount >= 0 &&
    rxCount >= 0 &&
    medCount !== rxCount;
  return [
    {
      id: 'allergy',
      label: 'ประวัติ ADR / แพ้ยา',
      ...allergies,
      alert: adr.length
        ? {
            id: 'allergy',
            title: 'แจ้งเตือนประวัติ ADR / แพ้ยา',
            text: allergySummaryText(adr),
          }
        : null,
    },
    {
      id: 'notes',
      label: 'บันทึกเภสัชกร',
      ...notes,
      alert: savedNotes.length
        ? { id: 'notes', title: 'บันทึกเภสัชกรย้อนหลัง', notes: savedNotes }
        : null,
    },
    {
      id: 'operating-room',
      label: 'รายการยาห้องผ่าตัด',
      ...operatingRoom,
      alert: orWarning
        ? {
            id: 'operating-room',
            title: 'แจ้งเตือนรายการยาห้องผ่าตัด',
            text: 'มีรายการใช้ยาในห้องผ่าตัด\nให้ Screen เลือกรายการยา\nสร้างใบสั่งยาเพื่อคิดค่ายา',
            medicationCount: medCount,
            prescriptionCount: rxCount,
          }
        : null,
    },
  ];
}

export function nextProfileEntryAlert(sources, dismissed) {
  for (const source of sources) {
    if (dismissed.includes(source.id)) continue;
    // Preserve allergy -> Note -> OR order even if later requests arrive first.
    if (source.loading) return null;
    if (!source.error && source.alert) return source.alert;
  }
  return null;
}

export function dismissEntryAlert(previous, context, id) {
  const ids = previous.context === context ? previous.ids : [];
  return { context, ids: ids.includes(id) ? ids : [...ids, id] };
}
