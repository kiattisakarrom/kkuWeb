// src/component/FrmMainlpd.jsx
import React, { useEffect, useState } from 'react';
import FrmDataTebleIPD from './FrmDataTableIpd';
import FrmDataTable2 from './FrmDataTable2';
import Screenning from './Screenning';
import IpdHeader from '../header/IpdHeader';
import Footer from '../header/Footer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function FrmMainIpd() {
  const [Data, setData] = useState([]);

  useEffect(() => {
    // ทำการร้องขอข้อมูลจากเซิร์ฟเวอร์ Fastify พร้อมกับส่ง API Key
    fetch('https://interface.kkh.go.th/v1/drug/adr/adr/search?search=', {
      headers: {
        'x-api-key': 'BVWPp60xrzavEXnyff0ZjG41h62kXeRt',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })

      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error(
          'There has been a problem with your fetch operation:',
          error
        );
      });
  }, []);
  return (
    <div className=" font-sans flex flex-col h-screen w-screen text-[12px] ">
      <header className="h-[5%]">
        <IpdHeader />
      </header>
      <main className=" flex bg-custom-or w-full h-[90%] font-bold">
        <Routes>
          <Route path="/" element={<FrmDataTebleIPD />} />
          <Route path="/mainIPD" element={<FrmProfile />} />
          <Route path="/popup" element={<PopUp />} />
          <Route path="/nurseStation/*" element={<FrmNurseStation />} />
          <Route path="/quickorder" element={<QuickOrder />} />
          <Route path="/DataDispenseDose/" element={<DataDispenseDose />} />
          <Route path="/subtreasury/*" element={<FrmSubTreasury />} />
          <Route path="/pharmcare" element={<FrmPharmcare />} />
          <Route path="/screening" element={<Screenning />} />
          <Route path="/returndose" element={<FrmReturnDose />} />
          <Route path="/medtranfer/*" element={<MadTranfer />} />
          <Route path="/setting/*" element={<FrmSetting />} />
        </Routes>
      </main>

      <div className="h-[5%] bg-blue-100 py-4 text-xs w-full relative  flex justify-between items-center bottom-0 left-0 border-y-2 border-white-300">
        <div className="container mx-auto  flex justify-between items-center">
          <Footer />
        </div>
      </div>
    </div>
  );
}

import FrmProfile from './Profile/FrmProfile';
import PopUp from './Profile/PopUp';
import FrmSubTreasury from './menucomponents/FrmSubTreasury';
import QuickOrder from './menucomponents/IPDRoom/QuickOrder';
import MadTranfer from './menucomponents/IPDRoom/MadTranfer/MadTranfer';
import DataDispenseDose from './menucomponents/DataDispenseDose/DataDispenseDose';
import FrmNurseStation from './menucomponents/FrmNurseStation';
import FrmReturnDose from './menucomponents/FrmReturnDose';
import FrmPharmcare from './menucomponents/FrmPharmcare';
import FrmSetting from './setting/FrmSetting';
