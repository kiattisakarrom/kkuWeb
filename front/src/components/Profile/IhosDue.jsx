import React from 'react';

export default function IhosDue() {
  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="sticky top-0]">
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                dateTime
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                สถานะ
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                ชื่อยา
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                confirm_inp_id
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                confirm
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                comfirm_date
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                comfirm_note
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                request_note
              </th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  );
}
