import React from 'react';

export default function ManageMedicineBarcode() {
  return (
    <div className="w-full h-full p-4 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        ข้อมูลกระบอกยา :
      </h1>

      {/* ส่วนค้นหาหรือกรอกข้อมูล */}
      <div className="mb-4 flex items-center space-x-2">
        <label htmlFor="search" className="text-gray-700 font-medium">
          ค้นหายา:
        </label>
        <input
          id="search"
          type="text"
          placeholder="พิมพ์ชื่อยา..."
          className="border border-gray-400 rounded px-2 py-1 w-64"
        />
        <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
          ค้นหา
        </button>
      </div>

      {/* ตารางตัวอย่างแสดงข้อมูล */}
      <table className="w-full border border-collapse border-gray-400">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-400 px-3 py-2">
              <input type="checkbox" />
            </th>
            <th className="border border-gray-400 px-3 py-2">รหัสกระบอก</th>
            <th className="border border-gray-400 px-3 py-2">รหัสยา</th>
            <th className="border border-gray-400 px-3 py-2">ชื่อยา</th>
            <th className="border border-gray-400 px-3 py-2">BarcodeText</th>
            <th className="border border-gray-400 px-3 py-2">Barcode</th>
            <th className="border border-gray-400 px-3 py-2">row</th>
          </tr>
        </thead>
        <tbody>
          {/* ตัวอย่างข้อมูล */}
          <tr>
            <td className="border border-gray-300 px-3 py-2 text-center w-[10px]">
              <input type="checkbox" />
            </td>
            <td className="border border-gray-300 px-3 py-2 text-center w-[150px]">
              123
            </td>
            <td className="border border-gray-300 px-3 py-2 text-center w-[150px]">
              Ht13d
            </td>
            <td className="border border-gray-300 px-3 py-2">Paracetamol</td>
            <td className="border border-gray-300 px-3 py-2 w-[240px]">
              1234567890123
            </td>
            <td className="border border-gray-300 px-3 py-2 w-[240px]">
              123462345
            </td>
            <td className="border border-gray-300 px-3 py-2 text-center  w-[110px]">
              23
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
