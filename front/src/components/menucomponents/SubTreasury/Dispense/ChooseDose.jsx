import React from 'react';
import chse from '../../../../../img/icon4.png';
import add from '../../../../../img/addDoc.png';

export default function ChooseDose() {
  return (
    <div className="w-full h-full">
      <div className="w-[100%] h-[15%] border border-black">
        <div className="w-[100%] h-[100%]  grid grid-rows-2 grid-cols-7 ">
          <div className="w-[100%] h-[100%] row-start-1 row-span-1 col-start-1 col-span-3  flex justify-end items-center space-x-1">
            <span className="text-right w-[40%]">เลขที่ใบขอเบิก : </span>
            <input
              type="text"
              className="w-[40%] h-[60%] border border-gray-400"
            />
          </div>
          <div className="row-start-2 row-span-1 col-start-1 col-span-3   flex justify-end items-center space-x-1">
            <span className="text-right w-[40%]">หน่วยงานที่ขอเบิก : </span>
            <select
              className="w-[40%] h-[60%] border border-gray-400 "
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
          <div className="row-start-1 row-span-1 col-start-4 col-span-3  flex justify-start items-center space-x-1 px-3">
            <ButtonWithClick colortxt="red" label={'เลือกยา'} icon={chse} />
            <ButtonWithClick colortxt="green" label={'บันทึก'} icon={add} />
            <span className="text-red-500">จำนวน {'0'} รายการ</span>
          </div>
          <div className="row-start-2 row-span-1 col-start-4 col-span-2  flex justify-start items-center space-x-1 ">
            <span className="text-right w-[30%]">หอผู้ป่วย :</span>
            <select
              className="w-[40%] h-[60%] border border-gray-400 "
              name="ward"
              id="1"
            >
              <option value="1">เจ้าหน้าที่ระบบ</option>
              <option value="2">tes2</option>
            </select>
          </div>
        </div>
      </div>
      <div className="w-[100%] h-[83%] bg-blue-300">
        <div className=" border border-collapse border-black w-full h-full bg-white">
          <div className="max-h-full w-full overflow-auto">
            <table className="w-full border-collapse bg-white border border-gray-400">
              <thead className="stick top-0 ">
                <tr>
                  <th className="border border-gray-300 p-2 text-xs min-w-[40px]"></th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                    รหัสยา
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[220px]">
                    ชื่อยา
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                    จำนวน
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                    หน่วย
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[40px]"></th>
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
const ButtonWithClick = ({ colortxt, icon, label, sout }) => {
  return (
    <button
      className={` h-[90%] w-32 border border-collapse border-gray-400 bg-${colortxt}-400 hover:bg-gray-100 active:bg-white flex items-center justify-around `}
    >
      <img src={icon} alt={label} className="w-8 h-8" />
      <div className="h-full flex flex-col justify-center font-bold items-center">
        <span>{label}</span>
        <span>{sout}</span>
      </div>
    </button>
  );
};
