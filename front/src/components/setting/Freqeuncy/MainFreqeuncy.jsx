import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../../config';

const MainFrequensy = () => {
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

        // ดึงข้อมูล (สามารถเปลี่ยน searh ให้ส่งไป query ได้เลย)
        const res = await fetch(
          API_URL + `/dose/get_ms_frequency_code?txtSearch=${search}`
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
  }, [search]); // ทุกครั้งที่พิมพ์ searh → ไปยิง API ใหม่

  return (
    <div>
      <div className="p-4">
        {/* Searh bar */}
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
                <th className="border px-3 py-2 w-32">รหัสความถี่</th>
                <th className="border px-3 py-2">ความถี่ TH</th>
                <th className="border px-3 py-2">ความถี่ EN</th>
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
                    {item.frequency_code}
                  </td>
                  <td className="border px-3 py-2">{item.frequency_nameTH}</td>
                  <td className="border px-3 py-2">{item.frequency_nameEN}</td>
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
    </div>
  );
};

export default MainFrequensy;
