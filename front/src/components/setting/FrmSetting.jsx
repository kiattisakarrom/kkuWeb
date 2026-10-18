import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import settingImg from '../../../img/setting.png';
import pill from '../../../img/pills.png';
import dataPa from '../../../img/datapatein.png';
import hospitalicon from '../../../img/hospitalicon.png';
import doctorIcon from '../../../img/doctoricon.png';
import userIcon from '../../../img/user.png';
import idCartIcon from '../../../img/idCard.png';
import printicon from '../../../img/printericon.png';
import barcodeicon from '../../../img/barcode.png';

import ManageDoseData from './ManageDoseData';
import MainDoseData from './manageDoseData/MainDoseData';
import ManagePatientData from './ManagePatientData';
import ManageWard from './ManageWard';

import ManageMedicineBarcode from './ManageMedicineBarcode'; // เปลี่ยน path ให้ตรงกับไฟล์ของคุณ

export default function FrmSetting() {
  const [selectedButton, setSelectedButton] = useState('');
  const [namePage, setNamePage] = useState('จัดการข้อมูลยา');

  const navigate = useNavigate();

  return (
    <div className="w-full h-full space-y-1 px-2 py-3">
      <div className="h-[5%] w-[100%] border border-collapse border-gray-500 bg-white flex justify-start items-center px-3 space-x-3">
        <img src={settingImg} alt="รูป" className="w-8 h-8" />
        <span>
          ตั้งค่า {'>> '} {namePage}
        </span>
      </div>
      <div className="w-full h-[95%] flex space-x-2">
        <div className="h-full w-[10%] space-y-1 bg-white p-2 border border-collapse border-gray-500">
          <ButtonWithMenu
            icon={pill}
            label="จัดการข้อมูลยา"
            path="manage-dose-data"
            isSelected={selectedButton === 'manage-dose-data'}
            onClick={() => {
              setSelectedButton('manage-dose-data');
              setNamePage('จัดการข้อมูลยา');
            }}
          />
          <ButtonWithMenu
            icon={dataPa}
            label="จัดการข้อมูลผู้ป่วย"
            path="manage-patient-data"
            isSelected={selectedButton === 'manage-patient-data'}
            onClick={() => {
              setSelectedButton('manage-patient-data');
              setNamePage('จัดการข้อมูลผู้ป่วย');
            }}
          />
          <ButtonWithMenu
            icon={hospitalicon}
            label="จัดการหอผู้ป่วย"
            path="manage-ward"
            isSelected={selectedButton === 'manage-ward'}
            onClick={() => {
              setSelectedButton('manage-ward');
              setNamePage('จัดการหอผู้ป่วย');
            }}
          />
          <ButtonWithMenu
            icon={doctorIcon}
            label="จัดการแพทย์"
            path="manage-doctor"
            isSelected={selectedButton === 'manage-doctor'}
            onClick={() => {
              setSelectedButton('manage-doctor');
              setNamePage('จัดการแพทย์');
            }}
          />
          <ButtonWithMenu
            icon={userIcon}
            label="จัดการข้อมูลผู้ใช้"
            path="manage-user-data"
            isSelected={selectedButton === 'manage-user-data'}
            onClick={() => {
              setSelectedButton('manage-user-data');
              setNamePage('จัดการข้อมูลผู้ใช้');
            }}
          />
          <ButtonWithMenu
            icon={idCartIcon}
            label="สิทธิ์การรักษา"
            path="manage-treatment-rights"
            isSelected={selectedButton === 'manage-treatment-rights'}
            onClick={() => {
              setSelectedButton('manage-treatment-rights');
              setNamePage('สิทธิ์การรักษา');
            }}
          />
          <ButtonWithMenu
            icon={printicon}
            label="ตั้งค่าการพิมพ์"
            path="printing-settings"
            isSelected={selectedButton === 'printing-settings'}
            onClick={() => {
              setSelectedButton('printing-settings');
              setNamePage('ตั้งค่าการพิมพ์');
            }}
          />
          <ButtonWithMenu
            icon={barcodeicon}
            label="บาร์โค๊ดยา"
            path="medicine-barcode"
            isSelected={selectedButton === 'medicine-barcode'}
            onClick={() => {
              setSelectedButton('medicine-barcode');
              setNamePage('บาร์โค๊ดยา');
            }}
          />
        </div>
        <div className="w-full h-full bg-white border border-collapse border-gray-500">
          <Routes>
            <Route path="manage-dose-data/*" element={<ManageDoseData />} />
            <Route path="manage-patient-data" element={<ManagePatientData />} />
            <Route path="manage-ward" element={<ManageWard />} />
            <Route
              path="medicine-barcode"
              element={<ManageMedicineBarcode />}
            />
            <Route path="me" element={<MainDoseData />} />
            {/* เพิ่มบรรทัดนี้ */}
          </Routes>
        </div>
      </div>
    </div>
  );
}

const ButtonWithMenu = ({ icon, label, path, isSelected, onClick }) => {
  const navigate = useNavigate();

  return (
    <button
      className={`h-[10%] w-full text-black font-bold bg-white border border-collapse border-black hover:bg-slate-200 active:bg-slate-300 flex flex-col items-center justify-center ${
        isSelected
          ? 'bg-sky-200 hover:bg-sky-100 border-2 border-collapse border-gray-950'
          : ''
      }`}
      onClick={() => {
        if (path) navigate(path);
        onClick();
      }}
    >
      <img src={icon} alt={label} className="w-6 h-6" />
      <span>{label}</span>
    </button>
  );
};
