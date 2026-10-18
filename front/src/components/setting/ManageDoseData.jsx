import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import pill from '../../../img/pills.png';
import bandageIcon from '../../../img/bandage.png';
import close from '../../../img/close.png';
import timeIcon from '../../../img/Time.png';
import frequencyIcon from '../../../img/frequency.png';
import cashIcon from '../../../img/cash.png';
import interactionIcon from '../../../img/interaction.png';
import drugIcon from '../../../img/drug.png';
import IPDRoomIcon from '../../../img/IPDRoom.png';
import medicineIcon from '../../../img/medicine.png';
import dosebindIcon from '../../../img/dosebind.png';
import medicineBindIcon from '../../../img/medicineBind.png';
import rightdoseIcon from '../../../img/rightdose.png';
import TMTIcon from '../../../img/TMT.png';
import ArdIcon from '../../../img/Ard.png';
import noteIcon from '../../../img/note.png';
import noteIcon1 from '../../../img/note1.png';
import noteIcon2 from '../../../img/note2.png';
import IVRoomIcon2 from '../../../img/IVRoom.png';
import locationIcon from '../../../img/Location.png';
import drugIcon2 from '../../../img/drug2.png';
import checkupIcon from '../../../img/checkup.png';
import waterIcon from '../../../img/water.png';
import treatment from '../../../img/treatment.png';
import sideeffect from '../../../img/sideeffect.png';
import effectgrade from '../../../img/effectgrade.png';
import appointment from '../../../img/appointment.png';
import createDose from '../../../img/createDose.png';
import createDoseG from '../../../img/createdose2.png';

import MainDoseData from './manageDoseData/MainDoseData';
import MainUseDoseData from './HowUseMed/MainUseDoseData';
import MainFrequensy from './Freqeuncy/MainFreqeuncy';
import { FaLessThan } from 'react-icons/fa6';
import MainTime from './Time/TimeDose';
import MainDrugPrice from './PriceDrug/MainDrugPrice';
import MainDrugInteraction from './DrugInteraction/MainDrugInteraction';
import MainDoseUnit from './DoseUnit/MainDoseUnit';
import MainOrderunit from './Orderunit/MainOrderunit';
import MainPharmocology from './Pharmocology/MainPharmocology';
import MainLinkHowUseDrug from './LinkUseDrug/MainLinkHowUseDrug';
import MainLinkHowUse from './LinkHowUse/MainLinkHowUse';
import MainLinkDontUse from './LinkDontUse/MainLinkDontUse';
import MainAllergyGroup from './Drugallergygroup/MainAllergygroup';
import MainTMT from './TMT/MainTMT';
// import MainDrugInteraction from './DrugInteraction/MainDrugInteraction';
import MainIndicationPTC from './IndicationPTC/MainIndicationPTC';
import MainApprovetypePTC from './ApprovetypePTC/MainApprovetypePTC';
import MainMapUnitdose from './MapUnitdose/MainMapUnitdose';

export default function ManageDoseData() {
  return (
    <div className="w-full h-full flex flex-col p-2">
      <Routes>
        <Route path="" element={<ShowButton />} />
        <Route path="MainDoseData/*" element={<MainDoseData />} />
        <Route path="MainUseDoseData/*" element={<MainUseDoseData />} />
        <Route path="MainFrequensy/*" element={<MainFrequensy />} />
        <Route path="MainTime/*" element={<MainTime />} />
        <Route path="MainDrugPrice/*" element={<MainDrugPrice />} />
        <Route path="MainDrugInteraction/*" element={<MainDrugInteraction />} />
        <Route path="MainDoseUnit/*" element={<MainDoseUnit />} />
        <Route path="MainOrderunit/*" element={<MainOrderunit />} />
        <Route path="MainPharmocology/*" element={<MainPharmocology />} />
        <Route path="MainLinkHowUseDrug/*" element={<MainLinkHowUseDrug />} />
        <Route path="MainLinkHowUse/*" element={<MainLinkHowUse />} />
        <Route path="MainLinkDontUse/*" element={<MainLinkDontUse />} />
        <Route path="MainAllergyGroup/*" element={<MainAllergyGroup />} />
        <Route path="MainTMT/*" element={<MainTMT />} />
        <Route path="MainIndicationPTC/*" element={<MainIndicationPTC />} />
        <Route path="MainApprovetypePTC/*" element={<MainApprovetypePTC />} />
        <Route path="MainMapUnitdose/*" element={<MainMapUnitdose />} />
      </Routes>
    </div>
  );
}

const ButtonWithMenu = ({ icon, label, modal }) => {
  return (
    <button
      className={`m-1 w-32 h-24 px-2 text-black font-bold space-y-2 bg-white border border-collapse border-black hover:bg-slate-200 active:bg-slate-300 flex flex-col items-center justify-start pt-5`}
      onClick={modal}
    >
      <img src={icon} alt={label} className="w-6 h-6" />
      <span>{label}</span>
    </button>
  );
};

const ShowButton = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="w-full h-[5%] border-b-2 border-collapse border-gray-300 flex items-center px-3 text-lg">
        หน้าข้อมูลยาหลัก
      </div>
      <div className="w-[100%] bg-white flex flex-wrap p-2">
        <ButtonWithMenu
          icon={pill}
          label={`ข้อมูลยาหลัก`}
          modal={() => navigate('MainDoseData')}
        />
        <ButtonWithMenu
          icon={bandageIcon}
          label={`วิธีใช้ยา`}
          modal={() => navigate('MainUseDoseData')}
        />
        <ButtonWithMenu
          icon={frequencyIcon}
          label={`ความถี่`}
          modal={() => navigate('MainFrequensy')}
        />
        <ButtonWithMenu
          icon={timeIcon}
          label={`เวลา`}
          modal={() => navigate('MainTime')}
        />
        <ButtonWithMenu
          icon={cashIcon}
          label={`ราคายา`}
          modal={() => navigate('MainDrugPrice')}
        />
        <ButtonWithMenu
          icon={interactionIcon}
          label={`Drug Interaction`}
          modal={() => navigate('MainDrugInteraction')}
        />
        <ButtonWithMenu
          icon={drugIcon}
          label={`หน่อยย่อย`}
          modal={() => navigate('MainDoseUnit')}
        />
        <ButtonWithMenu
          icon={IPDRoomIcon}
          label={`หน่วยขาย`}
          modal={() => navigate('MainOrderunit')}
        />
        <ButtonWithMenu
          icon={medicineIcon}
          label={`Pharmacology`}
          modal={() => navigate('MainPharmocology')}
        />
        <ButtonWithMenu
          icon={dosebindIcon}
          label={`ผูกวิธีใช้กับยา`}
          modal={() => navigate('MainLinkHowUseDrug')}
        />
        <ButtonWithMenu
          icon={medicineBindIcon}
          label={`ผูกวิธีใช้`}
          modal={() => navigate('MainLinkHowUse')}
        />
        <ButtonWithMenu
          icon={rightdoseIcon}
          label={`ผูกยากับสิทธิ์ห้ามใช้`}
          modal={() => navigate('MainLinkDontUse')}
        />
        <ButtonWithMenu
          icon={ArdIcon}
          label={`กลุ่มแพ้ยา`}
          modal={() => navigate('MainAllergyGroup')}
        />
        <ButtonWithMenu
          icon={TMTIcon}
          label={`TMT`}
          modal={() => navigate('MainTMT')}
        />
        <ButtonWithMenu
          icon={noteIcon}
          label={`ระเบียบ`}
          modal={() => navigate('Main')}
        />
        <ButtonWithMenu
          icon={noteIcon1}
          label={`Indication PTC`}
          modal={() => navigate('MainIndicationPTC')}
        />

        <ButtonWithMenu
          icon={noteIcon2}
          label={`ประเภทตามระเบียบ PTC`}
          modal={() => navigate('MainApprovetypePTC')}
        />
        <ButtonWithMenu
          icon={IVRoomIcon2}
          label={`Map รหัสยาโปรแกรมUnitdose`}
          modal={() => navigate('MainMapUnitdose')}
        />
        <ButtonWithMenu
          icon={locationIcon}
          label={`Location`}
          modal={() => navigate('ttt1')}
        />
        <ButtonWithMenu
          icon={drugIcon2}
          label={`Drug Protocal`}
          modal={() => navigate('ttt1')}
        />
      </div>
      <div className="w-full h-[5%] border-b-2 border-collapse border-gray-300 flex items-center px-3 text-lg">
        หน้าข้อมูลยาผลิต
      </div>
      <div className="w-[100%] bg-white flex flex-wrap p-2">
        <ButtonWithMenu
          icon={waterIcon}
          label={`ตัวทำละลาย`}
          modal={() => setModalMelt(true)}
        />
        <ButtonWithMenu
          icon={checkupIcon}
          label={`วินิจฉัยโรค`}
          modal={() => setModalDiagnose(true)}
        />
        <ButtonWithMenu
          icon={treatment}
          label={`Treatment Protocal`}
          modal={() => setModalTreatmentProtocal(true)}
        />
        <ButtonWithMenu
          icon={sideeffect}
          label={`Side Effect`}
          modal={() => setModalSideEffect(true)}
        />
        <ButtonWithMenu
          icon={effectgrade}
          label={`Side Effect Grade`}
          modal={() => setModalSideEffectGrade(true)}
        />
        <ButtonWithMenu
          icon={appointment}
          label={`สร้างบัตรนัด`}
          modal={() => setModalAppointmentCard(true)}
        />
        <ButtonWithMenu
          icon={createDose}
          label={`การผลิตยา`}
          modal={() => setModalCreateDose(true)}
        />
        <ButtonWithMenu
          icon={createDoseG}
          label={`การผลิตยาทั่วไป`}
          modal={() => setModalCreateDoseGeneral(true)}
        />
      </div>
    </div>
  );
};
