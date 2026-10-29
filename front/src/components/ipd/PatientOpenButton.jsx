// A native button supports touch and keyboard without relying on dblclick.
// Stop row handlers so opening a profile never also selects a prescription.
export default function PatientOpenButton({
  patient,
  onOpen,
  children,
  className = '',
}) {
  return (
    <button
      type="button"
      aria-label={`ดูรายละเอียดผู้ป่วย ${patient.patientname || patient.an}`}
      title="แตะหรือคลิกเพื่อดูรายละเอียดผู้ป่วย"
      onClick={(event) => {
        event.stopPropagation();
        onOpen(patient);
      }}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      className={`block w-full touch-manipulation text-left text-blue-800 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${className}`}
    >
      {children || patient.patientname || patient.an}
    </button>
  );
}
PatientOpenButton.propTypes = {
  patient: () => null,
  onOpen: () => null,
  children: () => null,
  className: () => null,
};
