import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, Outlet } from 'react-router-dom';

import SaveDose from './Dispense/SaveDose';
import ChooseDose from './Dispense/ChooseDose';
import { Tabs, Tab } from './TadControlDispense';

export default function Dispense() {
  const navigate = useNavigate();
  const [selectedButton, setSelectedButton] = useState('choosedose');

  useEffect(() => {
    navigate(selectedButton);
  }, [selectedButton, navigate]);

  return (
    <div className="w-full h-full">
      <Tabs>
        <Tab label="เบิกจ่าย">
          <div className=" w-full h-full">
            <ChooseDose />
          </div>
        </Tab>
        <Tab label="เบิกจ่ายแล้ว">
          <div className=" w-full h-full">
            <SaveDose />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
