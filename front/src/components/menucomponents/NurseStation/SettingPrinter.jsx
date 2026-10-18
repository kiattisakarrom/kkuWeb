import React, { useState } from 'react';

export default function SettingPrinter() {
  const [selectedMid, setSelectedMid] = useState('Mid 1');

  const handleChangeMid = (event) => {
    setSelectedMid(event.target.value);
  };

  return (
    <div className="w-full h-full bg-slate-50 px-14 py-8  ">
      <div className="w-[40%] h-[30%] border border-collapse border-gray-400 p-4 bg-white rounded-lg">
        <span className="block text-[22px] mb-4 py-3">ประเภทของ Printer:</span>
        <div className="flex px-20 flex-col space-y-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="Mid"
              value="Mid 1"
              checked={selectedMid === 'Mid 1'}
              onChange={handleChangeMid}
              className="mr-2"
            />
            Printer แบบ Dot
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
            Printer แบบ Terminal
          </label>
        </div>
      </div>
    </div>
  );
}
