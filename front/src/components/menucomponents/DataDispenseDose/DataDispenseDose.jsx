import React from 'react';
import chse from '../../../../img/hospitalicon.png';
import search from '../../../../img/searchList.svg';

export default function DataDispenseDose() {
  return (
    <div className="w-full h-full">
      <div className="w-full h-[8%] flex justify-start items-center space-x-2 px-2">
        <span className="px-2">ค้นหาจาก :</span>
        <ButtonWithClick colortxt="blue" label={'เลือกหอผู้ป่วย'} icon={chse} />
        <select
          className="w-[15%] h-[60%] border border-gray-400 "
          name="ward"
          id="1"
        >
          <option value="1">ห้อง IPD</option>
          <option value="2">ห้อง เตรียมยาอาคารเภสัช</option>
          <option value="3">ห้องยา OPD อาคารรังสี</option>
          <option value="4">ห้องยา ER</option>
          <option value="5">ห้องยา D/C</option>
        </select>
        <input
          type="text"
          className="w-[15%] h-[55%] border border-collapse border-gray-400"
        />
        <input
          type="date"
          className="w-[8%] h-[60%] font-bold text-[16px] border border-collapse border-gray-400"
        />
        <ButtonWithClick
          colortxt="green"
          label={'เลือกหอผู้ป่วย'}
          icon={search}
        />
      </div>
      <div className="w-full h-[92%] bg-red-400">
        <div className=" border border-collapse border-black w-full h-full bg-white">
          <div className="max-h-full w-full overflow-auto">
            <table className="w-full border-collapse bg-white border border-gray-400">
              <thead className="stick top-0 ">
                <tr>
                  <th className="border border-gray-300 p-2 text-xs min-w-[35px]"></th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[100px]">
                    ใบสั่งยา
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[140px]">
                    Order Type
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[140px]">
                    HN
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[140px]">
                    AN
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[200px]">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[140px]">
                    หอผู้ป่วย
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[100px]">
                    Screen
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                    JVM
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[100px]">
                    LED
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                    HAD
                  </th>
                  <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                    CheckOut
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

const ButtonWithClick = ({ colortxt, icon, label, sout }) => {
  return (
    <button
      className={` h-[70%] w-32 border border-collapse border-gray-400 bg-${colortxt}-400 hover:bg-gray-100 active:bg-white flex items-center justify-around `}
    >
      <img src={icon} alt={label} className="w-8 h-8" />
      <div className="h-full flex flex-col justify-center font-bold items-center">
        <span>{label}</span>
        <span>{sout}</span>
      </div>
    </button>
  );
};

{
  /* <div className="w-[5%] h-full bg-red-300 flex justify-start items-center space-x-1">
          <span className="text-left w-[100%]">ค้นหาจาก :</span>
        </div>
        <div className="w-[10%] h-full bg-green-200 flex flex-end item-center">
          <button>เลือกหอผู้ป่วย</button>
        </div>
        <div className="w-[15%] h-full bg-yellow-50"></div>
        <div className="w-[15%] h-full bg-yellow-300"></div>
        <div className="w-[15%] h-full bg-yellow-500"></div>
        <div className="w-[10%] h-full bg-yellow-700"></div> */
}
