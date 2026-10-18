// import React, { useState, useEffect } from 'react';

// const MainTime = () => {
//   // mock ข้อมูล 3 แถว ตัวอย่าง
//   const medicines = [
//     { id: 1, name: 'LAMIVUDINE 150 MG TAB' },
//     { id: 2, name: '5-FLUOROURACIL 1000 MG INJ' },
//     { id: 3, name: 'น้ำเกลือปรุงอาหาร (TARTAZINE)' },
//   ];

//   return (
//     <div className="flex h-screen p-4">
//       {/* ฝั่งซ้าย */}
//       <div className="w-1/2 border rounded-lg shadow bg-white p-4 overflow-auto">
//         <div className="flex items-center justify-between mb-2">
//           <h2 className="text-lg font-semibold">ข้อมูล รายการยา</h2>
//           <span className="text-sm text-gray-500">
//             จำนวน {medicines.length} รายการ
//           </span>
//         </div>

//         {/* ตาราง */}
//         <table className="w-full border border-gray-300 text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-2 py-1 w-16 text-center">ลำดับ</th>
//               <th className="border px-2 py-1 text-left">ชื่อยา</th>
//             </tr>
//           </thead>
//           <tbody>
//             {medicines.map((item, index) => (
//               <tr key={item.id} className="hover:bg-blue-100 cursor-pointer">
//                 <td className="border px-2 py-1 text-center">{index + 1}</td>
//                 <td className="border px-2 py-1">{item.name}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* ฝั่งขวา */}
//       <div className="w-1/2 border rounded-lg shadow bg-gray-50 ml-4 p-4">
//         {/* เว้นว่างไว้ก่อน */}
//       </div>
//     </div>
//   );
// };

// export default MainTime;

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { API_URL } from '../../../../config';

const MainTime = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState('');
  const [mapStatus, setMapStatus] = useState(''); // ✅ เพิ่ม state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_URL}/dose/get_ms_time_code?txtSearch=${search}&checkboxStatus=${mapStatus}`
        );
        const json = await res.json();

        if (json.recordset) {
          setData(json.recordset);
        } else if (json.recordsets) {
          setData(json.recordsets[0] || []);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(err);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, mapStatus]);

  // ✅ ใช้ field จริงจาก DB (เช่น timeTH)
  const filteredData = data.filter((item) =>
    item.timeTH?.toLowerCase().includes(search.toLowerCase())
  );

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/2 p-1">
        <div className="bg-white rounded-lg shadow-md h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              ข้อมูลเวลา
            </h2>

            {/* ✅ Radio + Search บรรทัดเดียว */}
            <div className="flex items-center gap-4 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md 
                             focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="mapStatus"
                  value=""
                  checked={mapStatus === ''}
                  onChange={(e) => setMapStatus(e.target.value)}
                />
                ทั้งหมด
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="mapStatus"
                  value="1"
                  checked={mapStatus === '1'}
                  onChange={(e) => setMapStatus(e.target.value)}
                />
                Map มือแล้ว
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="mapStatus"
                  value="0"
                  checked={mapStatus === '0'}
                  onChange={(e) => setMapStatus(e.target.value)}
                />
                ยังไม่ได้ Map มือ
              </label>

              {/* search box */}
            </div>

            <div className="text-sm text-gray-600">
              จำนวน {filteredData.length} รายการ
            </div>
          </div>

          <div className="p-4">
            {loading && <div className="text-center py-4">กำลังโหลด...</div>}
            {error && (
              <div className="text-center py-4 text-red-500">{error}</div>
            )}

            {!loading && !error && (
              <div className="max-h-[470px] overflow-y-auto border border-gray-200 rounded">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b w-16">
                        ลำดับ
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        รหัสมื้อ
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        คำอธิบายมื้อ TH
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((item, index) => (
                      <tr
                        key={item.timecode || index}
                        className={`cursor-pointer transition-colors ${
                          selectedItem?.timecode === item.timecode
                            ? 'bg-blue-100'
                            : index % 2 === 0
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <td className="px-4 py-2 text-sm text-gray-900 text-center">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.timecode}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.timeTH}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                ไม่พบข้อมูลที่ค้นหา
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-1/2 p-1">
        <div className="bg-white rounded-lg shadow-md h-full">
          <div className="p-4 border-b">รายละเอียด</div>
        </div>
      </div>
    </div>
  );
};

export default MainTime;

// SELECT
//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
//         ISNULL(dbo.ms_drug.unused,'N') As unused,
//         ISNULL(dbo.ms_drug.sendmachine,'N') As sendmachine,
//         ISNULL(dbo.ms_drug.sendmix,'N') As sendmix,
//         dbo.ms_drug.instructioncode_ipd,
//         ISNULL(dbo.ms_drug.dispensedose_ipd,0) As dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         ISNULL(dbo.ms_drug.dispensedose_opd,0) As dispensedose_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         ISNULL(dbo.ms_drug.cost,0) As cost,
//         ISNULL(dbo.ms_drug.IPDprice,0) As IPDprice,
//         ISNULL(dbo.ms_drug.OPDprice,0) As OPDprice,
//         ISNULL(dbo.ms_drug.medicalsupplies,'N') As medicalsupplies,
//         dbo.ms_drug.capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.Inventorycode,
//         dbo.ms_drug.drugform,
//         'เลือก' as selectdrug
//         FROM
//         dbo.ms_drug
//         LEFT JOIN dbo.ms_drugindex ON
//         dbo.ms_drug.orderitemcode = dbo.ms_drugindex.orderitemcode

//         WHERE ISNULL(dbo.ms_drug.medicalsupplies, 'N') = 'N'
//          AND dbo.ms_drug.unused = 'Y'
//           AND (dbo.ms_drug.orderitemTHname LIKE 'clti1%'
//              OR dbo.ms_drug.orderitemENname LIKE 'clti1%'
//               OR dbo.ms_drugindex.drugindexname LIKE 'clti1%')
//                OR (dbo.ms_drug.unused = 'Y'
//           AND dbo.ms_drug.orderitemcode LIKE 'clti1%'
//            AND ms_drug.searchindex = 'Y')

//         GROUP BY
//         dbo.ms_drug.orderitemcode,
//         dbo.ms_drug.orderitemTHname,
//         dbo.ms_drug.orderitemENname,
//         dbo.ms_drug.genericname,
//         dbo.ms_drug.unused,
//         dbo.ms_drug.sendmachine,
//         dbo.ms_drug.sendmix,
//         dbo.ms_drug.instructioncode_ipd,
//         dbo.ms_drug.dispensedose_ipd,
//         dbo.ms_drug.dosageunitcode_ipd,
//         dbo.ms_drug.frequencycode_ipd,
//         dbo.ms_drug.timecode_ipd,
//         dbo.ms_drug.instructioncode_opd,
//         dbo.ms_drug.dispensedose_opd,
//         dbo.ms_drug.dosageunitcode_opd,
//         dbo.ms_drug.frequencycode_opd,
//         dbo.ms_drug.timecode_opd,
//         dbo.ms_drug.cost,
//         dbo.ms_drug.IPDprice,
//         dbo.ms_drug.OPDprice,
//         dbo.ms_drug.medicalsupplies,
//         dbo.ms_drug.capacity,
//         dbo.ms_drug.capacity_unit,
//         dbo.ms_drug.Inventorycode,
//         dbo.ms_drug.drugform

//          SELECT
//          convert(DATE,pd.ordercreatedate) AS ordercreatedate,
//          pd.hn,
//          pd.an,
//          pt.patientnameTH,
//          pt.rightid,
//          ('[' + wd.wardcode + '] ' + wd.warddesc) AS wardname,
//          pd.orderitemcode,
//          pd.orderitemname,
//          ISNULL(pd.dosage,0) AS dosage,
//          pd.dosageunitcode,
//          ISNULL(pd.orderqty, 0) AS orderqty,
//          pd.orderunitcode,
//          pd.instructioncode,
//          pd.frequencycode,
//          ISNULL(pd.totalprice,0) AS totalprice,
//          pd.timecount,
//          (ISNULL(mdr.cost,0) * ISNULL(pd.orderqty, 0)) AS cost,
//          dc.DoctorCd,
//          FROM
//          prescriptiondetail As pd

//          LEFT JOIN ms_patient As pt On pd.hn = pt.hn
//          LEFT JOIN ms_drug As mdr On pd.orderitemcode = mdr.orderitemcode
//          LEFT JOIN prescriptionheader As ph On pd.prescriptionno = ph.prescriptionno
//          LEFT JOIN ms_ward As wd On ph.wardcode = wd.wardcode
//          LEFT JOIN ms_doctor As dc ON ph.doctorcode = dc.DoctorCd

//          WHERE
//          ISNULL(mdr.medicalsupplies,'N') = 'N'
//          AND pd.orderitemcode = 'CLTI1'
//          AND pd.voiddatetime IS NULL
//          AND pd.holddatetime IS NULL
//          AND pd.ordercreatedate BETWEEN '2024-07-01 00:00:00' AND '2024-08-29 23:59:59'

//          ORDER BY pd.ordercreatedate ASC
