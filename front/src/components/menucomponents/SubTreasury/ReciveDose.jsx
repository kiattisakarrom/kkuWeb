import React from 'react';
import search from '../../../../img/searchIcon.png';
import cancel from '../../../../img/cancel.png';
import success from '../../../../img/success.png';
export default function ReciveDose() {
  return (
    <div className="w-full h-full">
      <div className="w-full h-[12%] space-x-1 flex">
        <div className="h-full w-[20%]">
          <div className="h-full w-full grid grid-rows-2 grid-cols-3 space-y-2">
            <div className="row-start-1 row-span-1 col-start-1 col-span-2  flex items-end justify-end  font-bold space-x-1 px-2">
              <label className="h-[26px]">วันที่ : </label>
              <input
                type="date"
                className="border border-collapse h-[30px] w-[70%] text-center border-gray-400"
              />
            </div>
            <div className="row-start-2 row-span-1 col-start-1 col-span-2 flex items-start justify-end  font-bold space-x-1 px-2">
              <label className="h-[23px]">ถึง : </label>
              <input
                type="date"
                className=" border border-collapse h-[30px] w-[70%] text-center border-gray-400"
              />
            </div>
            <div className="row-start-1 row-span-2 col-start-3 col-span-1 flex items-center justify-end  font-bold space-x-1 px-2">
              <button className="w-36 rounded-sm h-[40%] text-black font-bold bg-white border border-collapse border-black hover:bg-slate-100 active:bg-slate-300 flex items-center justify-center">
                <img src={search} alt={'ค้นหา'} className="w-6 h-6" />
                <span>{'ค้นหา'}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="h-full w-[80%] py-1 border border-collapse border-gray-400 border-2px">
          <div className="w-full h-full grid grid-rows-2 grid-cols-3">
            <div className="row-start-1 col-span-1 flex items-center space-x-2">
              <span className="h-full w-[40%] font-bold flex justify-end items-center">
                เลขที่เบิก :
              </span>
              <input
                type="text"
                className="w-[50%] px-2 h-[85%] border border-collapse border-gray-400"
              />
            </div>
            <div className="row-start-2 col-span-1 flex items-center space-x-2">
              <span className="h-full w-[40%]  font-bold flex justify-end items-center">
                หน่วยงานที่เบิก :
              </span>
              <select
                className="w-[50%] h-[85%] border border-collapse border-gray-400 "
                name="ward"
                id="1"
              >
                <option value="1">ห้อง IPD</option>
                <option value="2">ห้อง เตรียมยาอาคารเภสัช</option>
                <option value="3">ห้องยา OPD อาคารรังสี</option>
                <option value="4">ห้องยา ER</option>
                <option value="5">ห้องยา D/C</option>
              </select>
            </div>
            <div className="row-start-1 row-span-1 col-start-2 col-span-1 flex justify-start items-center space-x-1 px-2">
              <button className="w-36 h-[90%] rounded-sm text-black font-bold bg-white border border-collapse border-black hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center space-x-2">
                <img src={search} alt={'ค้นหา'} className="w-6 h-6" />
                <span>{'ค้นหา'}</span>
              </button>
              <button className="w-36 h-[90%] rounded-sm text-black font-bold bg-white border border-collapse border-black hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center space-x-2">
                <img src={success} alt={'บันทึก'} className="w-6 h-6" />
                <span>{'บันทึก'}</span>
              </button>
              <button className="w-36 h-[90%] rounded-sm text-black font-bold bg-white border border-collapse border-black hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center space-x-2">
                <img src={cancel} alt={'ยกเลิก'} className="w-6 h-6" />
                <span>{'ยกเลิก'}</span>
              </button>
            </div>
            <div className="row-start-2 col-start-2 col-span-1 flex justify-start items-center space-x-2 px-2 font-bold">
              <h2 className="text-red-500 text-lg">*ADD</h2>
              <span className="text-red-500">จำนวน</span>
              <span className="text-red-500">0</span>
              <span className="text-red-500">รายการ</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-[84%] mt-1 flex space-x-2">
        <div className="w-[20%] h-full px-2 bg-white">
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr className=" sticky top-0">
                <th className="p-2 border-collapse border border-gray-200  text-center">
                  <span>วันที่เติม</span>
                </th>
                <th className="p-2 border-collapse border border-gray-200  text-center">
                  <span>เลขที่เบิก</span>
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="w-[80%] bg-white h-full">
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr className=" sticky top-0">
                <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                  รหัสยา
                </th>
                <th className="p-2 text-center border-collapse border border-gray-200 min-w-[250px]">
                  ชื่อยา
                </th>
                <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                  Lot No.
                </th>
                <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                  วันหมดอายุ
                </th>
                <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                  จำนวน
                </th>
                <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                  แก้จำนวน
                </th>
                <th className="p-2 text-center border-collapse border border-gray-200 min-w-[50px]">
                  ลบ
                </th>
                <th className="p-2 text-center border-collapse border border-gray-200 min-w-[100px]">
                  สถานะ
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
}
