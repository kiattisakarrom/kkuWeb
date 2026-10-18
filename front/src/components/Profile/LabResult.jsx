import React from 'react';
import { useLocation } from 'react-router-dom';

export default function LabResult() {
  const location = useLocation();
  const labResult = location.state?.labResult || []; // ดึงข้อมูล labResult จาก state

  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="sticky top-0 bg-white w-full rounded shadow">
              <th className="p-2 border border-gray-200 text-center">
                date_result
              </th>
              <th className="p-2 border border-gray-200 text-center">
                lab_name
              </th>
              <th className="p-2 border border-gray-200 text-center">result</th>
              <th className="p-2 border border-gray-200 text-center">
                type_result
              </th>
              <th className="p-2 border border-gray-200 text-center">unit</th>
              <th className="p-2 border border-gray-200 text-center">
                minresult
              </th>
              <th className="p-2 border border-gray-200 text-center">
                maxresult
              </th>
              <th className="p-2 border border-gray-200 text-center">remark</th>
            </tr>
          </thead>
          <tbody>
            {labResult.map((item, index) => (
              <tr key={index}>
                {/* <td className="p-2 border border-gray-200 text-center">
                  {item.date_result}
                </td> */}
                <td className="border border-gray-300 p-1">
                  {new Date(item.date_result).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </td>
                <td className="p-2 border border-gray-200 text-center">
                  {item.lab_name}
                </td>
                <td className="p-2 border border-gray-200 text-center">
                  {item.result}
                </td>
                <td className="p-2 border border-gray-200 text-center">
                  {item.type_result}
                </td>
                <td className="p-2 border border-gray-200 text-center">
                  {item.unit}
                </td>
                <td className="p-2 border border-gray-200 text-center">
                  {item.minresult}
                </td>
                <td className="p-2 border border-gray-200 text-center">
                  {item.maxresult}
                </td>
                <td className="p-2 border border-gray-200 text-center">
                  {item.remark}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
