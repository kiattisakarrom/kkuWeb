import React, { useState, useEffect } from 'react';
import close from '../../../img/close.png';

import bookMedkitIcon from '../../../img/bookMedkit.png';
import medkitIcon from '../../../img/medkit.png';

import Modal from 'react-modal';
import ModalManageWard from './ManageWard/ModalManageWard';
Modal.setAppElement('#root');

export default function ManageWard() {
  const [modalManageWord, setModalManageWord] = useState(false); //ข้อมูลหอผู้ป่วย
  const [modalArdDose, setModalArdDose] = useState(false); //ข้อมูลห้องและหน่วยงาน

  const namePage = 'จัดการหอพักผู้ป่วย';
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-[5%] border-b-2 border-collapse border-gray-300 flex items-center px-3 text-lg">
        หน้าข้อมูลผู้ป่วย
      </div>
      <div className="w-[100%] bg-white flex flex-wrap p-2">
        <ButtonWithMenu
          icon={bookMedkitIcon}
          label={`ข้อมูลหอผู้ป่วย`}
          modal={() => setModalManageWord(true)}
        />
        <ButtonWithMenu
          icon={medkitIcon}
          label={`ข้อมูลห้องและหน่วยงาน`}
          modal={() => setModalArdDose(true)}
        />
      </div>

      <div className="w-[100%] h-[40%] bg-white flex flex-wrap space-x-1 p-2"></div>
      {/*ข้อมูลหอผู้ป่วย*/}
      <Modal
        isOpen={modalManageWord}
        onRequestClose={() => setModalManageWord(false)}
        className=" z-10 w-[80%] h-[80%] bg-white flex justify-center items-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center"
      >
        <div className="h-full w-full">
          <HeaderModal
            label={`ตั้งค่า >> ${namePage} >> ข้อมูลหอผู้ป่วย`}
            closePage={() => setModalManageWord(false)}
          />
          <div className="w-full h-[95%]">
            <ModalManageWard />
          </div>
        </div>
      </Modal>
      {/*ข้อมูลแพ้ยาผู้ป่วย*/}
      <Modal
        isOpen={modalArdDose}
        onRequestClose={() => setModalArdDose(false)}
        className=" z-10 w-[80%] h-[80%] bg-white flex justify-center items-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center"
      >
        <div className="h-full w-full">
          <HeaderModal
            label={`ตั้งค่า >> ${namePage} >> ข้อมูลห้องและหน่วยงาน`}
            closePage={() => setModalArdDose(false)}
          />
          <div className="w-full h-[95%]">{'fucntion'}</div>
        </div>
      </Modal>
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
const HeaderModal = ({ label, closePage }) => {
  return (
    <div className="w-full h-[7%] py-2 bg-gray-500 flex items-center justify-between px-5 ">
      <span className="text-lg text-white font-bold">{label}</span>
      <button
        className="w-[30px] h-[30px] hover:border-[3px] hover:border-gray-400"
        onClick={closePage}
      >
        <img src={close} alt="รูป" className="w-full h-full" />
      </button>
    </div>
  );
};
