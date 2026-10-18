// FrmSubTreasury.jsx
import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import treasury from '../../../img/treasury.png';
import addDose from '../../../img/addDose.png';
import sendDose from '../../../img/sendDose.png';
import page from '../../../img/page.png';
import para from '../../../img/para.png';
import ReciveDose from './SubTreasury/ReciveDose';
import DonatedDose from './SubTreasury/DonatedDose';
import Inventory from './SubTreasury/Inventory';
import Dispense from './SubTreasury/Dispense';
import Narcotics from './SubTreasury/Narcotics';

export default function FrmSubTreasury() {
  const [selectedButton, setSelectedButton] = useState('recivedose');
  const navigate = useNavigate();

  useEffect(() => {
    navigate(selectedButton);
  }, [selectedButton, navigate]);

  return (
    <div className="w-full h-full p-1 text-sm">
      <div className="w-full h-[7%] flex items-center justify-start px-1 space-x-2">
        <ButtonWithMenu
          w={'36'}
          label={'รับเข้า'}
          icon={addDose}
          path={'recivedose'}
          isSelected={selectedButton === 'recivedose'}
          onClick={() => setSelectedButton('recivedose')}
        />
        <ButtonWithMenu
          w={'36'}
          label={'ยาบริจาค'}
          icon={sendDose}
          path={'donatedose'}
          isSelected={selectedButton === 'donatedose'}
          onClick={() => setSelectedButton('donatedose')}
        />
        <ButtonWithMenu
          w={'36'}
          label={'คงคลัง'}
          icon={treasury}
          path={'inventory'}
          isSelected={selectedButton === 'inventory'}
          onClick={() => setSelectedButton('inventory')}
        />
        <ButtonWithMenu
          w={'36'}
          label={'เบิกจ่าย'}
          icon={page}
          path={'dispense'}
          isSelected={selectedButton === 'dispense'}
          onClick={() => setSelectedButton('dispense')}
        />{' '}
        <ButtonWithMenu
          w={'[150px]'}
          label={'เบิกยาเสพติดและวัดถุออกฤทธิ์'}
          icon={para}
          path={'narcotics'}
          isSelected={selectedButton === 'narcotics'}
          onClick={() => setSelectedButton('narcotics')}
        />
      </div>
      <div className="w-full h-[93%] space-x-1 flex">
        <Routes>
          <Route path="recivedose" element={<ReciveDose />} />
          <Route path="donatedose" element={<DonatedDose />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="dispense/*" element={<Dispense />} />
          <Route path="narcotics" element={<Narcotics />} />
        </Routes>
      </div>
    </div>
  );
}

const ButtonWithMenu = ({ icon, label, path, isSelected, onClick, w }) => {
  const navigate = useNavigate();

  return (
    <button
      className={`w-${w} h-[90%] text-black font-bold bg-white border border-collapse border-black hover:bg-slate-100 active:bg-slate-300 flex items-center justify-center ${isSelected ? 'bg-pink-200' : ''}`}
      onClick={() => {
        if (path) navigate(path);
        onClick();
      }}
    >
      <img src={icon} alt={label} className="w-10 h-10" />
      <span className="text-[16px]">{label}</span>
    </button>
  );
};
