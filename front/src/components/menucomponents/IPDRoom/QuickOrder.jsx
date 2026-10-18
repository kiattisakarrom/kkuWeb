import React from 'react';
import icon1 from '../../../../img/in.png';
import print from '../../../../img/printer.png';
import doc from '../../../../img/editDoc.png';
export default function QuickOrder() {
  return (
    <div className="w-full h-full p-1 flex border-collapse border-2 border-gray-300 space-x-1">
      <div className="w-[25%] h-full ">
        <div className="w-full h-[15%] p-1 grid grid-rows-5 grid-cols-1">
          {/*ซ้ายบน*/}
          <div className="flex items-center row-start-1 row-span-3 col-start-1 col-span-1 space-x-1 ">
            <Button label={'จัดยา'} sout={'[L+Rx]'} icon={icon1} />
            <Button label={'พิมพ์สติ๊กเกอร์'} sout={'[L]'} icon={print} />
            <Button label={'พิมพ์ใบสั่งยา'} sout={'[Rx]'} icon={doc} />
          </div>
          <div className="row-start-4 row-span-2 col-start-1 col-span-1  flex items-center space-x-[1px]">
            <div className="h-full w-[20%] flex justify-end items-center">
              <span>{'เลือกห้อง :'}</span>
            </div>
            <div className="h-full w-[40%] flex justify-center items-center">
              <select
                className="w-[90%] h-[70%] border border-collapse border-gray-400 "
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
            <div className="h-full w-[40%] flex justify-center items-center">
              <input
                type="date"
                className="w-[90%] h-[70%] border border-collapse border-gray-400 px-2"
              />
            </div>
          </div>
        </div>
        <div className="w-full h-[85%]">
          {/*ซ้ายล่าง*/}
          <div className="h-[95%] overflow-auto border border-collapse border-gray-500 bg-white">
            <table className="min-w-full border-collapse border border-gray-400">
              <thead className="stick top-0 bg-white">
                <tr>
                  <th className="border border-gray-300 p-2 text-xs">
                    <input type="checkbox" />
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[150px]">
                    หอผู้ป่วย
                  </th>
                  <th className="border border-gray-300 p-2 text-xs">จำนวน</th>
                </tr>
              </thead>
              <tbody className=" bg-white text-center"></tbody>
            </table>
          </div>
          <div className="w-full h-[5%] bg-black space-x-2 flex items-center px-1">
            <span className="text-white font-bold">จำนวน</span>
            <span className="text-white font-bold">{'0'}</span>
            <span className="text-white font-bold">รายการ</span>
          </div>
        </div>
      </div>
      <div className="w-[60%] h-full ">
        <div className="w-full h-[15%]  grid grid-rows-5 grid-cols-1">
          {' '}
          {/*กลางบน */}
          <div className="row-start-4 row-span-2 flex items-center px-2 space-x-1">
            <div className="flex items-center space-x-3 border border-collapse bg-white border-gray-500 h-[90%] px-2">
              <span>Order Type :</span>
              <form action="" className="flex space-x-4">
                <div className="space-x-1">
                  <input type="radio" name="Order" />
                  <label>ทั้งหมด</label>
                </div>
                <div className="space-x-1">
                  <input type="radio" name="Order" />
                  <label>0</label>
                </div>
                <div className="space-x-1">
                  <input type="radio" name="Order" />
                  <label>3</label>
                </div>
                <div className="space-x-1">
                  <input type="radio" name="Order" />
                  <label>stat</label>
                </div>
              </form>
            </div>
            <div className="flex items-center space-x-3 border border-collapse bg-white border-gray-500 h-[90%] px-2">
              <span>ส่งจัดยา :</span>
              <form action="" className="flex space-x-4">
                <div className="space-x-1">
                  <input type="radio" name="Order" />
                  <label>ทั้งหมด</label>
                </div>
                <div className="space-x-1">
                  <input type="radio" name="Order" />
                  <label>ยังไม่จ่าย</label>
                </div>
                <div className="space-x-1">
                  <input type="radio" name="Order" />
                  <label>จ่ายแล้ว</label>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="w-full h-[85%] ">
          {' '}
          {/*กลางล่าง */}
          <div className="h-[95%] overflow-auto border border-collapse border-gray-500 bg-white">
            <table className="border-collapse border border-gray-400">
              <thead className="stick top-0 bg-white">
                <tr>
                  <th className="border border-gray-300 p-2 text-xs">
                    <input type="checkbox" />
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[150px]">
                    ใบสั่งยา
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[150px]">
                    วันที่
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[80px]">
                    ประเภท
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[120px]">
                    HN
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[120px]">
                    AN
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[220px]">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[150px]">
                    หอผู้ป่วย
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[120px]">
                    สถานะใบสั่งยา
                  </th>
                </tr>
              </thead>
              <tbody className=" bg-white text-center"></tbody>
            </table>
          </div>
          <div className="w-full h-[5%] bg-black space-x-2 flex items-center px-1">
            <span className="text-white font-bold">จำนวน</span>
            <span className="text-white font-bold">{'0'}</span>
            <span className="text-white font-bold">รายการ</span>
          </div>
        </div>
      </div>
      <div className="w-[15%] h-full">
        {/*ขวา*/}
        <div className="w-full h-[15%]  grid grid-rows-5 grid-cols-1 p-1">
          <div className="row-start-4 row-span-2 ">
            <ButtonRight label={'จัดยา'} sout={'[L+Rx]'} icon={icon1} />
          </div>
        </div>
        <div className="w-full h-[85%]  ">
          <div className="h-[95%] overflow-auto border border-collapse bg-white border-gray-500">
            <table className="min-w-full border-collapse border border-gray-400">
              <thead className="stick top-0 bg-white">
                <tr>
                  <th className="border border-gray-300 p-2 text-xs min-w-[150px]">
                    เลขที่ใบสั่งยา
                  </th>
                  <th className="border border-gray-300 p-2 text-xs">ลบ</th>
                </tr>
              </thead>
              <tbody className=" bg-white text-center"></tbody>
            </table>
          </div>
          <div className="w-full h-[5%] bg-black space-x-2 flex items-center px-1">
            <span className="text-white font-bold">จำนวน</span>
            <span className="text-white font-bold">{'0'}</span>
            <span className="text-white font-bold">รายการ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const Button = ({ label, sout, icon }) => {
  return (
    <button className="w-[30%] h-[80%] bg-white border-collapse border border-gray-500 flex justify-around items-center hover:bg-gray-300 active:bg-white ">
      <img src={icon} alt={label} className="w-6 h-6" />
      <div className="flex flex-col">
        <span>{label}</span>
        <span>{sout}</span>
      </div>
    </button>
  );
};
const ButtonRight = ({ label, sout, icon }) => {
  return (
    <button className="w-[50%] h-full bg-white border-collapse border border-gray-500 flex justify-around items-center hover:bg-gray-300 active:bg-white ">
      <img src={icon} alt={label} className="w-6 h-6" />
      <div className="flex flex-col">
        <span>{label}</span>
        <span>{sout}</span>
      </div>
    </button>
  );
};
