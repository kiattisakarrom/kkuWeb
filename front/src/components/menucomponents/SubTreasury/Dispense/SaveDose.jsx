import React from 'react';
import img from '../../../../../img/exclamationmark.png';
export default function SaveDose() {
  return (
    <div className="w-full h-full flex space-x-2 ">
      <div className="w-[25%] h-[98%] bg-custom-r2 border border-collapse border-gray-400 p-1">
        {' '}
        {/*ซ้าย */}
        <div className="w-full h-[7%]  flex justify-center items-center space-x-1">
          <span>เลือกวันที่ : </span>
          <input
            type="date"
            className="w-[50%] h-[80%] px-1 border border-collapse border-gray-400"
          />
        </div>
        <div className="w-full h-[83%] bg-white">
          <div className="overflow-auto flex">
            <table className="w-full h-full bg-white">
              <thead>
                <tr>
                  <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                    ใบเบิก
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                    เวลา
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
        <div className="w-full h-[10%] flex justify-between items-center px-2">
          <button className="w-[35%] h-[70%] flex justify-center items-center space-x-2 border border-collapse border-gray-400 bg-yellow-100 hover:bg-yellow-400 active:bg-white">
            <img src={img} alt="รูป" className="w-7 h-7" />
            <span>ยกเลิก</span>
          </button>
          <div className="space-x-2 text-red-500">
            <span>จำนวน</span>
            <span>{'0'}</span>
            <span>รายการ</span>
          </div>
        </div>
      </div>
      <div className="w-[75%] h-[98%]  border border-collapse border-gray-400 p-1">
        {/*ขวา */}
        <div className="w-full h-[7%] bg-custom-r2 flex">
          <div className="w-[25%] h-full space-x-2 px-2 flex justify-start items-center">
            <span>เลขที่ใบขอเบิก : </span>
            <span>{'-'}</span>
          </div>
          <div className="w-[25%] h-full space-x-2 px-2 flex justify-start items-center">
            <span>หน่วยงานที่ขอเบิก : </span>
            <span>{'-'}</span>
          </div>
          <div className="w-[25%] h-full space-x-2 px-2 flex justify-start items-center">
            <span>หอผู้ป่วย : </span>
            <span>{'-'}</span>
          </div>
        </div>
        <div className="w-full h-[93%] bg-white">
          <div className="w-full h-full overflow-auto">
            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className="sticky top-0]">
                  <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                    รหัสยา
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                    ชื่อยา
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                    จำนวน
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                    หน่วย
                  </th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
