// import React, { useState } from 'react';

// export default function A4MARs() {
//   // สถานะสำหรับส่วนข้างบน
//   const [selectedOptionTop, setSelectedOptionTop] = useState('Option 1');
//   // สถานะสำหรับส่วนข้างล่าง
//   const [selectedOptionBottom, setSelectedOptionBottom] = useState('Select 1');

//   // จัดการการเปลี่ยนแปลงสำหรับส่วนข้างบน
//   const handleOptionChangeTop = (event) => {
//     setSelectedOptionTop(event.target.value);
//   };

//   // จัดการการเปลี่ยนแปลงสำหรับส่วนข้างล่าง
//   const handleOptionChangeBottom = (event) => {
//     setSelectedOptionBottom(event.target.value);
//   };

//   return (
//     <div className="w-full h-full">
//       <div className="grid grid-rows-3 grid-cols-5 w-full h-full">
//         <div className="row-start-1 row-span-3 col-start-1 col-span-1 bg-red-400">
//           <div className="grid grid-rows-12 grid-cols-3 w-full h-full">
//             <div className="row-start-1 row-span-1 bg-green-300">
//               <span className="text-right w-[40%]">ค้นหา : </span>
//             </div>
//             <div className="row-start-1 row-span-1 col-start-2 col-span-2">
//               <select
//                 className="w-[80%] h-[45%] border border-gray-400"
//                 name="ward"
//                 id="1"
//               >
//                 <option value="1">AN</option>
//                 <option value="2">HN</option>
//                 <option value="3">ห้องยา OPD อาคารรังสี</option>
//                 <option value="4">ห้องยา ER</option>
//                 <option value="5">ห้องยา D/C</option>
//               </select>
//               <input
//                 type="text"
//                 className="w-[80%] h-[45%] border border-gray-400"
//               />
//             </div>
//             <div className="row-start-2 row-span-2 col-start-1 col-span-3">
//               <span className="text-right w-[40%]">รูปแบบยา</span>
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="optionTop"
//                   value="Option 1"
//                   checked={selectedOptionTop === 'Option 1'}
//                   onChange={handleOptionChangeTop}
//                   className="mr-2"
//                 />
//                 ยารับประทานและยาใช้ภายนอก
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="optionTop"
//                   value="Option 2"
//                   checked={selectedOptionTop === 'Option 2'}
//                   onChange={handleOptionChangeTop}
//                   className="mr-2"
//                 />
//                 ยาฉีด
//               </label>
//             </div>
//             <div className="row-start-4 row-span-2 col-start-1 col-span-3 bg-yellow-200">
//               <span className="text-right w-[40%]">ประเภทรายการยา</span>
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="optionBottom"
//                   value="Select 1"
//                   checked={selectedOptionBottom === 'Select 1'}
//                   onChange={handleOptionChangeBottom}
//                   className="mr-2"
//                 />
//                 Continue
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="optionBottom"
//                   value="Select 2"
//                   checked={selectedOptionBottom === 'Select 2'}
//                   onChange={handleOptionChangeBottom}
//                   className="mr-2"
//                 />
//                 Oneday
//               </label>
//             </div>
//             <div className="row-start-6 row-span-1 col-start-1 col-span-3 bg-black">
//               <div className="row-start-6-1"></div>
//             </div>
//           </div>
//         </div>
//         <div className="row-start-1 row-span-3 col-start-2 col-span-4 bg-red-200"></div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import chse from '../../../../img/addDose.png';
export default function FormA4MARs() {
  // สถานะสำหรับส่วนข้างล่าง
  const [selectedMid, setSelectedMid] = useState('Mid 1');
  // สถานะสำหรับส่วนข้างล่าง
  const [selectedBot, setSelectedBot] = useState('Bot 1');

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
        <div className="w-full h-[5%]  space-x-400"></div>
        <div className="w-full h-[10%]  border border-collapse border-gray-400 space-y-1 flex justify-end ">
          <span className="text-right w-[40%]">ค้นหา : </span>
          <select
            className="w-[70%] h-[35%] border border-gray-400"
            name="ward"
            id="1"
          >
            <option value="1">AN</option>
            <option value="2">HN</option>
            <option value="3">ห้องยา OPD อาคารรังสี</option>
            <option value="4">ห้องยา ER</option>
            <option value="5">ห้องยา D/C</option>
          </select>
          {/* <span className="w-[40%]">fads.</span> */}
          <input
            type="text"
            className="w-[70%] h-[35%] border border-gray-400 flex justify-end"
          />
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
        <div className="w-[100%] h-[10%]  border-collapse border-gray-400 rounded-lg flex justify-center items-center">
          <div className="w-[30%] h-[100%]  flex justify-center items-center">
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
