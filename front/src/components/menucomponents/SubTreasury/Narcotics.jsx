import React from 'react';
import cancel from '../../../../img/cancel.png';
import add from '../../../../img/addDose.png';
import success from '../../../../img/success.png';
import print from '../../../../img/print.png';

export default function Narcotics() {
  return (
    <div className="w-full h-full  flex space-x-2 ">
      <div className="w-[20%] h-full border border-collapse border-gray-500 p-1">
        <div className="w-full h-[5%]  flex justify-start items-center space-x-3 px-3">
          <span className="text-sm font-bold">เลือกวันที่ : </span>
          <input
            type="date"
            className="h-[80%] w-[60%] border border-collapse border-gray-400"
          />
        </div>
        <div className="w-full h-[85%] ">
          <div className="w-full h-full px-2 bg-white border border-collapse border-gray-400 ">
            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className=" sticky top-0">
                  <th className="p-2 border-collapse border border-gray-200  text-center">
                    <span>ใบเบิก</span>
                  </th>
                  <th className="p-2 border-collapse border border-gray-200  text-center">
                    <span>หอผู้ป่วย</span>
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
        <div className="w-full h-[10%]  flex justify-between items-center px-2 ">
          <button className="h-[90%] w-[30%] border border-collapse border-gray-400 bg-yellow-200 hover:bg-yellow-400 active:bg-yellow-50 flex items-center justify-around">
            <img src={cancel} alt="cancel" className="w-8 h-8" />
            <div className="h-full flex flex-col justify-center font-bold items-center">
              <span>ยกเลิก</span>
              <span>[Del]</span>
            </div>
          </button>
          <div className="space-x-3 text-[16px]">
            <span className="text-red-500 font-bold">จำนวน</span>
            <span className="text-red-500 font-bold">{'0'}</span>
            <span className="text-red-500 font-bold">รายการ</span>
          </div>
        </div>
      </div>
      <div className="w-[80%] h-full  border border-gray-400 border-collapse p-1">
        <div className="w-full h-[5%]  flex justify-between">
          <div className="w-1/2 h-full flex justify-around font-bold items-center">
            <span>เลขที่ใบขอเบิก : {'-'}</span>
            <span>หอผู้ป่วย : {'-'}</span>
          </div>
          <div className="w-1/2 h-full text-red-500 font-bold space-x-2 text-[15px]  flex justify-end items-center pr-5">
            <span>จำนวน</span>
            <span>0</span>
            <span>รายการ</span>
          </div>
        </div>
        <div className="w-full h-[85%] bg-white">
          <div className="w-full h-full">
            <div className="w-full h-full overflow-auto">
              <table className="w-full bg-white rounded shadow">
                <thead>
                  <tr className="sticky top-0] h-1">
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                      HN
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                      AN
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[250px]">
                      ชื่อผู้ป่วย
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[120px]">
                      รหัสยา
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[250px]">
                      ชื่อยา
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[90px]">
                      จำนวน
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[90px]">
                      หน่วย
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[90px]">
                      ราคาทุน
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[90px]">
                      ราคาขาย
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[90px]">
                      ราคารวม
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[90px]">
                      ว.แพทย์
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[250px]">
                      ชื่อแพทย์
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[250px]">
                      ผู้บันทึกล่าสุด
                    </th>
                    <th className="p-2 text-center border-collapse border border-gray-200 min-w-[250px]">
                      วันที่บันทึกล่าสุด
                    </th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="w-full h-[10%] flex">
          <div className="w-[50%] h-full flex space-x-2 justify-start items-center">
            <ButtonWithClick
              colortxt="green"
              label={'สร้างใบเบิกใหม่'}
              sout={'[F5]'}
              icon={add}
            />
            <ButtonWithClick
              colortxt="gray"
              label={'เพิ่มใบเบิกเดิม'}
              sout={'[F7]'}
              icon={success}
            />
            <ButtonWithClick
              colortxt="red"
              label={'ยกเลิกรายการ'}
              sout={'[F6]'}
              icon={cancel}
            />
          </div>
          <div className="w-[50%] h-full flex justify-end items-center">
            <button
              className={` h-[90%] w-[10%] border border-collapse border-gray-400 bg-blue-100 hover:bg-gray-100 active:bg-white flex flex-col items-center justify-around `}
            >
              <img src={print} alt="print" className="w-8 h-8" />
              <div className="h-full flex flex-col justify-center font-bold items-center">
                <span>[Ctrl+P]</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ButtonWithClick = ({ colortxt, icon, label, sout }) => {
  return (
    <button
      className={` h-[90%] w-[25%] border border-collapse border-gray-400 bg-${colortxt}-400 hover:bg-gray-100 active:bg-white flex items-center justify-around `}
    >
      <img src={icon} alt={label} className="w-8 h-8" />
      <div className="h-full flex flex-col justify-center font-bold items-center">
        <span>{label}</span>
        <span>{sout}</span>
      </div>
    </button>
  );
};
