import React from 'react';

export default function DRP() {
  return (
    <div className="w-full h-full">
      <div className="h-full  overflow-auto  bg-white w-full">
        <table>
          <thead className=" sticky top-0 border-t border border-collapse border-gray-400 bg-white">
            <tr>
              <th className="border border-collapse border-gray-400 p-2 min-w-[40px]">
                <input type="checkBox" />
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[60px]"></th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[120px]">
                Date
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[120px]">
                time
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                Process
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                No.
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                รหัส
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                DRP
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                รหัสยา
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                DrugCause
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                รหัสยา
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                DrugDispense
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                รหัส
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                เกิด
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                Severity
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                รหัส
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[150px]">
                Preventable
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                รหัส
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                Cause
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                รหัส
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                ActionTalk
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                รหัส
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                Outcome
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                UserID1
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                ผู้เกี่ยวข้อง
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[100px]">
                UserID2
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                ผู้รายงาน
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                Pharmacist
              </th>
              <th className="border border-collapse border-gray-400 p-2  min-w-[200px]">
                Plan
              </th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  );
}
