import React from 'react';

export default function StateDoseIntoCart() {
  return (
    <div className="h-full w-full flex space-x-2 font-bold">
      <div className="w-[20%] h-full border-[2px] border-collapse border-gray-400 px-1">
        {' '}
        {/*ตารางซ้าย */}
        <div className="w-full h-[10%] grid grid-rows-2 grid-cols-1">
          <div className="row-start-1 row-span-1 flex justify-center items-center">
            <span>หอผู้ป่วยที่ Admit</span>
          </div>
          <div className="row-start-2 row-span-1 flex ">
            <form className="flex justify-start w-full h-full items-center px-2 space-x-3">
              <div className="space-x-1">
                <input type="radio" name="putDose" />
                <label>ยังไม่บรรจุยา</label>
              </div>
              <div className="space-x-1">
                <input type="radio" name="putDose" />
                <label>บรรจุยา</label>
              </div>
            </form>
          </div>
        </div>
        <div className="w-full h-[85%] bg-red-300 border border-collapse border-black">
          <div className="w-full h-full px-2 bg-white border border-collapse border-gray-400 ">
            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className="w-full sticky top-0">
                  <th className="p-2 border-collapse border border-gray-200 text-center">
                    <span>หอผู้ป่วย</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center">
                    <span>จำนวน</span>
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
        <div className="w-full h-[5%] flex px-2 items-center bg-black space-x-2">
          <span className="text-yellow-400">จำนวน</span>
          <span className="text-yellow-400">{'0'}</span>
          <span className="text-yellow-400">รายการ</span>
        </div>
      </div>

      <div className="w-[80%] h-full  border-[2px] border-collapse border-gray-400">
        {' '}
        {/*ตารางขวา */}
        <div className="w-full h-[10%] grid grid-rows-2 grid-cols-10">
          <div className="row-start-1 row-span-1 col-start-1 col-span-10 flex justify-center items-center">
            ข้อมูลผู้ป่วย
          </div>
          <div className="space-x-2 row-start-2 row-span-1 col-start-1 col-span-1 flex justify-center items-center">
            <span>รหัสหอผู้ป่วย : </span>
            <span>{'-'}</span>
          </div>
          <div className="space-x-2 row-start-2 row-span-1 col-start-2 col-span-1 flex justify-center items-center">
            <span>หอผู้ป่วย : </span>
            <span>{'-'}</span>
          </div>
        </div>
        <div className="w-full h-[85%]">
          <div className="w-full h-full px-2 bg-white border border-collapse border-gray-400 ">
            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className=" sticky top-0">
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[150px]">
                    <span>ใบสั่งยา</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[150px]">
                    <span>ประเภทใบสั่งยา</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[100px]">
                    <span>HN</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[100px]">
                    <span>AN</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[200px]">
                    <span>ชื่อ-นามสกุล</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200 text-center min-w-[100px]">
                    <span>สถานะ</span>
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
        <div className="w-full h-[5%] bg-black space-x-2 flex items-center px-3">
          <span className="text-yellow-400">จำนวน</span>
          <span className="text-yellow-400">{'0'}</span>
          <span className="text-yellow-400">รายการ</span>
        </div>
      </div>
    </div>
  );
}
