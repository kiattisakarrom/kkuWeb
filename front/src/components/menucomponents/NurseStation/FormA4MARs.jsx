import React, { useState } from 'react';
import chse from '../../../../img/addDose.png';
export default function FormA4MARs() {
  // สถานะสำหรับส่วนข้างบน
  const [selectedTop, setSelectedTop] = useState('Top 1');
  // สถานะสำหรับส่วนข้างล่าง
  const [selectedMid, setSelectedMid] = useState('Mid 1');
  // สถานะสำหรับส่วนข้างล่าง
  const [selectedBot, setSelectedBot] = useState('Bot 1');

  // จัดการการเปลี่ยนแปลงสำหรับส่วนข้างบน
  const handleChangeTop = (event) => {
    setSelectedTop(event.target.value);
  };

  // จัดการการเปลี่ยนแปลงสำหรับส่วนข้างล่าง
  const handleChangeMid = (event) => {
    setSelectedMid(event.target.value);
  };

  // จัดการการเปลี่ยนแปลงสำหรับส่วนข้างล่าง
  const handleChangeBot = (event) => {
    setSelectedBot(event.target.value);
  };

  return (
    <div className="w-[100%] h-[100%] flex justify-center space-x-2 bg-slate-50">
      <div className="w-[20%] h-[100%]  flex flex-col  items-start space-y-2">
        <div className="w-full h-[2%]  space-x-400"></div>
        <div className="w-full h-[15%] border border-collapse border-gray-400 space-x-3 space-y-3">
          <span className="text-right w-[40%]">แบบฟอร์มเปล่า </span>
          <label className="flex items-center">
            <input
              type="radio"
              name="Top"
              value="Top 1"
              checked={selectedTop === 'Top 1'}
              onChange={handleChangeTop}
              className="mr-2"
            />
            ไม่มี An
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="Top"
              value="Top 2"
              checked={selectedTop === 'Top 2'}
              onChange={handleChangeTop}
              className="mr-2"
            />
            มี An
          </label>
        </div>
        <div className="w-full h-[15%]  border border-collapse border-gray-400 space-x-3 space-y-3">
          <span className="text-right w-[40%]">รูปแบบยา</span>
          <label className="flex items-center">
            <input
              type="radio"
              name="Mid"
              value="Mid 1"
              checked={selectedMid === 'Mid 1'}
              onChange={handleChangeMid}
              className="mr-2"
            />
            ยารับประทานและยาใช้ภายนอก
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="Mid"
              value="Mid 2"
              checked={selectedMid === 'Mid 2'}
              onChange={handleChangeMid}
              className="mr-2"
            />
            ยาฉีด
          </label>
        </div>
        <div className="w-full h-[15%]  border border-collapse border-gray-400 space-x-3 space-y-3">
          <span className="text-right w-[40%]">ประเภทรายการยา</span>
          <label className="flex items-center">
            <input
              type="radio"
              name="Bot"
              value="Bot 1"
              checked={selectedBot === 'Bot 1'}
              onChange={handleChangeBot}
              className="mr-2"
            />
            Continue
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="Bot"
              value="Bot 2"
              checked={selectedBot === 'Bot 2'}
              onChange={handleChangeBot}
              className="mr-2"
            />
            Oneday
          </label>
        </div>
        <div className="w-[100%] h-[10%]  border-collapse border-gray-400 flex justify-center items-center">
          <div className="w-[30%] h-[100%] flex justify-center items-center">
            <ButtonWithClick colortxt="blue" label={'ค้นหา'} icon={chse} />
          </div>
        </div>
      </div>
      <div className="w-[80%] h-full border border-collapse border-gray-400"></div>
    </div>
  );
}

const ButtonWithClick = ({ colortxt, icon, label, sout }) => {
  return (
    <button
      className={` h-[80%] w-32 border border-collapse border-gray-400 rounded-lg bg-${colortxt}-400 hover:bg-gray-100 active:bg-white flex items-center justify-around `}
    >
      <img src={icon} alt={label} className="w-8 h-8" />
      <div className="h-full flex flex-col justify-center font-bold items-center">
        <span>{label}</span>
        <span>{sout}</span>
      </div>
    </button>
  );
};
