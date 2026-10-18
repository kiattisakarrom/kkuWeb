import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { API_URL } from '../../../../config';

const MainLinkHowUse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicineData, setMedicineData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null); // 👈 เพิ่ม state สำหรับ track index
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // โหลดข้อมูลจาก API

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // รอ 500ms หลังผู้ใช้หยุดพิมพ์ข้อมูลเยอะเลยข้า

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_URL}/dose/show_SearchDrugUsage?txtSearch=${debouncedSearch}`
        );
        const data = await res.json();

        setMedicineData(data || []);
        setSelectedItem(null);
        setSelectedIndex(null);
      } catch (err) {
        console.error(err);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearch]);

  const handleItemClick = (item, index) => {
    setSelectedItem(item);
    setSelectedIndex(index);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ฝั่งซ้าย - ส่วนค้นหาและตาราง */}
      <div className="w-1/2 p-1">
        <div className="bg-white rounded-lg shadow-md h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              ข้อมูล รายการยา ผูกวิธีใช้
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
                      <th className="px-4 py-2 text-center align-middle text-sm font-semibold text-gray-700 border-b">
                        วิธีใช้
                      </th>
                      <th className="px-4 py-2 text-center align-middle text-sm font-semibold text-gray-700 border-b">
                        เรียกลำดับ
                      </th>
                      <th className="px-4 py-2 text-center align-middle text-sm font-semibold text-gray-700 border-b">
                        DrugUsageDetail
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
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.name || item.drugusagedesc}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.name || item.prioritydrugusage}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.name || item.drugusagedetail}
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

export default MainLinkHowUse;
