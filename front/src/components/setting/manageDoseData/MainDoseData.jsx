import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { getSearchDoseManager } from '../../../service/DoseService';
import AddMainDoseData from './AddMainDoseData';

export default function MainDoseData() {
  return (
    <div className="h-full w-full flex-col">
      <Routes>
        <Route path="" element={<ShowData />} />
        <Route path="/DoseData/:orderitemcode" element={<AddMainDoseData />} />
      </Routes>
    </div>
  );
}

const ShowData = () => {
  const [search, setSearch] = useState('');
  const [selectedOption, setSelectedOption] = useState('open');
  const [radioG, setradioG] = useState('dose');
  const [data, setData] = useState([]);
  useEffect(() => {
    const getData = async () => {
      let result = '';
      let condition = 1;
      let rdOpen = false;
      let rdClose = false;
      if (selectedOption === 'open') {
        rdOpen = true;
      } else if (selectedOption === 'close') {
        rdClose = true;
      }

      if (radioG === 'dose') {
        condition = 1;
      } else if (radioG === 'wechaput') {
        condition = 2;
      } else {
        condition = 3;
      }
      try {
        result = await getSearchDoseManager(search, condition, rdOpen, rdClose); // ส่ง param ตามจริง
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
      }
      setData(result.recordset);
    };
    getData();
  }, [search, selectedOption, radioG]);
  const handleChangeWorking = (e) => {
    setSelectedOption(e.target.value);
  };
  const handleChangeG = (e) => {
    setradioG(e.target.value);
  };
  const navigate = useNavigate();
  const handleRowClick = (item) => {
    navigate(`DoseData/${item.orderitemcode}`);
  };
  return (
    <div className="w-full h-full">
      <div className="text-[16px] border-b-2 border-collapse border-gray-400 pb-1">
        ข้อมูลยาหลัก
      </div>
      <div className="w-full h-[8%] flex justify-between">
        <div className="w-[70%] flex py-3 px-10 space-x-6 items-center ">
          <input
            type="text"
            className="border w-56 h-10 py-1 px-2 text-sm rounded-lg"
            placeholder="ค้นหา"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex space-x-2">
            <label htmlFor="mySelect">การใช้งาน :</label>
            <label className="flex items-center space-x-[2px]">
              <input
                type="radio"
                name="working"
                value="all"
                checked={selectedOption === 'all'}
                onChange={handleChangeWorking}
              />
              <span>ทั้งหมด</span>
            </label>

            <label className="flex items-center space-x-[2px]">
              <input
                type="radio"
                name="working"
                value="open"
                checked={selectedOption === 'open'}
                onChange={handleChangeWorking}
              />
              <span>เปิดใช้งาน</span>
            </label>

            <label className="flex items-center space-x-[2px]">
              <input
                type="radio"
                name="working"
                value="close"
                checked={selectedOption === 'close'}
                onChange={handleChangeWorking}
              />
              <span>ปิดใช้งาน</span>
            </label>
          </div>
          <div className="flex space-x-2">
            <label htmlFor="mySelect">การแสดงผล :</label>
            <label className="flex items-center space-x-[2px]">
              <input
                type="radio"
                name="grafic"
                value="allG"
                checked={radioG === 'allG'}
                onChange={handleChangeG}
              />
              <span>ทั้งหมด</span>
            </label>
            <label className="flex items-center space-x-[2px]">
              <input
                type="radio"
                name="grafic"
                value="wechaput"
                checked={radioG === 'wechaput'}
                onChange={handleChangeG}
              />
              <span>เวชภัณฑ์</span>
            </label>
            <label className="flex items-center space-x-[2px]">
              <input
                type="radio"
                name="grafic"
                value="dose"
                checked={radioG === 'dose'}
                onChange={handleChangeG}
              />
              <span>ยา</span>
            </label>
          </div>
        </div>
        <div className="px-10 w-[30%] flex justify-end items-center">
          <p className="text-red-600 text-[15px] font-bold">
            จำนวน {data.length} รายการ
          </p>
        </div>
      </div>
      <div className="w-full h-[80%] ">
        <div className="h-full overflow-auto px-2 border border-gray-200 ">
          <table className="w-full rounded shadow ">
            <thead className="bg-custom-r1 sticky top-0">
              <tr>
                <th className="px-1 py-2 border border-gray-300">รหัสยา</th>
                <th className="px-2 py-2 border border-gray-300">
                  ชื้อยาภาษาอังกฤษ
                </th>
                <th className="px-2 py-2 border border-gray-300">
                  ชื้อยาภาษาไทย
                </th>
                <th className="px-1 py-2 border border-gray-300">
                  Gernaric Name
                </th>
                <th className="px-1 py-2 border border-gray-300">เปิดใช้</th>
                <th className="px-1 py-2 border border-gray-300">ส่งเครื่อง</th>
                <th className="px-1 py-2 border border-gray-300">ส่งผลิต</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr
                  key={item.orderitemcode}
                  onDoubleClick={() => handleRowClick(item)}
                  className="hover:bg-blue-400 hover:text-white active:bg-blue-700 cursor-pointer "
                >
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {item.orderitemcode}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {item.orderitemENname}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {item.orderitemTHname}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {item.genericname}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {item.unused === 'Y' ? '✔️' : '❌'}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {item.sendmachine === 'Y' ? '✔️' : '❌'}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {item.sendmix === 'Y' ? '✔️' : '❌'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full h-[8%] space-x-5 py-2 px-12">
        <button
          className="w-32 h-full bg-green-300 hover:bg-green-200"
          onClick={() => {
            navigate('DoseData');
          }}
        >
          เพิ่ม
        </button>
        <button className="w-32 h-full bg-yellow-300 hover:bg-yellow-200">
          แก้ไข
        </button>
      </div>
    </div>
  );
};
