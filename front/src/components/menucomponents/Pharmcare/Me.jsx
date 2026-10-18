import React from 'react';
import cancel from '../../../../img/cancel.png';

export default function Me() {
  return (
    <div className="w-full h-full grid grid-rows-4 grid-cols-1">
      <div className="row-start-1 row-span-3 grid grid-rows-11 grid-cols-4">
        <div className="row-start-2 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          <span>รหัสข้อมูล :</span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-3 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          {' '}
          <span>User Error :</span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-3 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-2 px-2">
          <button className="w-[10%] h-[75%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
        </div>

        <div className="row-start-4 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          {' '}
          <span>วันที่เกิด Error :</span>
          <input
            type="date"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-5 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          {' '}
          <span>ขั้นตอนที่เกิด Error:</span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-5 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-2 px-2">
          <button className="w-[10%] h-[75%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
        </div>
        <div className="row-start-6 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          {' '}
          <span>ที่ถูกต้อง :</span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-7 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          {' '}
          <span>ที่ผิด :</span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-8 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          {' '}
          <span>ประเภทของการเกิด :</span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-8 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-2 px-2">
          <button className="w-[10%] h-[75%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
        </div>
        <div className="row-start-9 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          {' '}
          <span>ชนิดของการเกิด :</span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-9 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-2 px-2">
          <button className="w-[10%] h-[75%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
        </div>
        <div className="row-start-10 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          {' '}
          <span>ระดับความรุนแรง :</span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-10 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-2 px-2">
          <button className="w-[10%] h-[75%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
        </div>
        <div className="row-start-11 row-span-1 col-span-2 col-start-1 flex justify-end items-center space-x-2 ">
          {' '}
          <span>ผู้บันทึก :</span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
      </div>
      <div className="row-start-4 row-span-1 grid grid-rows-4 grid-cols-4">
        <div className="row-start-1 row-span-2 col-start-1 col-span-2 flex justify-end items-center">
          <Button icon={cancel} label={'ยกเลิก'} />
        </div>
      </div>
    </div>
  );
}
const Button = ({ icon, label }) => {
  return (
    <button
      className={`w-[15%] h-[90%] text-black font-bold space-x-1 bg-white border border-collapse border-black hover:bg-slate-100 active:bg-slate-300 flex flex-wrap items-center justify-center`}
    >
      <img src={icon} alt={label} className="w-7 h-7" />
      <span className="text-[14px]">{label}</span>
    </button>
  );
};
