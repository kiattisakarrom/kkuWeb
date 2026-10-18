// import React from 'react';

// export default function NoteDrp() {
//   return (
//     <div className="w-full h-full">
//       <div className="w-full h-full overflow-auto">
//         <table className="w-full bg-white rounded shadow">
//           <thead>
//             <tr className="sticky top-0]">
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
//                 Date
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[ 50px]">
//                 Time
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/4">
//                 Process
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/12">
//                 No
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 รหัส
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
//                 DRP
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
//                 รหัสยา
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
//                 DrugCause
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
//                 รหัสยา
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
//                 DrugDispense
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 รหัส
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
//                 เกิด
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/6">
//                 Serverity
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 รหัส
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 Preventable
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 รหัส
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
//                 Cause
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 รหัส
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
//                 ActionTake
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 รหัส
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
//                 AccepTance
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 รหัส
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
//                 Outcome
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 UserD1
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
//                 ผู้เกี่ยวข้อง
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
//                 UserD2
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
//                 ผู้รายงาน
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
//                 pharmacist Note
//               </th>
//               <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
//                 Plan
//               </th>
//             </tr>
//           </thead>
//           <tbody></tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React from 'react';
import { useLocation } from 'react-router-dom';

export default function NoteDrp() {
  const location = useLocation();
  const noteDrpData = location.state?.noteDrpData || [];
  console.log('Note Drp Data in MainIPD:', noteDrpData);
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="sticky top-0">
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[10px]">
                Date
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[50px]">
                Time
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/4">
                Process
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/12">
                No
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                รหัส
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[10px]">
                DRP
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                รหัสยา
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                DrugCause
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                รหัสยา
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                DrugDispense
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                รหัส
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                เกิด
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/6">
                Severity
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                รหัส
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                Preventable
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                รหัส
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                Cause
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                รหัส
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                ActionTake
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                รหัส
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                Acceptance
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                รหัส
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                Outcome
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                UserD1
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                ผู้เกี่ยวข้อง
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 w-1/8">
                UserD2
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                ผู้รายงาน
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                pharmacist Note
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                Plan
              </th>
            </tr>
          </thead>
          <tbody>
            {noteDrpData.map((item, index) => (
              <tr key={index}>
                {/* <td className="p-2 text-center border border-gray-200">
                  {item.Ordercreatedate}
                </td> */}
                <td className="border border-gray-300 p-1">
                  {new Date(item.Ordercreatedate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.Time}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.ProcessCd}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.No}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.DRPItemNo}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.DRP_ProblemCd}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.OrderItemCaseCode}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.OrderItemDispenCode}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.ProblemOccurCd}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.Severity}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.Preventable}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.CauseOfDRPCd}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.InterventionCd}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.InterAcceptCd}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.StatusOfproblemCd}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.ReporterCd}
                </td>
                <td className="p-2 text-center border border-gray-200">
                  {item.UserCreateCode}
                </td>
                <td className="p-2 text-center border border-gray-200 whitespace-pre-line">
                  {item.PharmacistNote}
                </td>
                <td className="p-2 text-center border border-gray-200 whitespace-pre-line">
                  {item.PlanNote}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
