import React from 'react';
import chooseImg from '../../../img/icon4.png';
import SaveImg from '../../../img/icon3.png';
import img from '../../../img/exclamationmark.png';
export default function FrmReturnDose() {
  return (
    <div className="w-full h-full p-2">
      <div className="w-full h-[20%] grid grid-rows-4 grid-cols-5">
        <div className="row-start-1 row-span-2 col-start-1 col-span-1 border border-collapse border-gray-400  flex items-center m-[2px]"></div>
        <div className="row-start-1 rows-1 col-start-1 col-span-1 flex items-center px-2">
          <span>เลือกรูปแบบการคืน </span>
        </div>
        <div className="row-start-2 row-span-1 col-start-1 col-span-1 flex items-center w-full h-full">
          <form className="w-full flex justify-around items-center px-2">
            <div className="flex items-center space-x-2">
              <input type="radio" name="name" className="w-3 h-3" />
              <label>หอผู้ป่วย</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="radio" name="name" className="w-3 h-3" />
              <label>รายบุคคล</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="radio" name="name" className="w-3 h-3" />
              <label>ไม่ระบุหอผู้ป่วย</label>
            </div>
          </form>
        </div>

        <div className="row-start-3 row-span-2 col-start-1 col-span-1 border border-collapse border-gray-400  flex items-center m-[2px]"></div>
        <div className="row-start-3 row-span-1 col-start-1 col-span-1 flex items-center px-2">
          <span>เลือกหอผู้ป่วย</span>
        </div>
        <div className="row-start-4 row-span-1 col-start-1 col-span-1 flex justify-center items-center px-2">
          <select
            className="w-[90%] h-[70%] border border-collapse border-gray-500 "
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
        <div className="row-start-1 row-span-3 col-start-2 col-span-1  border border-collapse border-gray-400 flex items-center m-[2px]"></div>
        <div className="row-start-1 row-span-1 col-start-2 col-span-1 flex items-center px-2">
          <span>เลือกห้องยา</span>
        </div>
        <div className="row-start-2 row-span-2 col-start-2 col-span-1 flex justify-center items-center px-2">
          <select
            className="w-[90%] h-[50%] border border-collapse border-gray-500 "
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
        <div className="row-start-4 row-span-1 col-start-2 col-span-1 flex space-x-2 justify-start items-center px-2">
          <span>เลขที่ใบคืน :</span>
          <span>-</span>
        </div>
        <div className="row-start-1 row-span-2 col-start-3 col-span-1 flex space-x-2 justify-start items-center px-2">
          <button className="w-[50%] h-[80%] bg-red-300 border border-collapse border-gray-400 flex justify-center items-center space-x-3 hover:bg-red-500 active:bg-red-100">
            <img src={chooseImg} alt="รูป" className="w-7 h-7" />
            <div className="flex flex-col">
              <span>เลือกยา</span>
              <span>[F5]</span>
            </div>
          </button>
        </div>
        <div className="row-start-3 row-span-2 col-start-3 col-span-1 flex space-x-2 justify-start items-center px-2">
          <button className="w-[50%] h-[80%] bg-green-300 border border-collapse border-gray-400 flex justify-center items-center space-x-3 hover:bg-green-500 active:bg-green-100">
            <img src={SaveImg} alt="รูป" className="w-7 h-7" />
            <div className="flex flex-col">
              <span>บันทึก</span>
              <span>[ctrl+F5]</span>
            </div>
          </button>
        </div>
        <div className="row-start-3 row-span-2 col-start-5 col-span-1 flex space-x-2 justify-center items-center px-2 text-red-500 font-bold">
          <span>จำนวน</span>
          <span>{'0'}</span>
          <span>รายการ</span>
        </div>
      </div>
      <div className="w-full h-[80%] space-x-1 flex">
        <div className="w-[20%] h-full border border-collapse border-gray-400">
          <div className="w-full h-[10%] flex justify-center items-center space-x-2">
            {' '}
            <span>เลือกวันที่ : </span>
            <input
              type="date"
              className="w-[60%] h-[60%] border-collapse border border-gray-400 px-2"
            />
          </div>
          <div className="w-full h-[80%] bg-white">
            <div className="overflow-auto flex">
              <table className="w-full h-full bg-white">
                <thead>
                  <tr>
                    <th className="p-2 text-center border-collapse border border-gray-300 min-w-[150px]">
                      ใบเบิก
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-300 min-w-[120px]">
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
        <div className="w-[80%] h-full bg-white border border-collapse border-gray-400">
          <div className="w-full overflow-auto flex">
            <table>
              <thead>
                <tr>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[100px]">
                    รหัสยา
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[200px]">
                    ชื่อยา
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[100px]">
                    Lot No.
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[120px]">
                    วันหมดอายุ
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[80px]">
                    จำนวน
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[80px]">
                    หน่วย
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[120px]">
                    ราคาทุน
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[120px]">
                    ราคาขาย
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[120px]">
                    ราคารวม
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[120px]">
                    คิดเงิน
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[120px]">
                    ใช้ต่อ
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[120px]">
                    เหตุผลการคืน
                  </th>
                  <th className="p-2 text-center border-collapse border border-gray-300 min-w-[120px]">
                    เหตุผลการไม่ใช้ยา
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
