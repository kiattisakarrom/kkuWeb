import React from 'react';

export default function FrmInputDataPharmcare() {
  return (
    <div className="h-full w-full grid grid-rows-6 grid-cols-5">
      <div className="row-start-1 row-span-1 col-span-5 col-start-1 flex justify-start items-center">
        {/*แถว 1 */}
        <div className="w-1/5 h-full items-center flex space-x-2">
          <span className="w-[40%] flex justify-end items-center ">
            OrderNo :
          </span>
          <input
            type="text"
            className="w-[58%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="w-[10.72%] h-full items-center flex space-x-2">
          <span className="w-[20%] flex justify-end items-center ">HN :</span>
          <input
            type="text"
            className="w-[78%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="w-[10.72%] h-full items-center flex space-x-2">
          <span className="w-[20%] flex justify-end items-center ">AN :</span>
          <input
            type="text"
            className="w-[78%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="w-[8.72%] h-full items-center flex space-x-1">
          <span className="w-[25%] flex justify-end items-center ">เพศ :</span>
          <input
            type="text"
            className="w-[74%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="w-[10.72%] h-full items-center flex space-x-2">
          <span className="w-[20%] flex justify-end items-center ">อายุ :</span>
          <input
            type="text"
            className="w-[78%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="w-[12.72%] h-full items-center flex space-x-2">
          <span className="w-[40%] flex justify-end items-center ">
            Admit Date :
          </span>
          <input
            type="text"
            className="w-[58%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="w-[10.72%] h-full items-center flex space-x-2">
          <span className="w-[40%] flex justify-end items-center ">
            TypeOPt :
          </span>

          <select
            className="w-[58%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="1">IPD</option>
            <option value="2">OPD</option>
          </select>
        </div>
        <div className="w-[10.72%] h-full items-center flex space-x-2">
          <span className="w-[40%] flex justify-end items-center ">
            NewCase :
          </span>
          <select
            className="w-[58%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="1">0</option>
            <option value="2">1</option>
          </select>
        </div>
      </div>
      <div className="row-start-2 row-span-1 col-span-1 col-start-1  flex justify-start items-center space-x-1">
        <span className="w-[41%] flex justify-end items-center ">Ward :</span>
        <input
          type="text"
          className="w-[48%] h-[90%] border-collapse border border-gray-400 px-2"
        />
        <button className="w-[10%] h-[90%] bg-gray-700 rounded rotate-180 text-white">
          ^
        </button>
      </div>
      <div className="row-start-3 row-span-1 col-span-1 col-start-1 flex justify-start items-center space-x-2">
        <span className="w-[40%] flex justify-end items-center ">DRP :</span>
        <select
          className="w-[58%] h-[90%] border-collapse border border-gray-400 px-2"
          name="ward"
          id="1"
        >
          <option value="1">พบและเกิดแล้ว</option>
          <option value="2">พบแต่เกิด</option>
          <option value="3">ยังไม่พบ</option>
          <option value="4">ไม่พบ</option>
        </select>
      </div>
      <div className="row-start-4 row-span-1 col-span-1 col-start-1 flex justify-start items-center space-x-2">
        <span className="w-[40%] flex justify-end items-center ">
          Date D/C :
        </span>
        <input
          type="date"
          className="w-[58%] h-[90%] border-collapse border border-gray-400 px-2"
        />
      </div>
      <div className="row-start-2 row-span-1 col-span-1 col-start-2 flex justify-start items-center space-x-2">
        <span className="w-[41%] flex justify-end items-center ">
          CriteriaOfCare :
        </span>
        <input
          type="text"
          className="w-[48%] h-[90%] border-collapse border border-gray-400 px-2"
        />
        <button className="w-[10%] h-[90%] bg-gray-700 rounded rotate-180 text-white">
          ^
        </button>
      </div>
      <div className="row-start-3 row-span-1 col-span-1 col-start-2 flex justify-start items-center space-x-2">
        <span className="w-[40%] flex justify-end items-center ">
          การจำหน่าย :
        </span>
        <select
          className="w-[58%] h-[90%] border-collapse border border-gray-400 px-2"
          name="ward"
          id="1"
        >
          <option value="1">เสียชีวิต</option>
          <option value="2">ไม่สมัครใจอยู่</option>
          <option value="3">จำหน่าย</option>
          <option value="4">นัดติดตาม</option>
          <option value="5">ส่งงานผู้ป่วยนอก</option>
          <option value="6">ส่งพบแพทย์</option>
          <option value="7">ย้ายหอผู้ป่วย</option>
          <option value="8">ส่งต่อ</option>
          <option value="9">หยุดใช้ยา</option>
          <option value="10">หยุดใช้ยา</option>
          <option value="11">เปลี่ยนยา</option>
          <option value="12">ไม่ระบุ</option>
        </select>
      </div>
      <div className="row-start-4 row-span-1 col-span-1 col-start-2 flex justify-start items-center space-x-2">
        <span className="w-[40%] flex justify-end items-center ">
          Date F/U :
        </span>
        <input
          type="date"
          className="w-[58%] h-[90%] border-collapse border border-gray-400 px-2"
        />
      </div>
      <div className="row-start-2 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-2">
        <span className="w-[41%] flex justify-end items-center ">
          GroupOfCare :
        </span>
        <input
          type="text"
          className="w-[48%] h-[90%] border-collapse border border-gray-400 px-2"
        />
        <button className="w-[10%] h-[90%] bg-gray-700 rounded rotate-180 text-white">
          ^
        </button>
      </div>
      <div className="row-start-3 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-2">
        <span className="w-[40%] flex justify-end items-center ">LOS :</span>
        <input
          type="text"
          className="w-[58%] h-[90%] border-collapse border border-gray-400 px-2"
        />
      </div>
      <div className="row-start-4 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-2">
        <span className="w-[41%] flex justify-end items-center ">
          Pharmacist :
        </span>
        <input
          type="text"
          className="w-[48%] h-[90%] border-collapse border border-gray-400 px-2"
        />
        <button className="w-[10%] h-[90%] bg-gray-700 rounded rotate-180 text-white">
          ^
        </button>
      </div>
      <div className="row-start-2 row-span-1 col-span-1 col-start-4 flex justify-start items-center space-x-2">
        <span className="w-[41%] flex justify-end items-center ">
          GroupOfPt :
        </span>
        <input
          type="text"
          className="w-[48%] h-[90%] border-collapse border border-gray-400 px-2"
        />
        <button className="w-[10%] h-[90%] bg-gray-700 rounded rotate-180 text-white">
          ^
        </button>
      </div>
      <div className="row-start-3 row-span-1 col-span-1 col-start-4 flex justify-start items-center space-x-2">
        <span className="w-[41%] flex justify-end items-center ">
          ClinicalOutcome :
        </span>
        <input
          type="text"
          className="w-[48%] h-[90%] border-collapse border border-gray-400 px-2"
        />
        <button className="w-[10%] h-[90%] bg-gray-700 rounded rotate-180 text-white">
          ^
        </button>
      </div>
      <div className="row-start-4 row-span-1 col-span-1 col-start-4 flex justify-start items-center space-x-2">
        <span className="w-[41%] flex justify-end items-center ">
          หน่วยงาน :
        </span>
        <input
          type="text"
          className="w-[48%] h-[90%] border-collapse border border-gray-400 px-2"
        />
        <button className="w-[10%] h-[90%] bg-gray-700 rounded rotate-180 text-white">
          ^
        </button>
      </div>
      <div className="row-start-5 row-span-2 col-span-4 col-start-1 flex justify-start items-center space-x-2">
        <span className="w-[10%] flex justify-end items-center ">
          Text105 :
        </span>
        <textarea className="w-[90%] h-[95%] border-collapse border border-gray-400 p-2"></textarea>
      </div>
    </div>
  );
}
