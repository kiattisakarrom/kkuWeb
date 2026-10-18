// import React, { useState } from 'react';
// import { Search, Plus, Edit, Minus, Printer, X } from 'lucide-react';

// const MainDrugInteraction = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedItem, setSelectedItem] = useState(null);

//   // ข้อมูลตัวอย่าง - คุณสามารถแทนที่ด้วย API ของคุณ
//   const medicineData = [
//     { id: 1, name: 'LAMIVUDINE 150 MG TAB 3TC [ลูปดัยจู้ (G)] E1' },
//     { id: 2, name: '5-FLUOROURACIL 1000 MG INJ(5-FU) ** E1' },
//     { id: 3, name: '5-FLUOROURACIL EYE INJ 50MG/ML ** E1' },
//     { id: 4, name: 'เหร่าใจละลด' },
//     { id: 5, name: 'สีเหลืองยอมวาตร(TARTAZINE)' },
//     { id: 6, name: 'สีส้มยอาตรSUNSET YELLOW' },
//     { id: 7, name: 'สีแดงยอมวาตร (Carmoisine)' },
//     { id: 8, name: 'น้ำกล่างรีมครีตพิ วีมสรชก' },
//     { id: 9, name: 'น้ำทันน้ำจื่น 1 LITRE' },
//     { id: 10, name: 'น้ำกลอการมขาวบรีเจทร์ (Sucrose)' },
//     { id: 11, name: 'บรีนชิ่นใน' },
//     { id: 12, name: 'ZINC SULPHATE HEPTAHYDRATE' },
//     { id: 13, name: 'ZINC OXIDE' },
//     { id: 14, name: 'XANTHAN GUM' },
//     { id: 15, name: 'VITAMIN E OIL' },
//     { id: 16, name: 'VASALINE' },
//   ];

//   const handleItemClick = (item) => {
//     setSelectedItem(item);
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* ฝั่งซ้าย - ส่วนค้นหาและตาราง */}
//       <div className="w-1/2 p-1">
//         <div className="bg-white rounded-lg shadow-md h-full">
//           {/* Header */}
//           <div className="p-4 border-b">
//             <h2 className="text-lg font-semibold text-gray-700 mb-3">
//               ข้อมูล รายการยา
//             </h2>

//             {/* Search Box */}
//             <div className="relative">
//               <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="ค้นหา..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <div className="text-sm text-gray-600 mt-2">
//               จำนวน {filteredData.length} รายการ
//             </div>
//           </div>

//           {/* Table Container */}
//           <div className="p-4">
//             <div className="max-h-[470px] overflow-y-auto border border-gray-200 rounded">
//               <table className="w-full">
//                 <thead className="bg-gray-100 sticky top-0">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b w-16">
//                       ลำดับ
//                     </th>
//                     <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
//                       ชื่อยา
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredData.map((item, index) => (
//                     <tr
//                       key={item.id}
//                       className={`cursor-pointer transition-colors ${
//                         selectedItem?.id === item.id
//                           ? 'bg-blue-100'
//                           : index % 2 === 0
//                             ? 'bg-white hover:bg-gray-50'
//                             : 'bg-gray-50 hover:bg-gray-100'
//                       }`}
//                       onClick={() => handleItemClick(item)}
//                     >
//                       <td className="px-4 py-2 text-sm text-gray-900 text-center">
//                         {index + 1}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-700">
//                         {item.name}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {filteredData.length === 0 && (
//               <div className="text-center py-8 text-gray-500">
//                 ไม่พบข้อมูลที่ค้นหา
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ฝั่งขวา - พื้นที่ว่าง */}
//       <div className="w-1/2 p-1">
//         <div className="bg-white rounded-lg shadow-md h-full">
//           {/* Header with buttons */}
//           <div className="p-4 border-b"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MainDrugInteraction;

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { API_URL } from '../../../../config';

const MainDrugInteraction = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicineData, setMedicineData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null); // 👈 เพิ่ม state สำหรับ track index
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_URL}/dose/get_ms_druginteraction?txtSearch=${searchTerm}`
        );
        const json = await res.json();

        console.log('✅ Raw JSON:', json); // <-- log ดูข้อมูลทั้งหมด

        if (json.recordset) {
          console.log('👉 Using recordset:', json.recordset);
          setMedicineData(json.recordset);
        } else if (json.recordsets) {
          console.log('👉 Using recordsets[0]:', json.recordsets[0]);
          setMedicineData(json.recordsets[0] || []);
        } else {
          console.log('⚠️ No data found, setting empty array');
          setMedicineData([]);
        }

        // รีเซ็ต selection เมื่อข้อมูลเปลี่ยน
        setSelectedItem(null);
        setSelectedIndex(null);
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  const handleItemClick = (item, index) => {
    setSelectedItem(item);
    setSelectedIndex(index); // 👈 เซ็ต index ที่เลือก
  };

  return (
    // กำหนดขนาดแสดงผล div
    <div className="flex h-[screen] w-[1268px] bg-gray-100">
      {/* ฝั่งซ้าย - ส่วนค้นหาและตาราง */}
      <div className="w-1/2 p-1">
        <div className="bg-white rounded-lg shadow-md h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              ข้อมูล รายการยา
            </h2>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="text-sm text-gray-600 mt-2">
              จำนวน {medicineData.length} รายการ
            </div>
          </div>

          {/* Table Container */}
          <div className="p-4">
            <div className="max-h-[470px] overflow-y-auto border border-gray-200 rounded">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  กำลังโหลด...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b w-16">
                        ลำดับ
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        ชื่อยา 1
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        ชื่อยา 2
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        Level
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        Onset
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        Sevenrity
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        Document
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        Memo
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        Effect Memo
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        Machanism Memo
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        ManageMeny Memo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {medicineData.map((item, index) => (
                      <tr
                        key={index}
                        className={`cursor-pointer transition-colors ${
                          selectedIndex === index
                            ? 'bg-blue-100' // 👈 เลือกแล้ว = สีน้ำเงิน
                            : index % 2 === 0
                              ? 'bg-white hover:bg-gray-50' // 👈 แถวคู่ = สีขาว
                              : 'bg-gray-50 hover:bg-gray-100' // 👈 แถวคี่ = สีเทาอ่อน
                        }`}
                        onClick={() => handleItemClick(item, index)} // 👈 ส่ง index ไปด้วย
                      >
                        <td className="px-4 py-2 text-sm text-gray-900 text-center">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.name || item.drugnameindex1}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.name || item.drugnameindex2}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.name || item.dlevel}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.name || item.onset}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[200px]">
                          {item.name || item.severity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[200px]">
                          {item.name || item.document}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[200px]">
                          {item.name || item.memo}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[200px]">
                          {item.name || item.effect_memo}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[200px]">
                          {item.name || item.machanism_memo}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[200px]">
                          {item.name || item.drugnameindex2}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && medicineData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                ไม่พบข้อมูลที่ค้นหา
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ฝั่งขวา - พื้นที่ว่าง */}
      <div className="w-1/2 p-1">
        <div className="bg-white rounded-lg shadow-md h-full">
          {/* Header with buttons */}
          <div className="p-4 border-b">
            {selectedItem ? (
              <div className="text-gray-700">
                <h3 className="font-semibold">รายละเอียด</h3>
                <p>
                  ชื่อยา: {selectedItem.name || selectedItem.orderitemENname}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ลำดับที่เลือก: {selectedIndex + 1}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">กรุณาเลือกยาจากตาราง</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDrugInteraction;
