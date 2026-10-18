import React from 'react';
import success from '../../../../../img/success.png';
import cancel from '../../../../../img/cancel.png';
export default function DoseIntoCart() {
  return (
    <div className="w-full h-full p-1 flex space-x-1">
      <div className="h-full w-[30%] grid grid-rows-10 grid-cols-3 font-bold border border-collapse bg-white border-gray-600">
        {/*ตารางซ้าย */}
        <div className="row-start-1 row-span-2 col-span-1 col-start-1 flex justify-center items-center">
          <div className="bg-white w-[70%] h-[90%] border-[2px] border-collapse border-gray-600"></div>
        </div>
        <div className="row-start-1 row-span-1 col-span-2 col-start-2 grid grid-rows-2 grid-cols-1">
          <div className="row-start-2 row-span-1 flex items-center justify-end px-2 space-x-1">
            <span>สแกน รถเข็น : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1"
            />
          </div>
        </div>
        <div className="row-start-2 row-span-1 col-span-2 col-start-2  grid grid-rows-2 grid-cols-1">
          <div className="row-start-1 row-span-1 flex items-center justify-end px-2 space-x-1">
            <span>สแกน รับยา : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1 bg-gray-200"
              readOnly
            />
          </div>
          <div className="row-start-2 row-span-1 flex items-center justify-end px-2 space-x-1 ">
            <span>แสกน ยืนยันรับยา : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1 bg-gray-200"
              readOnly
            />
          </div>
        </div>
        <div className="row-start-3 row-span-1 col-span-3 col-start-1 grid grid-rows-2 grid-cols-1">
          <div className="row-start-1 row-span-1 flex items-center justify-end px-2 space-x-1">
            <span>HN : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1 "
            />
          </div>
          <div className="row-start-2 row-span-1 flex items-center justify-end px-2 space-x-1 ">
            <span>AN : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1 "
            />
          </div>
        </div>
        <div className="row-start-4 row-span-1 col-span-3 col-start-1 grid grid-rows-2 grid-cols-1">
          <div className="row-start-1 row-span-1 flex items-center justify-end px-2 space-x-1">
            <span>ชื่อ - นามสกุล : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1 "
            />
          </div>
          <div className="row-start-2 row-span-1 flex items-center justify-end px-2 space-x-1 ">
            <span>วันเกิด : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1 "
            />
          </div>
        </div>
        <div className="row-start-5 row-span-1 col-span-3 col-start-1 grid grid-rows-2 grid-cols-1">
          <div className="row-start-1 row-span-1 flex items-center justify-end px-2 space-x-1">
            <span>อายุ : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1 "
            />
          </div>
          <div className="row-start-2 row-span-1 flex items-center justify-end px-2 space-x-1 ">
            <span>หอผู้ป่วย : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1    "
            />
          </div>
        </div>
        <div className="row-start-6 row-span-4 col-span-3 col-start-1 grid grid-rows-8 grid-cols-1">
          <div className="row-start-1 row-span-1 col-span-1 col-start-1  flex items-center justify-end px-2 space-x-1">
            <span>อายุ : </span>
            <input
              type="text"
              className="border border-collapse border-gray-400 w-[60%] h-[90%] px-1 "
            />
          </div>
          <div className="row-start-2 row-span-2 col-span-1 col-start-1 flex items-center justify-end px-2 space-x-1">
            <span className="w-[39%] h-[90%] text-right">เตียงผู้ป่วย : </span>
            <textarea className="border border-collapse resize-none border-gray-400 w-[60%] h-[90%] p-1"></textarea>
          </div>
          <div className="row-start-4 row-span-3 col-span-1 col-start-1 flex items-center justify-end px-2 space-x-1">
            <span className="w-[39%] h-[90%] text-right">แพ้ยา : </span>
            <textarea className="border border-collapse resize-none border-gray-400 w-[60%] h-[90%] focus:outline-none focus:ring-0 p-1"></textarea>
          </div>
        </div>
      </div>
      <div className="h-full w-[70%] border border-collapse border-gray-600">
        {' '}
        {/*ตารางขวา */}
        <div className="w-full h-[92%] bg-white">
          <div className="w-full h-full px-2 bg-white border border-collapse border-gray-400 ">
            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className=" sticky top-0">
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[150px]">
                    <span>ตำแหน่งยา</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[150px]">
                    <span>รหัสยา</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[220px]">
                    <span>ชื่อยา</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[80px]">
                    <span>จำนวน</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[100px]">
                    <span>หน่วนขาย</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[100px]">
                    <span>วิธีใช้</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[100px]">
                    <span>ความถี่</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[100px]">
                    <span>เวลา</span>
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
        <div className="w-full h-[8%] bg-black px-2 flex">
          <div className="w-[40%] h-full space-x-2 font-bold flex justify-start items-center">
            <span className="text-yellow-500">จำนวน</span>
            <span className="text-yellow-500">{'0'}</span>
            <span className="text-yellow-500">รายการ</span>
          </div>
          <div className="w-[60%] h-full space-x-2 font-bold flex justify-start items-center">
            <Button icon={success} label={'ยืนยัน'} />
            <Button icon={cancel} label={'ยกเลิก'} />
          </div>
        </div>
      </div>
    </div>
  );
}

const Button = ({ icon, label }) => {
  return (
    <button
      className={`w-[15%] h-[90%] text-black font-bold space-x-1 bg-white border border-collapse border-black hover:bg-slate-100 active:bg-slate-300 flex items-center justify-center`}
    >
      <img src={icon} alt={label} className="w-7 h-7" />
      <span className="text-[14px]">{label}</span>
    </button>
  );
};
