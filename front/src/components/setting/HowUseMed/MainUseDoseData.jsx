// import React, { useState, useEffect } from 'react';
// import { Plus, Edit, Minus, Printer, X } from 'lucide-react';

// const MainDoseData = () => {
//   const [data, setData] = useState([]);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     const mock = [
//       {
//         id: 1,
//         code: 'CDOM',
//         nameTH: 'อายุรกรรมหัวใจ',
//         nameEN: '',
//         dose: 0,
//         mix: 'อายุรกรรมหัวใจ',
//       },
//       {
//         id: 2,
//         code: 'REPLY',
//         nameTH: '( ) ขอใช้ยาต่อ ( ) ขอหยุดใช้ยา',
//         nameEN: '',
//         dose: 0,
//         mix: '( ) ขอใช้ยาต่อ ( ) ขอหยุดใช้ยา',
//       },
//       {
//         id: 3,
//         code: 'K',
//         nameTH: '(ค้างจ่าย) นัดรับยา วันที่',
//         nameEN: '',
//         dose: 0,
//         mix: '(ค้างจ่าย) นัดรับยา วันที่',
//       },
//       {
//         id: 4,
//         code: 'MRIC',
//         nameTH: '(เปลี่ยน) ฉีดยาครั้งละ',
//         nameEN: '',
//         dose: 0,
//         mix: '(เปลี่ยน) ฉีดยาครั้งละ',
//       },
//       {
//         id: 5,
//         code: 'MROC',
//         nameTH: '(เปลี่ยน) รับประทานครั้งละ',
//         nameEN: '',
//         dose: 0,
//         mix: '(เปลี่ยน) รับประทานครั้งละ',
//       },
//       {
//         id: 6,
//         code: 'MRMDIC',
//         nameTH: '(เปลี่ยน) สูดพ่นเข้าลำคอครั้งละ',
//         nameEN: '',
//         dose: 0,
//         mix: '(เปลี่ยน) สูดพ่นเข้าลำคอครั้งละ',
//       },
//     ];
//     setData(mock);
//   }, []);

//   const filteredData = data.filter(
//     (item) =>
//       item.code.toLowerCase().includes(search.toLowerCase()) ||
//       item.nameTH.toLowerCase().includes(search.toLowerCase())
//   );

//   const [formData, setFormData] = useState({
//     code: '',
//     dose: '',
//     nameTH: '',
//     nameEN: '',
//     nameDrug: '',
//     status: 'active',
//     labelStatus: 'withLabel',
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleRadioChange = (name, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleAdd = () => {
//     console.log('เพิ่มข้อมูล:', formData);
//     // ล้างฟอร์มหลังเพิ่มข้อมูل
//     setFormData({
//       code: '',
//       dose: '',
//       nameTH: '',
//       nameEN: '',
//       nameDrug: '',
//       status: 'active',
//       labelStatus: 'withLabel',
//     });
//   };

//   const handleEdit = () => {
//     console.log('แก้ไขข้อมูล:', formData);
//   };

//   const handleDelete = () => {
//     console.log('ลบข้อมูล');
//     // ล้างฟอร์ม
//     setFormData({
//       code: '',
//       dose: '',
//       nameTH: '',
//       nameEN: '',
//       nameDrug: '',
//       status: 'active',
//       labelStatus: 'withLabel',
//     });
//   };

//   const handlePrint = () => {
//     console.log('พิมพ์ข้อมูล');
//   };

//   const handleCancel = () => {
//     console.log('ยกเลิก');
//     // ล้างฟอร์ม
//     setFormData({
//       code: '',
//       dose: '',
//       nameTH: '',
//       nameEN: '',
//       nameDrug: '',
//       status: 'active',
//       labelStatus: 'withLabel',
//     });
//   };

//   return (
//     <div className="p-1">
//       <div className="p-1">
//         <div className="flex items-center mb-3">
//           <input
//             type="text"
//             placeholder="ค้นหา..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="border rounded px-3 py-1 w-64 outline-none focus:ring-2 focus:ring-blue-400"
//           />
//           <span className="ml-4 text-gray-600">
//             จำนวน {filteredData.length} รายการ
//           </span>
//         </div>

//         <div className="border rounded shadow overflow-y-scroll h-[300px]">
//           <table className="min-w-full border-collapse">
//             <thead className="bg-gray-100 sticky top-0">
//               <tr>
//                 <th className="border px-3 py-2 w-16">ลำดับ</th>
//                 <th className="border px-3 py-2 w-32">รหัสวิธีใช้</th>
//                 <th className="border px-3 py-2">วิธีใช้ยา TH</th>
//                 <th className="border px-3 py-2">วิธีใช้ยา EN</th>
//                 <th className="border px-3 py-2 w-20">Dose</th>
//                 <th className="border px-3 py-2">วิธีใช้ยา ห้องผสม</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredData.map((item, idx) => (
//                 <tr
//                   key={item.id}
//                   className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
//                 >
//                   <td className="border px-3 py-2 text-center">{idx + 1}</td>
//                   <td className="border px-3 py-2 text-blue-600 font-medium">
//                     {item.code}
//                   </td>
//                   <td className="border px-3 py-2">{item.nameTH}</td>
//                   <td className="border px-3 py-2">{item.nameEN}</td>
//                   <td className="border px-3 py-2 text-center">{item.dose}</td>
//                   <td className="border px-3 py-2">{item.mix}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <div>
{
  /* <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              <div className="flex gap-8 items-center">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 font-medium whitespace-nowrap">
                    รหัสใช้ยา:
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="border border-gray-300 px-3 py-2 w-48 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 ml-auto">
                  <label className="text-gray-700 font-medium whitespace-nowrap">
                    Dose:
                  </label>
                  <input
                    type="text"
                    name="dose"
                    value={formData.dose}
                    onChange={handleInputChange}
                    className="border border-gray-300 px-1 py-2 w-48 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2 ml-8">
                  <div className="text-gray-700 font-medium">สถานะ:</div>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'active'}
                        onChange={() => handleRadioChange('status', 'active')}
                        className="text-blue-600"
                      />
                      <span className="text-sm">เปิดใช้</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'inactive'}
                        onChange={() => handleRadioChange('status', 'inactive')}
                        className="text-blue-600"
                      />
                      <span className="text-sm">ปิดใช้</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-8">
                  <div className="text-gray-700 font-medium">สถานะป้ายยา:</div>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="labelStatus"
                        checked={formData.labelStatus === 'withLabel'}
                        onChange={() =>
                          handleRadioChange('labelStatus', 'withLabel')
                        }
                        className="text-blue-600"
                      />
                      <span className="text-sm">ห้อมฉลาก</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="labelStatus"
                        checked={formData.labelStatus === 'withoutLabel'}
                        onChange={() =>
                          handleRadioChange('labelStatus', 'withoutLabel')
                        }
                        className="text-blue-600"
                      />
                      <span className="text-sm">ไม่ใช้ห้อมฉลาก</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium whitespace-nowrap">
                  รหัสใช้ยา TH:
                </label>
                <input
                  type="text"
                  name="nameTH"
                  value={formData.nameTH}
                  onChange={handleInputChange}
                  className="border border-gray-300 px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium whitespace-nowrap">
                  รหัสใช้ยา EN:
                </label>
                <input
                  type="text"
                  name="nameEN"
                  value={formData.nameEN}
                  onChange={handleInputChange}
                  className="border border-gray-300 px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium whitespace-nowrap">
                  รหัสใช้ยา ห้อมฉลาก:
                </label>
                <input
                  type="text"
                  name="nameDrug"
                  value={formData.nameDrug}
                  onChange={handleInputChange}
                  className="border border-gray-300 px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-0 mt-8">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">เพิ่ม</span>
              </button>

              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white border-2 border-gray-600 hover:bg-gray-700 transition-colors"
              >
                <Edit className="w-5 h-5" />
                <span className="font-medium">แก้ไข</span>
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white border-2 border-gray-600 hover:bg-gray-700 transition-colors"
              >
                <Minus className="w-5 h-5" />
                <span className="font-medium">ลบ</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white border-2 border-gray-600 hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-5 h-5" />
                <span className="font-medium">บันทึก</span>
              </button>

              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 transition-colors"
              >
                <X className="w-5 h-5" />
                <span className="font-medium">ยกเลิก</span>
              </button>
            </div>
          </div>
        </div> */
}
//       </div>
//     </div>
//   );
// };

// export default MainDoseData;

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Minus, Printer, X } from 'lucide-react';

const MainDoseData = () => {
  const [search, setSearch] = useState(''); // ค่าที่พิมพ์ในช่องค้นหา
  const [data, setData] = useState([]); // เก็บข้อมูลจาก API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ดึงข้อมูล (สามารถเปลี่ยน search ให้ส่งไป query ได้เลย)
        const res = await fetch(
          `http://localhost:3000/dose/get_ms_Instruction?txtSearch=${search}`
        );
        const json = await res.json();

        // สมมติ API ส่ง { recordset: [...] } มา
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
  }, [search]); // ทุกครั้งที่พิมพ์ search → ไปยิง API ใหม่

  const [formData, setFormData] = useState({
    code: '',
    dose: '',
    nameTH: '',
    nameEN: '',
    nameDrug: '',
    status: 'active',
    labelStatus: 'withLabel',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    console.log('เพิ่มข้อมูล:', formData);
    // ล้างฟอร์มหลังเพิ่มข้อมูل
    setFormData({
      code: '',
      dose: '',
      nameTH: '',
      nameEN: '',
      nameDrug: '',
      status: 'active',
      labelStatus: 'withLabel',
    });
  };

  const handleEdit = () => {
    console.log('แก้ไขข้อมูล:', formData);
  };

  const handleDelete = () => {
    console.log('ลบข้อมูล');
    // ล้างฟอร์ม
    setFormData({
      code: '',
      dose: '',
      nameTH: '',
      nameEN: '',
      nameDrug: '',
      status: 'active',
      labelStatus: 'withLabel',
    });
  };

  const handlePrint = () => {
    console.log('พิมพ์ข้อมูล');
  };

  const handleCancel = () => {
    console.log('ยกเลิก');
    // ล้างฟอร์ม
    setFormData({
      code: '',
      dose: '',
      nameTH: '',
      nameEN: '',
      nameDrug: '',
      status: 'active',
      labelStatus: 'withLabel',
    });
  };

  return (
    <div>
      <div className="p-4">
        {/* Search bar */}
        <div className="flex items-center mb-3">
          <input
            type="text"
            placeholder="ค้นหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-1 w-64 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span className="ml-4 text-gray-600">จำนวน {data.length} รายการ</span>
        </div>

        {/* แสดง error หรือ loading */}
        {loading && <div className="text-blue-600">กำลังโหลด...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {/* Table */}
        <div className="border rounded shadow overflow-y-scroll h-[300px] mt-2">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-3 py-2 w-16">ลำดับ</th>
                <th className="border px-3 py-2 w-32">รหัสวิธีใช้</th>
                <th className="border px-3 py-2">วิธีใช้ยา TH</th>
                <th className="border px-3 py-2">วิธีใช้ยา EN</th>
                <th className="border px-3 py-2 w-20">Dose</th>
                <th className="border px-3 py-2">วิธีใช้ยา ห้องผสม</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-200 cursor-pointer`}
                >
                  <td className="border px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border px-3 py-2 text-blue-600 font-medium">
                    {item.InstructionCd}
                  </td>
                  <td className="border px-3 py-2">{item.InstructionNameTH}</td>
                  <td className="border px-3 py-2">{item.InstructionNameEN}</td>
                  <td className="border px-3 py-2 text-center">{item.dose}</td>
                  <td className="border px-3 py-2">
                    {item.InstructionNameMix}
                  </td>
                </tr>
              ))}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="space-y-3">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-medium text-sm whitespace-nowrap">
                  รหัสใช้ยา:
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="border border-gray-300 px-2 py-1 w-24 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                />
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <label className="text-gray-700 font-medium text-sm whitespace-nowrap">
                  Dose:
                </label>
                <input
                  type="text"
                  name="dose"
                  value={formData.dose}
                  onChange={handleInputChange}
                  className="border border-gray-300 px-1 py-1 w-24 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1 ml-4">
                <div className="text-gray-700 font-medium text-sm">สถานะ:</div>
                <div className="flex flex-col gap-0.5">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'active'}
                      onChange={() => handleRadioChange('status', 'active')}
                      className="text-blue-600"
                    />
                    <span>เปิดใช้</span>
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'inactive'}
                      onChange={() => handleRadioChange('status', 'inactive')}
                      className="text-blue-600"
                    />
                    <span>ปิดใช้</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1 ml-4">
                <div className="text-gray-700 font-medium text-sm">
                  สถานะป้ายยา:
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="labelStatus"
                      checked={formData.labelStatus === 'withLabel'}
                      onChange={() =>
                        handleRadioChange('labelStatus', 'withLabel')
                      }
                      className="text-blue-600"
                    />
                    <span>ห้อมฉลาก</span>
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="labelStatus"
                      checked={formData.labelStatus === 'withoutLabel'}
                      onChange={() =>
                        handleRadioChange('labelStatus', 'withoutLabel')
                      }
                      className="text-blue-600"
                    />
                    <span>ไม่ใช้ห้อมฉลาก</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium text-sm whitespace-nowrap">
                รหัสใช้ยา TH:
              </label>
              <input
                type="text"
                name="nameTH"
                value={formData.nameTH}
                onChange={handleInputChange}
                className="border border-gray-300 px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium text-sm whitespace-nowrap">
                รหัสใช้ยา EN:
              </label>
              <input
                type="text"
                name="nameEN"
                value={formData.nameEN}
                onChange={handleInputChange}
                className="border border-gray-300 px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium text-sm whitespace-nowrap">
                รหัสใช้ยา ห้อมฉลาก:
              </label>
              <input
                type="text"
                name="nameDrug"
                value={formData.nameDrug}
                onChange={handleInputChange}
                className="border border-gray-300 px-2 py-1 flex-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-0 mt-4">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white border text-sm border-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่ม</span>
            </button>

            <button
              onClick={handleEdit}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white border text-sm border-gray-600 hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>แก้ไข</span>
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white border text-sm border-gray-600 hover:bg-gray-700 transition-colors"
            >
              <Minus className="w-4 h-4" />
              <span>ลบ</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white border text-sm border-gray-600 hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>บันทึก</span>
            </button>

            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white border text-sm border-red-600 hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>ยกเลิก</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDoseData;
