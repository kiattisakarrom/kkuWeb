import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import addDoc from '../../img/addDoc.png';
import close from '../../img/close.png';
import editDoc from '../../img/editDoc.png';
import homeIcon from '../../img/homeIcon.png';
import hospitalicon from '../../img/hospitalicon.png';
import patientIcon from '../../img/patientIcon.png';
import searchIcon from '../../img/searchIcon.png';
import Footer from '../header/Footer';
import IpdHeader from '../header/IpdHeader';
import FrmDataTable from './FrmDataTable';
import porson from '../../img/lab.png';
import scalesIcon from '../../img/scales.png';
import successIcon from '../../img/success.png';
import cancelIcon from '../../img/cancel.png';
import { HomeIcon } from '@heroicons/react/16/solid';

import axios from 'axios'; // ใช้ axios สำหรับเรียก API
import { API_SCREEN } from '../../config';

Modal.setAppElement('#root');

export default function FrmDataTebleIPD(isOpen, onClose, onConfirm) {
  const today = new Date();
  const formattedToday = `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}-${('0' + today.getDate()).slice(-2)}`;
  const [currentDate, setCurrentDate] = useState(formattedToday);

  const [modalCreate, setIsCreate] = useState(false);
  const [modalMoveDorm, setModalMoveDorm] = useState(false);
  const [modalGoHome, setModalGoHome] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState('all'); // ✅ เพิ่มตรงนี้

  useEffect(() => {
    const today = new Date();
    const formattedDate = formatDateToISO(today); ///ใช่ตัวแปล formattedDate
    console.log(formattedDate);
    setCurrentDate(formattedDate);
  }, []);

  const formatDateToISO = (date) => {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // yyyy-mm-dd
  };
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const formattedDate = formatDateToISO(selectedDate);
    setCurrentDate(formattedDate);
  };
  const idH = 2;
  const nameH = 'เด็ก 3 ';
  const wards = [
    { name: 'เด็ก 3', count: 23 },
    { name: 'เด็ก 1', count: 18 },
    { name: 'ศัลยกรรมหญิง 1', count: 31 },
    { name: 'NEURO SURGE', count: 23 },
    { name: 'TRAUMA', count: 37 },
    { name: 'URO1', count: 18 },
    { name: 'กระดูกชาย1', count: 28 },
    { name: 'กระดูกชาย2', count: 35 },
    { name: 'กระดูกหญิง', count: 53 },
    { name: 'Stroke unit', count: 19 },
    { name: 'อายุรกรรมหญิง 1', count: 66 },
    { name: 'จักษุ', count: 27 },
    { name: 'ENT', count: 14 },
  ];
  const handleKeyPress = (event) => {
    if (event.key === 'F5') {
      event.preventDefault(); // ป้องกันการรีเฟรชหน้า
      createBill(); // เรียกฟังก์ชัน createBill
    }
  };
  const createBill = () => {
    setIsCreate(true);
  };
  const CloseModal = () => {
    setIsCreate(false);
  };
  // const [selectedStatus, setSelectedStatus] = useState('admit');

  const handleRadioAdmit = (event) => {
    setSelectedStatus(event.target.value);
  };

  const [patientData, setPatientData] = useState(null); // ใช้สำหรับเก็บข้อมูลจาก backend

  const [patientType, setPatientType] = useState('IPD'); // ค่าเริ่มต้น IPD
  const [searchType, setSearchType] = useState('AN'); // ค่าเริ่มต้น AN
  const [text, setText] = useState(''); // ค่าที่ใช้ค้นหา
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!text.trim()) {
      setError('กรุณากรอกค่าค้นหา');
      return;
    }

    try {
      setError('');

      const requestData = {
        patientType,
        type: searchType,
        text: text.trim(),
      };

      console.log('🚀 [Frontend] กำลังส่งค่าไปยัง Backend:', requestData);

      const response = await axios.post(
        API_SCREEN + '/btnsearch',
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      console.log('✅ [Frontend] ได้รับข้อมูลจาก API:', response.data);

      if (response.data.results.length > 0) {
        setData(response.data.results[0]);
      } else {
        setData(null);
        setError('ไม่พบข้อมูล');
      }
    } catch (err) {
      console.error('❌ [Frontend] API Error:', err);
      setError('ไม่พบข้อมูล หรือเกิดข้อผิดพลาด');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className="h-full w-screen">
      <div className="้h-1/6">
        <div className="flex h-2/4 justify-between items-center my-1 ">
          <div className="space-x-2  ml-4 w-full flex ">
            <ButtonWithIcon
              icon={addDoc}
              label="สร้างใบยาใหม่"
              func={createBill}
            />
            <ButtonWithIcon icon={editDoc} label="สร้างใบยาเพิ่มเติม" />
            <ButtonWithIcon icon={homeIcon} label="สร้างใบยากลับบ้าน" />
            <ButtonWithIcon
              icon={patientIcon}
              label="ผู้ป่วย Admit ใหม่"
              func={createBill}
            />
            <ButtonWithIcon
              icon={hospitalicon}
              label="ย้ายหอผู้ป่วย"
              func={() => {
                setModalMoveDorm(true);
              }}
            />
            <ButtonWithIcon
              icon={homeIcon}
              label="ผู้ป่วยกลับบ้าน"
              func={() => {
                setModalGoHome(true);
              }}
            />
          </div>
        </div>
        <div className="flex items-center mb-2 bg-custom-r2 p-1 border-2 border-blue-300 text-sm h-10 ">
          {/* djjj */}
          <input
            type="text"
            placeholder="ค้นหา"
            className="border border-gray-300 rounded p-2 w-1/4"
          />
          <button className="bg-blue-700 text-white p-1 rounded mr-10 ml-4 hover:bg-blue-900 active:bg-blue-400 text-sm flex justify-center items-center">
            <img src={searchIcon} alt="ภาพ" className="w-4 h-4 mr-1" />
            ค้นหา
          </button>
          {/* Date */}
          <input
            type="date"
            className="border border-gray-300 rounded p-1 w-1/4 mr-6"
            value={currentDate.split('/').reverse().join('-')}
            onChange={handleDateChange}
          />
          <form className="flex space-x-4 mr-7">
            <div>
              <input
                type="radio"
                name="patientStatus"
                value="all"
                checked={selectedStatus === 'all'}
                onChange={handleRadioAdmit}
              />
              <label className="ml-2">แสดงทั้งหมด</label>
            </div>
            <div>
              <input
                type="radio"
                name="patientStatus"
                value="admit"
                checked={selectedStatus === 'admit'}
                onChange={handleRadioAdmit}
              />
              <label className="ml-2">ผู้ป่วย Admit</label>
            </div>
            <div>
              <input
                type="radio"
                name="patientStatus"
                value="discharged"
                checked={selectedStatus === 'discharged'}
                onChange={handleRadioAdmit}
              />
              <label className="ml-2">ผู้ป่วย Discharged</label>
            </div>
          </form>
          <button className="bg-red-500 text-white p-1 rounded hover:bg-red-700 active:bg-red-300 text-sm">
            Discharge
          </button>
        </div>
      </div>
      <div className="w-full h-5/6 ">
        <FrmDataTable ptstatus={selectedStatus} orderdate={currentDate} />
      </div>
      <Modal
        isOpen={modalCreate}
        onRequestClose={onClose}
        className=" z-10 w-[750px] h-[550px] flex justify-center items-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center"
      >
        <div className="grid grid-rows-12 bg-white grid-cols-1 w-full h-full ">
          <div className="row-span-1 px-2 bg-gray-400">
            <div className="flex items-center justify-between h-full w-full">
              <div className="flex items-center justify-center">
                <img src={addDoc} alt="add" className="w-6 h-6" />
                <p className="text-white font-bold">สร้างใบยาใหม่</p>
              </div>
              <img
                src={close}
                alt="close"
                className="cursor-pointer w-6 h-6 hover:border-4 hover:border-gray-200 active:border-gray-400"
                onClick={CloseModal}
              />
            </div>
          </div>
          <div className="row-span-1 px-5">
            <div className="text-green-600 text-sm flex justify-around px-16 ">
              <p>0 = ใบสั่งยาผู้ป่วยใน </p>
              <p>1 = ใบสั่งยาผู้ป่วยกลับบ้าน </p>
              <p>3 = ใบสั่งยาผู้ป่วยเพิ่มเติม </p>
            </div>{' '}
            <div className="flex gap-3 text-sm p-1 justify-center">
              <p>ชนิดใบสั่งยา: </p>
              <input
                type="text"
                className="w-16 border-2 h-5 border-gray-400 "
              />
              <input type="text" className="border-2 h-5 border-gray-400" />
              <input type="checkbox" name="" id="" />
              <p>offine</p>
            </div>
          </div>
          <div className="row-span-1     ">
            <div className="flex h-full w-full gap-1 justify-center items-center">
              {/* <select
                name="room"
                id="room"
                className="border-2 h-6 w-16 border-gray-400"
              >
                <option value="IPD">IPD</option>
                <option value="OPD">OPD</option>
              </select>
              <select
                name="room"
                id="room"
                className="border-2 h-6 w-32 border-gray-400"
              >
                <option value="AN">AN</option>
                <option value="HN">HN</option>
                <option value="1">ชื่อ</option>
                <option value="1">นามสกุล</option>
                <option value="1">เลขที่ประชาชน</option>
              </select>
              <input
                type="text"
                value={AN}
                onChange={(e) => setAn(e.target.value)}
                placeholder="กรอก AN"
              /> */}
              <select
                className="border-2 h-8 w-20 border-gray-400"
                value={patientType}
                onChange={(e) => setPatientType(e.target.value)}
              >
                <option value="IPD">IPD</option>
                <option value="OPD">OPD</option>
              </select>

              {/* เลือกประเภทค้นหา */}
              <select
                className="border-2 h-8 w-32 border-gray-400"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="AN">AN</option>
                <option value="HN">HN</option>
                <option value="ชื่อ">ชื่อ</option>
                <option value="นามสกุล">นามสกุล</option>
                <option value="เลขบัตรประชาชน">เลขบัตรประชาชน</option>
              </select>

              {/* กรอกค่าค้นหา */}
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="กรอกค่าค้นหา"
                className="border-2 h-8 px-2 border-gray-400"
              />
              <button
                className="w-24 h-7 text-white font-bold bg-gray-400 flex gap-2 justify-center items-center rounded-sm hover:bg-gray-600 active:bg-slate-500"
                onClick={handleSearch} // ฟังก์ชันค้นหาถูกเรียกเมื่อกดปุ่ม
              >
                <img src={searchIcon} alt="ค้นหา" className="w-5 h-5" />
                <span>ค้นหา</span>
              </button>
            </div>
          </div>
          <div className="row-span-8 flex">
            <div className="w-3/5 h-full  flex">
              <div className="h-full w-full ">
                <div className="flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">HN:</div>
                  <input
                    type="text"
                    className="w-[35%] border border-collapse border-gray-700 cursor-default"
                    value={data?.hn || ''} // แก้ให้หน่อยแสดงข้อมูลจากแบคเอน
                    readOnly
                  />
                  <div className="w-[12%] flex justify-center ">AN:</div>
                  <input
                    type="text"
                    className="w-[30%] border border-collapse border-gray-700 cursor-default"
                    value={data ? data.an : ''} // แก้ให้หน่อยแสดงข้อมูลจากแบคเอน
                    readOnly
                  />
                </div>
                <div className=" flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">
                    ชื่อ-นามสกุล:
                  </div>
                  <input
                    type="text"
                    className="w-[77%] border border-collapse border-gray-700 cursor-default"
                    value={
                      data
                        ? `${data?.title} ${data?.name} ${data?.surname}`
                        : ''
                    }
                    readOnly
                  />
                </div>

                <div className=" flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">
                    หอผู้ป่วย:
                  </div>
                  <input
                    type="text"
                    className="w-[77%] border border-collapse border-gray-700 cursor-default"
                    value={data?.ward_name || ''}
                    readOnly
                  />
                </div>
                <div className="flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">ห้อง:</div>
                  <input
                    type="text"
                    className="w-[35%]  border border-collapse border-gray-700 cursor-default"
                    readOnly
                  />
                  <div className="w-[12%] flex justify-center ">เตียง:</div>
                  <input
                    type="text"
                    className="w-[30%]  border border-collapse border-gray-700 cursor-default"
                    readOnly
                  />
                </div>
                <div className=" flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">แพทย์:</div>
                  <input
                    type="text"
                    className="w-[77%] border border-collapse border-gray-700 cursor-default"
                    value={data?.dr_name || ''}
                    readOnly
                  />
                </div>
                <div className=" flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">วันเกิด:</div>
                  <input
                    type="text"
                    className="w-[35%] border border-collapse border-gray-700 cursor-default"
                    value={data?.birth || ''}
                    readOnly
                  />
                </div>
                <div className=" flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">อายุ:</div>
                  <input
                    type="text"
                    className="w-[35%] border border-collapse border-gray-700 cursor-default"
                    readOnly
                  />
                  <div className="w-[42%] flex">
                    <div className="w-[35%] flex justify-end mr-2">
                      น้ำหนัก:
                    </div>
                    <input
                      type="text"
                      className="w-[45%] border border-collapse border-gray-700 cursor-default text-center text-red-600"
                      value="0"
                      readOnly
                    />
                    <div className="w-[15%] flex ml-2">kg.</div>
                  </div>
                </div>
                <div className=" flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">เพศ:</div>
                  <input
                    type="text"
                    className="w-[35%] border border-collapse border-gray-700 cursor-default"
                    value={data?.sex || ''}
                    readOnly
                  />
                  <div className="w-[42%] flex">
                    <div className="w-[35%] flex justify-end mr-2">
                      ส่วนสูง:
                    </div>
                    <input
                      type="text"
                      className="w-[45%] border border-collapse border-gray-700 cursor-default text-center text-red-600"
                      value="0"
                      readOnly
                    />
                    <div className="w-[15%] flex ml-2">cm.</div>
                  </div>
                </div>
                <div className=" flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">
                    สิทธิ์ผู้ป่วย:
                  </div>
                  <input
                    type="text"
                    className="w-[77%] border border-collapse border-gray-700 cursor-default"
                    value={data?.pttype_name || ''}
                    readOnly
                  />
                </div>
                <div className=" flex w-full">
                  <div className="w-[23%] flex justify-end mr-2">
                    ประวัติแพ้ยา:
                  </div>
                  <textarea
                    type="text"
                    className="w-[77%] h-[120px] border border-collapse border-gray-700 cursor-default"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="w-2/5   grid grid-cols-4 grid-rows-8">
              <div className="h-full col-start-1 col-span-5 row-start-1 row-span-1 ">
                <div className="flex justify-around items-center">
                  Admit Date:
                  <input
                    type="text"
                    className="w-[60%] border border-collapse border-gray-700 cursor-default"
                    value={patientData ? patientData.ward_name : ''}
                    readOnly
                  />
                </div>
              </div>
              <div className="h-full row-start-2 row-span-5 col-start-1 col-span-1">
                <div className="h-full w-full grid grid-cols-1 grid-rows-3">
                  <div className=" w-full p-2 ">
                    <ButtonWithModal icon={hospitalicon} label="เลือก" />
                  </div>
                  <div className="w-full p-2">
                    <ButtonWithModal icon={porson} label="เลือก" />
                  </div>
                  <div className="w-full p-2">
                    <ButtonWithModal icon={scalesIcon} label="เลือก" />
                  </div>
                </div>
              </div>
              <div className="p-3 h-full row-start-2 row-span-5 col-start-2 col-span-5">
                <div className="w-full h-full border border-collapse border-gray-500"></div>
              </div>
              <div className="h-full col-start-1 col-span-5 row-start-7 row-span-8 pl-5 grid grid-rows-3 grid-cols-1">
                <div className=" flex ml-24 items-center">
                  <input type="checkbox" className="mr-2" />
                  <label> D/C</label>
                </div>
                <div className=" flex justify-around">
                  สถานะ D/C:{' '}
                  <input
                    type="text"
                    className="w-[60%]  border border-collapse border-gray-700 cursor-default"
                    readOnly
                  />
                </div>
                <div className=" flex justify-around items-center">
                  สถานะ :
                  <div className="w-[70%] h-full border-collapse border bg-red-400 flex justify-center items-center cursor-pointer hover:bg-red-600 hover:text-white active:bg-red-950 ">
                    <img
                      src={homeIcon}
                      alt="Discharge"
                      className="w-6 h-6 mr-3"
                    />
                    Discharge
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row-span-1 py-1 flex px-10">
            <div className="flex h-full w-[50%]">
              <div className=" h-full w-32 border border-collapse border-gray-600 bg-white p-1 cursor-pointer flex justify-center items-center hover:bg-green-600 hover:text-white active:bg-green-800 mr-3">
                <img
                  src={successIcon}
                  alt="Discharge"
                  className="w-6 h-6 mr-3"
                />
                ยืนยันเหก
              </div>
              <div className=" h-full w-32 border border-collapse border-gray-600 bg-white p-1 cursor-pointer flex justify-center items-center hover:bg-red-600 hover:text-white active:bg-red-800">
                <img
                  src={cancelIcon}
                  alt="Discharge"
                  className="w-6 h-6 mr-3"
                />
                ยกเลิก
              </div>
            </div>
            <div className=" w-[50%] flex items-center justify-end">
              <div className=" h-full w-32 border border-collapse border-gray-600 bg-white p-1 cursor-pointer flex justify-center items-center hover:bg-red-600 hover:text-white active:bg-red-800 ">
                <img
                  src={cancelIcon}
                  alt="Discharge"
                  className="w-6 h-6 mr-3"
                />
                Discharge
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={modalMoveDorm}
        onRequestClose={onClose}
        className=" z-10 w-[750px] h-[550px] flex justify-center items-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center"
      >
        <div className=" bg-white grid-cols-1 w-full h-full flex-col ">
          <div className="bg-red-100 px-5 w-full h-12 flex justify-between">
            <div className="flex items-center ">
              <img src={hospitalicon} alt="หอพัก" className="w-6 h-6 mr-2 " />
              <label className="font-bold text-lg">
                ข้อมูลผู้ป่วย ย้ายหอผู้ป่วย
              </label>
            </div>
            <div className="flex items-center">
              <img
                src={close}
                alt="close"
                className="cursor-pointer w-6 h-6 hover:border-4 hover:border-gray-200 active:border-gray-400"
                onClick={() => {
                  setModalMoveDorm(false);
                }}
              />
            </div>
          </div>
          <div className="w-full h-[70px] border border-collapse border-gray-400 mt-2 grid grid-rows-2 grid-cols-2">
            <div className="h-full w-full flex justify-center items-center">
              <label> HN : </label>
              <input
                type="text"
                className="w-[65%] ml-3 border border-collapse px-1 border-gray-700 cursor-default"
              />
            </div>
            <div className="h-full w-full col-start-2 col-span-3 row-start-1 row-span-2 flex items-center">
              <button className="bg-blue-700 text-white w-24 h-12 p-1 rounded mr-10 ml-4 hover:bg-blue-900 active:bg-blue-400 text-sm flex justify-center items-center">
                <img src={searchIcon} alt="ภาพ" className="w-6 h-6 mr-1" />
                ค้นหา
              </button>
              <label className="text-lg">สถานะ: </label>
            </div>
            <div className="h-full w-full flex justify-center items-center">
              <label> AN : </label>
              <input
                type="text"
                className="w-[65%] ml-3 border px-1 border-collapse border-gray-700 cursor-default"
              />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-red-300"></div>
            <div className="row-span-8 flex">
              <div className="w-3/5 h-full  flex">
                <div className="h-full w-full ">
                  <div className="flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">HN:</div>
                    <input
                      type="text"
                      className="w-[35%] border border-collapse border-gray-700 cursor-default"
                      value={patientData ? patientData.hn : ''}
                      readOnly
                    />
                    <div className="w-[12%] flex justify-center">AN:</div>
                    <input
                      type="text"
                      className="w-[30%] border border-collapse border-gray-700 cursor-default"
                      value={patientData ? patientData.an : ''}
                      readOnly
                    />
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      ชื่อ-นามสกุล:
                    </div>
                    <input
                      type="text"
                      className="w-[77%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>

                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      หอผู้ป่วย:
                    </div>
                    <input
                      type="text"
                      className="w-[77%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                  <div className="flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">ห้อง:</div>
                    <input
                      type="text"
                      className="w-[35%]  border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                    <div className="w-[12%] flex justify-center ">เตียง:</div>
                    <input
                      type="text"
                      className="w-[30%]  border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">แพทย์:</div>
                    <input
                      type="text"
                      className="w-[77%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      วันเกิด:
                    </div>
                    <input
                      type="text"
                      className="w-[35%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                    <div className="w-[42%]"></div>
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">อายุ:</div>
                    <input
                      type="text"
                      className="w-[35%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                    <div className="w-[42%] flex">
                      <div className="w-[35%] flex justify-end mr-2">
                        น้ำหนัก:
                      </div>
                      <input
                        type="text"
                        className="w-[45%] border border-collapse border-gray-700 cursor-default text-center text-red-600"
                        value="0"
                        readOnly
                      />
                      <div className="w-[15%] flex ml-2">kg.</div>
                    </div>
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">เพศ:</div>
                    <input
                      type="text"
                      className="w-[35%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                    <div className="w-[42%] flex">
                      <div className="w-[35%] flex justify-end mr-2">
                        ส่วนสูง:
                      </div>
                      <input
                        type="text"
                        className="w-[45%] border border-collapse border-gray-700 cursor-default text-center text-red-600"
                        value="0"
                        readOnly
                      />
                      <div className="w-[15%] flex ml-2">cm.</div>
                    </div>
                  </div>
                  <div className="flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      สิทธิ์ผู้ป่วย:
                    </div>
                    <input
                      type="text"
                      className="w-[77%] border border-collapse border-gray-700 cursor-default"
                      value={patientData ? patientData.pttype_name : ''}
                      readOnly
                    />
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      ประวัติแพ้ยา:
                    </div>
                    <textarea
                      type="text"
                      className="w-[77%] h-[120px] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="w-2/5   grid grid-cols-4 grid-rows-8">
                <div className="h-full col-start-1 col-span-5 row-start-1 row-span-1 ">
                  <div className="flex justify-around items-center">
                    Admit Date:
                    <input
                      type="text"
                      className="w-[60%]  border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                </div>
                <div className="h-full row-start-2 row-span-5 col-start-1 col-span-1">
                  <div className="h-full w-full grid grid-cols-1 grid-rows-3">
                    <div className=" w-full p-2 ">
                      <ButtonWithModal icon={hospitalicon} label="เลือก" />
                    </div>
                    <div className="w-full p-2">
                      <ButtonWithModal icon={porson} label="เลือก" />
                    </div>
                    <div className="w-full p-2">
                      <ButtonWithModal icon={scalesIcon} label="เลือก" />
                    </div>
                  </div>
                </div>
                <div className="p-3 h-full row-start-2 row-span-5 col-start-2 col-span-5">
                  <div className="w-full h-full border border-collapse border-gray-500"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-16  items-center justify-center">
            <button className=" h-12 w-32 border border-collapse border-gray-600 bg-white p-1 cursor-pointer flex justify-center items-center hover:bg-green-600 hover:text-white active:bg-green-800 mr-3">
              <img src={successIcon} alt="Discharge" className="w-6 h-6 mr-3" />
              ยืนยันwert
            </button>
            <button className=" h-12 w-32 border border-collapse border-gray-600 bg-white p-1 cursor-pointer flex justify-center items-center hover:bg-red-600 hover:text-white active:bg-red-800">
              <img src={cancelIcon} alt="Discharge" className="w-6 h-6 mr-3" />
              ยกเลิก
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={modalGoHome}
        onRequestClose={onClose}
        className=" z-10 w-[750px] h-[550px] flex justify-center items-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center"
      >
        <div className=" bg-white grid-cols-1 w-full h-full flex-col ">
          <div className="bg-red-100 px-5 w-full h-12 flex justify-between">
            <div className="flex items-center ">
              <img src={hospitalicon} alt="หอพัก" className="w-6 h-6 mr-2 " />
              <label className="font-bold text-lg">ข้อมูลผู้ป่วยกลับบ้าน</label>
            </div>
            <div className="flex items-center">
              <img
                src={close}
                alt="close"
                className="cursor-pointer w-6 h-6 hover:border-4 hover:border-gray-200 active:border-gray-400"
                onClick={() => {
                  setModalGoHome(false);
                }}
              />
            </div>
          </div>
          <div className="w-full h-[70px] border border-collapse border-gray-400 mt-2 grid grid-rows-2 grid-cols-2">
            <div className="h-full w-full flex justify-center items-center">
              <label> HN : </label>
              <input
                type="text"
                className="w-[65%] ml-3 border border-collapse px-1 border-gray-700 cursor-default"
              />
            </div>
            <div className="h-full w-full col-start-2 col-span-3 row-start-1 row-span-2 flex items-center">
              <button className="bg-blue-700 text-white w-24 h-12 p-1 rounded mr-10 ml-4 hover:bg-blue-900 active:bg-blue-400 text-sm flex justify-center items-center">
                <img src={searchIcon} alt="ภาพ" className="w-6 h-6 mr-1" />
                ค้นหา
              </button>
              <label className="text-lg">สถานะ: </label>
            </div>
            <div className="h-full w-full flex justify-center items-center">
              <label> AN : </label>
              <input
                type="text"
                className="w-[65%] ml-3 border px-1 border-collapse border-gray-700 cursor-default"
              />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-red-300"></div>
            <div className="row-span-8 flex">
              <div className="w-3/5 h-full  flex">
                <div className="h-full w-full ">
                  <div className="flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">HN:</div>
                    <input
                      type="text"
                      className="w-[35%]  border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                    <div className="w-[12%] flex justify-center ">AN:</div>
                    <input
                      type="text"
                      className="w-[30%]  border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      ชื่อ-นามสกุล:
                    </div>
                    <input
                      type="text"
                      className="w-[77%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>

                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      หอผู้ป่วย:
                    </div>
                    <input
                      type="text"
                      className="w-[77%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                  <div className="flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">ห้อง:</div>
                    <input
                      type="text"
                      className="w-[35%]  border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                    <div className="w-[12%] flex justify-center ">เตียง:</div>
                    <input
                      type="text"
                      className="w-[30%]  border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">แพทย์:</div>
                    <input
                      type="text"
                      className="w-[77%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      วันเกิด:
                    </div>
                    <input
                      type="text"
                      className="w-[35%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                    <div className="w-[42%]"></div>
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">อายุ:</div>
                    <input
                      type="text"
                      className="w-[35%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                    <div className="w-[42%] flex">
                      <div className="w-[35%] flex justify-end mr-2">
                        น้ำหนัก:
                      </div>
                      <input
                        type="text"
                        className="w-[45%] border border-collapse border-gray-700 cursor-default text-center text-red-600"
                        value="0"
                        readOnly
                      />
                      <div className="w-[15%] flex ml-2">kg.</div>
                    </div>
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">เพศ:</div>
                    <input
                      type="text"
                      className="w-[35%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                    <div className="w-[42%] flex">
                      <div className="w-[35%] flex justify-end mr-2">
                        ส่วนสูง:
                      </div>
                      <input
                        type="text"
                        className="w-[45%] border border-collapse border-gray-700 cursor-default text-center text-red-600"
                        value="0"
                        readOnly
                      />
                      <div className="w-[15%] flex ml-2">cm.</div>
                    </div>
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      สิทธิ์ผู้ป่วย:
                    </div>
                    <input
                      type="text"
                      className="w-[77%] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                  <div className=" flex w-full">
                    <div className="w-[23%] flex justify-end mr-2">
                      ประวัติแพ้ยา:
                    </div>
                    <textarea
                      type="text"
                      className="w-[77%] h-[120px] border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="w-2/5   grid grid-cols-4 grid-rows-8">
                <div className="h-full col-start-1 col-span-5 row-start-1 row-span-1 ">
                  <div className="flex justify-around items-center">
                    Admit Date:
                    <input
                      type="text"
                      className="w-[60%]  border border-collapse border-gray-700 cursor-default"
                      readOnly
                    />
                  </div>
                </div>
                <div className="h-full row-start-2 row-span-5 col-start-1 col-span-1">
                  <div className="h-full w-full grid grid-cols-1 grid-rows-3">
                    <div className=" w-full p-2 ">
                      <ButtonWithModal icon={hospitalicon} label="เลือก" />
                    </div>
                    <div className="w-full p-2">
                      <ButtonWithModal icon={porson} label="เลือก" />
                    </div>
                    <div className="w-full p-2">
                      <ButtonWithModal icon={scalesIcon} label="เลือก" />
                    </div>
                  </div>
                </div>
                <div className="p-3 h-full row-start-2 row-span-5 col-start-2 col-span-5">
                  <div className="w-full h-full border border-collapse border-gray-500"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-16 bg-yellow-200 border border-collapse border-gray-500 items-center justify-center"></div>
        </div>
      </Modal>
    </div>
  );
}
const ButtonWithIcon = ({ icon, label, func }) => {
  return (
    <button
      onClick={func}
      className="bg-white text-gray-700 border-2 p-1 rounded cursor-pointer hover:bg-gray-700 hover:text-white active:bg-gray-300 text-sm flex flex-col items-center h-full w-32"
    >
      <img src={icon} alt={label} className="w-6 h-6 mr-2 " />
      <span className="mt-2 text-sm text-center">{label}</span>
    </button>
  );
};
const ButtonWithModal = ({ icon, label, func }) => {
  return (
    <button
      onClick={func}
      className="w-full h-full border border-collapse border-gray-500 flex flex-col bg-white justify-center items-center cursor-pointer hover:bg-gray-300 active:bg-gray-50"
    >
      <img src={icon} alt={label} className="w-6 h-6" />
      <span className="mt-2 text-sm text-center">{label}</span>
    </button>
  );
};
