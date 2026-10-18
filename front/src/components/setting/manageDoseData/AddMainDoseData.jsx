import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import noCam from '../../../../img/no-pictures-no-camera.svg';
import {
  getDoseById,
  dtdosageunit,
  dtorderunit,
} from '../../../service/DoseService';
import successImg from '../../../../img/success.png';
import cancelImg from '../../../../img/cancel.png';
export default function AddMainDoseData() {
  const [dataDose, setDataDose] = useState([]);
  const { orderitemcode } = useParams();
  const [openWork, setOpenWork] = useState('N');
  const [chemoStatus, setChemoStatus] = useState('N');
  const [diluentStatus, setDiluentStatus] = useState('N');
  const [sendChemo, setSendChemo] = useState('sendChemo');
  const [sendMachine, setSendMachine] = useState('rdNotsendmachine');
  const [multiDose, setMultiDose] = useState('rdNotsendmultidose');
  const [printStatus, setPrintStatus] = useState('rdNotPrint');
  const [selectDoseType, setSelectDoseType] = useState('ยาฉีด');
  const [selectDescription, setSelectDescription] = useState('Capsule');
  const [sendStore, setSendStore] = useState('0');
  const [sendF3F4, setSendF3F4] = useState('');
  const [txtPack, setTxtPack] = useState('');
  const [DrugAge, setTxtDrugAge] = useState('');
  const [generalChemo, setGeneralChemo] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  useEffect(() => {
    const showdataDrugInformation = async () => {
      try {
        const data = await getDoseById(orderitemcode);
        setDataDose(data[0]); // บันทึกลง state
        setChemoStatus(data[0].ChemicalStatus);
        setDiluentStatus(data[0].diluentstatus);
        setSelectDoseType(data[0].drugform);
        setSelectDescription(data[0].description);
        setSendStore(data[0].sendStore);
        setSendF3F4(data[0].sendF3F4);
        setTxtPack(data[0].pack);
        setTxtDrugAge(data[0].DrugAge);
        setGeneralChemo(data[0].GeneralChemo);
        setVehicleType(data[0].vehicletype);
        if (data[0].unused === 'Y') {
          setOpenWork('Y');
        } else {
          setOpenWork('N');
        }
        if (data[0].sendmix === 'N') {
          setSendChemo('sendNotMix');
          if (data[0].sendTPN === 'Y') {
            setSendChemo('sendTNP');
          }
          if (data[0].sendChemo === 'Y') {
            setSendChemo('sendChemo');
          }
        } else {
          setSendChemo('sendMix');
        }
        if (data[0].sendmachine === 'N') {
          setSendMachine('rdNotsendmachine');
        } else {
          setSendMachine('rdsendmachine');
        }
        if (data[0].multidose === 'N') {
          setMultiDose('rdNotsendmultidose');
        } else {
          setMultiDose('rdsendmultidose');
        }
        if (data[0].printstatus === 'N') {
          setPrintStatus('rdNotPrint');
        } else {
          setPrintStatus('rdPrint');
        }
      } catch (err) {
        console.error(err);
      }
    };
    showdataDrugInformation();
  }, [orderitemcode]);

  return (
    <div className="w-full h-full flex border border-gray-700 bg-gray-100">
      <div className="w-56 h-full px-1 pt-2 pb-3 flex flex-col items-center border-r-2 border-gray-400 overflow-y-auto">
        <img
          src={noCam}
          alt="กล้อง"
          className="w-[95%] h-42 border border-gray-400 p-2"
        />

        <input type="file" class="file-input" />
        <div className="flex space-x-2">
          <span>เปิดใช้งาน : </span>{' '}
          <input
            type="checkbox"
            checked={openWork === 'Y'}
            onChange={(e) => setOpenWork(e.target.checked ? 'Y' : 'N')}
            className="toggle checked:bg-green-300 checked:text-green-800"
          />
        </div>
        <label className="label">
          <input
            type="checkbox"
            defaultChecked
            className="checkbox checked:bg-blue-500 checked:text-white"
          />
          <p className="text-red-700">ค้นหาชื่อยาด้วยรหัส</p>
        </label>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border px-4">
          <legend className="fieldset-legend w-full">สารเคมี</legend>
          <div className="flex justify-around items-center">
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="chemo"
                value="N"
                checked={chemoStatus === 'N'}
                onChange={(e) => setChemoStatus(e.target.value)}
                className="radio checked:bg-blue-400 radio-xs"
              />
              <span className="text-black">ไม่เป็น</span>
            </label>
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="chemo"
                value="Y"
                checked={chemoStatus === 'Y'}
                onChange={(e) => setChemoStatus(e.target.value)}
                className="radio checked:bg-blue-400 radio-xs"
              />
              <span className="text-black">เป็น</span>
            </label>
          </div>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border px-4">
          <legend className="fieldset-legend w-full">ตัวทำละลาย</legend>
          <div className="flex justify-around items-center">
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="uli"
                value={'N'}
                checked={diluentStatus === 'N'}
                onChange={(e) => setDiluentStatus(e.target.value)}
                className="radio checked:bg-blue-400 radio-xs"
              />
              <span className="text-black">ไม่เป็น</span>
            </label>
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="uli"
                value={'Y'}
                checked={diluentStatus === 'Y'}
                onChange={(e) => setDiluentStatus(e.target.value)}
                className="radio checked:bg-blue-400 radio-xs"
              />
              <span className="text-black">เป็น</span>
            </label>
          </div>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border px-4">
          <legend className="fieldset-legend w-full">ส่งผลิต</legend>
          <div className="flex flex-col justify-around items-start">
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="manufacture"
                value={'sendNotMix'}
                onChange={(e) => setSendChemo(e.target.value)}
                checked={sendChemo === 'sendNotMix'}
                className="radio checked:bg-blue-400 radio-xs"
              />
              <span className="text-black">ไม่ส่งผลิต</span>
            </label>
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="manufacture"
                checked={sendChemo === 'sendMix'}
                value={'sendMix'}
                onChange={(e) => setSendChemo(e.target.value)}
                className="radio checked:bg-blue-400 radio-xs"
              />
              <span className="text-black">ส่งผลิต</span>
            </label>
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="manufacture"
                checked={sendChemo === 'sendTPN'}
                value={'sendTPN'}
                onChange={(e) => setSendChemo(e.target.value)}
                className="radio checked:bg-blue-400 radio-xs"
              />
              <span className="text-black">ส่ง TPN</span>
            </label>
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="manufacture"
                checked={sendChemo === 'sendChemo'}
                value={'sendChemo'}
                onChange={(e) => setSendChemo(e.target.value)}
                className="radio checked:bg-blue-400 radio-xs"
              />
              <span className="text-black">ส่ง Chemo</span>
            </label>
          </div>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border px-4">
          <legend className="fieldset-legend w-full">ส่งเครื่อง JVM</legend>
          <div className="flex flex-col justify-around items-center space-y-2">
            <div className="flex space-x-3">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="option"
                  className="radio checked:bg-blue-400 radio-xs"
                  checked={sendMachine === 'rdNotsendmachine'}
                  value={'rdNotsendmachine'}
                  onChange={(e) => setSendMachine(e.target.value)}
                />
                <span className="text-black">ไม่ส่งเครื่อง</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="option"
                  className="radio checked:bg-blue-400 radio-xs"
                  checked={sendMachine === 'rdsendmachine'}
                  value={'rdsendmachine'}
                  onChange={(e) => setSendMachine(e.target.value)}
                />
                <span className="text-black">ส่งเครื่อง</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="pastic"
                  className="radio checked:bg-blue-400 radio-xs"
                  checked={multiDose === 'rdNotsendmultidose'}
                  value={'rdNotsendmultidose'}
                  onChange={(e) => {
                    setMultiDose(e.target.value);
                  }}
                />
                <span className="text-black">ไม่แยกซอง</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="pastic"
                  className="radio checked:bg-blue-400 radio-xs"
                  checked={multiDose === 'rdsendmultidose'}
                  value={'rdsendmultidose'}
                  onChange={(e) => {
                    setMultiDose(e.target.value);
                  }}
                />
                <span className="text-black">แยกซอง</span>
              </label>
            </div>
          </div>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border px-4">
          <legend className="fieldset-legend w-full">การพิมพ์ฉลาก : </legend>
          <div className="flex justify-around items-center">
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="print"
                className="radio checked:bg-blue-400 radio-xs"
                checked={printStatus === 'rdNotPrint'}
                value={'rdNotPrint'}
                onChange={(e) => {
                  setPrintStatus(e.target.value);
                }}
              />
              <span className="text-black">ไม่พิมพ์</span>
            </label>
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="print"
                className="radio checked:bg-blue-400 radio-xs"
                checked={printStatus === 'rdPrint'}
                value={'rdPrint'}
                onChange={(e) => {
                  setPrintStatus(e.target.value);
                }}
              />
              <span className="text-black">พิมพ์</span>
            </label>
          </div>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border p-2">
          <legend className="fieldset-legend w-full">รูปแบบยา : </legend>

          <select
            id="doseType"
            className="border p-2"
            value={selectDoseType}
            onChange={(e) => setSelectDoseType(e.target.value)}
          >
            <option value="ยาฉีด">ยาฉีด</option>
            <option value="ยาใช้ภายนอก">ยาใช้ภายนอก</option>
            <option value="เวชภัณฑ์ไม่ใช่ยา">เวชภัณฑ์ไม่ใช่ยา</option>
            <option value="ยาน้ำ รับประทาน">ยาน้ำ รับประทาน</option>
            <option value="ยาเม็ด รับประทาน">ยาเม็ด รับประทาน</option>
            <option value="ไม่ใช่ยา">ไม่ใช่ยา</option>
            <option value="สมุนไพร">สมุนไพร</option>
          </select>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border p-2">
          <legend className="fieldset-legend w-full">DosageForm : </legend>

          <select
            id="doseType"
            className="border p-2"
            value={selectDescription}
            onChange={(e) => setSelectDescription(e.target.value)}
          >
            <option value="Capsule">Capsule</option>
            <option value="Cream">Cream</option>
            <option value="Elixir">Elixir</option>
            <option value="Emulsion">Emulsion</option>
            <option value="Injection">Injection</option>
            <option value="Jelly">Jelly</option>
            <option value="Lotion">Lotion</option>
            <option value="Mixture">Mixture</option>
            <option value="Ointment">Ointment</option>
            <option value="Paste">Paste</option>
            <option value="Powder">Powder</option>
            <option value="Shampoo">Shampoo</option>
            <option value="Solution">Solution</option>
            <option value="Suspension">Suspension</option>
            <option value="Syrup">Syrup</option>
            <option value="Tablet">Tablet</option>
          </select>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border px-2">
          <legend className="fieldset-legend w-full">ส่งเบิก :</legend>
          <div className="flex flex-wrap items-center space-x-2">
            <label className="label cursor-pointer ">
              <input
                type="radio"
                name="drew"
                value={0}
                checked={sendStore === 0}
                onChange={(e) => setSendStore(e.target.value)}
                className="radio checked:bg-blue-400 radio-xs"
              />
              <span className="text-black">ไม่ส่ง</span>
            </label>
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="drew"
                className="radio checked:bg-blue-400 radio-xs"
                value={1}
                checked={sendStore === 1}
                onChange={(e) => setSendStore(e.target.value)}
              />
              <span className="text-black">ส่ง</span>
            </label>
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="drew"
                className="radio checked:bg-blue-400 radio-xs"
                value={2}
                checked={sendStore === 2}
                onChange={(e) => setSendStore(e.target.value)}
              />
              <span className="text-black">ยาเสพติด</span>
            </label>
          </div>
          <label className="label cursor-pointer">
            <input
              type="radio"
              name="drew-2"
              className="radio checked:bg-blue-400 radio-xs"
              value={1}
              checked={sendF3F4 === 1}
              onChange={(e) => setSendF3F4(e.target.value)}
            />
            <span className="text-black">ส่งชั้น 4</span>
          </label>
          <label className="label">ส่งชั้น 3:</label>
          <div className="flex space-x-1">
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="drew-2"
                className="radio checked:bg-blue-400 radio-xs"
                value={0}
                checked={sendF3F4 === 0}
                onChange={(e) => setSendF3F4(e.target.value)}
              />
              <span className="text-black">รพ.ผลิดเอง</span>
            </label>
            <label className="label cursor-pointer">
              <input
                type="radio"
                name="drew-2"
                className="radio checked:bg-blue-400 radio-xs"
                value={2}
                checked={sendF3F4 === 2}
                onChange={(e) => setSendF3F4(e.target.value)}
              />
              <span className="text-black">ยาฆ่าเชื้อ</span>
            </label>
          </div>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border p-2">
          <legend className="fieldset-legend w-full">Pack : </legend>

          <input
            type="number"
            className="px-2 py-1 w-full border "
            onChange={(e) => {
              setTxtPack(e.target.value);
            }}
            value={txtPack}
          />
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border p-2 flex items-center">
          <legend className="fieldset-legend w-full">อายุของยา :</legend>

          <input
            type="number"
            className="px-2 py-1 w-full border "
            value={DrugAge}
            onChange={(e) => setTxtDrugAge(e.target.value)}
          />
          <p>เดือน</p>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border p-2 flex items-center justify-around">
          <legend className="fieldset-legend w-full">
            เฉพาะการผลิตทั่วไป :
          </legend>
          <label className="label cursor-pointer">
            <input
              type="radio"
              name="onlyGenerate"
              className="radio checked:bg-blue-400 radio-xs"
              value={'N'}
              checked={generalChemo === 'N'}
              onChange={(e) => setGeneralChemo(e.target.value)}
            />
            <span className="text-black">ไม่ใช่</span>
          </label>
          <label className="label cursor-pointer">
            <input
              type="radio"
              name="onlyGenerate"
              className="radio checked:bg-blue-400 radio-xs"
              value={'Y'}
              checked={generalChemo === 'Y'}
              onChange={(e) => setGeneralChemo(e.target.value)}
            />
            <span className="text-black">ใช่</span>
          </label>
        </fieldset>
        <fieldset className="fieldset bg-white border-base-400 rounded-box w-full border p-2">
          <legend className="fieldset-legend w-full">Vehicle : </legend>

          <input
            type="number"
            className="px-2 py-1 w-full border"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          />
        </fieldset>
      </div>

      <div className="h-full w-[80%]">
        <ShowDoseData data={dataDose} />
      </div>
    </div>
  );
}
const ShowDoseData = ({ data }) => {
  const [enName, setEnName] = useState('');
  const [thName, setThName] = useState('');
  const [formData, setFormData] = useState({
    genericName: '',
    brandName: '',
    strength: '',
    unit: '',
    quantity: '',
    quantityUnit: '',
    orderName: '',
    howToTake: '',
    additionalInfo: '',
    gfmisCode: '',
    lotNumber: '',
    pricePerUnit: '',
    ipdPrice: '',
    opdPrice: '',
    dosage1: '',
    dosage2: '',
    frequency: '',
    country: '',
    category: '',
    province: '',
    ptcCategory: '',
    medicationType: '',
    usage: '',
    eyeType: '',
    hasSpecialStorage: false,
    isLiquid: false,
    requiresRefrigeration: false,
    hasSpecialInstructions: false,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (data?.orderitemENname) {
      setEnName(data.orderitemENname);
      setThName(data.orderitemTHname);
    }
    if (data) {
      setFormData((prev) => ({
        ...prev,
        genericName: data.genericname,
        strength: data.capacity,
      }));
    }
    //---------------Unit Code หน่วย------------------

    const fatchUnit2 = async () => {
      try {
        const rsUnit = await dtdosageunit(data.capacity_unit);
        // ตรวจสอบว่ามีข้อมูลหรือไม่
        if (rsUnit && rsUnit.length > 0 && rsUnit[0].DispensedUnitTH) {
          setFormData((prev) => ({
            ...prev,
            unit: rsUnit[0].DispensedUnitTH,
          }));
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยยา:', error);
      }
    };
    //---------------Unit Code หน่วยย่อย------------------
    const fatchUnit1 = async () => {
      try {
        const rsUnit1 = await dtdosageunit(data.dosageunitcode);
        // ตรวจสอบว่ามีข้อมูลหรือไม่
        console.log(rsUnit1);
        if (rsUnit1 && rsUnit1.length > 0 && rsUnit1[0].DispensedUnitTH) {
          setFormData((prev) => ({
            ...prev,
            quantityUnit: rsUnit1[0].DispensedUnitTH,
          }));
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยยา:', error);
      }
    };
    //------------------------หน่วยขาย-----------------
    const fatchOrderUnit = async () => {
      try {
        const rsOrderUnit = await dtorderunit(data.orderunitcode);
        // ตรวจสอบว่ามีข้อมูลหรือไม่
        console.log(rsOrderUnit);
        if (
          rsOrderUnit &&
          rsOrderUnit.length > 0 &&
          rsOrderUnit[0].DispensedTotalUnitTH
        ) {
          setFormData((prev) => ({
            ...prev,
            orderName: rsOrderUnit[0].DispensedTotalUnitTH,
          }));
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยยา:', error);
      }
    };
    if (data?.capacity_unit) {
      fatchUnit2();
    }
    if (data?.dosageunitcode) {
      fatchUnit1();
    }
    if (data?.orderunitcode) {
      fatchOrderUnit();
    }
  }, [data]);
  return (
    <div className="w-full h-full p-2">
      <div className="w-full h-[16%] flex">
        <div className="h-full w-1/2 grid grid-rows-3 grid-cols-4 py-2">
          <span className="row-start-1 row-span-1 col-start-1 col-span-1 text-[16px] flex items-center justify-end mr-2">
            รหัสยา :
          </span>
          <input
            type="text"
            className="px-2 w-full h-[96%] row-span-1 row-start-1 col-span-3 col-start-2 border border-gray-600 focus:border-gray-400 bg-gray-300"
            readOnly
            value={data.orderitemcode}
          />
          <span className="row-start-2 row-span-1 col-start-1 col-span-1 text-[16px] flex items-center justify-end mr-2">
            ชื่อยาบนฉลาก :
          </span>
          <input
            type="text"
            className="px-2 w-full h-[96%] row-span-1 row-start-2 col-span-3 col-start-2 border border-gray-600"
            value={enName}
            onChange={(e) => setEnName(e.target.value)}
          />
          <span className="row-start-3 row-span-1 col-start-1 col-span-1 text-[16px] flex items-center justify-end mr-2">
            ชื่อยาภาษาไทย :
          </span>
          <input
            type="text"
            className="px-2 w-full h-[96%] row-span-1 row-start-3 col-span-3 col-start-2 border border-gray-600"
            value={thName}
            onChange={(e) => setThName(e.target.value)}
          />
        </div>
        <div className="h-full w-1/2  py-2 grid grid-rows-6 grid-cols-12 gap-1">
          <button className=" bg-yellow-300 text-yellow-900 w-full h-full row-span-3 row-start-1 col-span-2 col-start-1 ml-2 hover:bg-yellow-200">
            Monograph
          </button>
          <button className=" bg-white border-4 border-green-300 text-green-900 w-full h-full row-span-3 row-start-4 col-span-2 col-start-1 ml-2 hover:bg-green-200 flex justify-center items-center">
            <img src={successImg} alt="รูป" className="h-7 w-7 mr-1" />
            บันทึก
          </button>
          <button className=" bg-white border-4 border-red-300 text-red-900 w-full h-full row-span-3 row-start-4 col-span-2 col-start-3 ml-2 hover:bg-red-200 flex justify-center items-center">
            <img src={cancelImg} alt="รูป" className="h-7 w-7 mr-1" />
            ยกเลิก
          </button>
        </div>
      </div>
      <div className="w-full h-[84%]">
        <div className="tabs tabs-box w-full h-full">
          <input
            type="radio"
            name="my_tabs_6"
            className="tab"
            defaultChecked
            aria-label="General"
          />
          <div className="tab-content bg-base-100 border-base-300 pt-1">
            {/*------------------------------------ganeral Tap-----------------------------------------------------------------*/}
            <div className=" bg-gray-50 h-full overflow-auto">
              <div className="w-full px-2 mx-auto bg-white rounded-lg shadow-lg py-2">
                {/* Header Section */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Generic Name Input */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700 w-24">
                        Generic Name:
                      </label>
                      <input
                        type="text"
                        className="border border-gray-300 px-3 py-1 text-sm flex-1"
                        value={formData.genericName}
                      />
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">ค้นหา</span>
                    </div>

                    {/* Generic Name Table */}
                    <div className="border border-gray-300 h-56 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-2 py-1 text-left w-8"></th>
                            <th className="border border-gray-300 px-2 py-1 text-left">
                              Generic Name
                            </th>
                            <th className="border border-gray-300 px-2 py-1 text-left">
                              ความแรง
                            </th>
                            <th className="border border-gray-300 px-2 py-1 text-left">
                              หน่วย
                            </th>
                            <th className="border border-gray-300 px-2 py-1 text-left">
                              คือ
                            </th>
                            <th className="border border-gray-300 px-2 py-1 text-left">
                              หน่วย
                            </th>
                            <th className="border border-gray-300 px-2 py-1 text-left">
                              ลบ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-2 py-1">
                              <input type="checkbox" className="w-4 h-4" />
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                              lamivudine
                            </td>
                            <td className="border border-gray-300 px-2 py-1"></td>
                            <td className="border border-gray-300 px-2 py-1"></td>
                            <td className="border border-gray-300 px-2 py-1"></td>
                            <td className="border border-gray-300 px-2 py-1"></td>
                            <td className="border border-gray-300 px-2 py-1">
                              <button className="bg-red-500 text-white px-2 py-1 text-xs">
                                X
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 w-32">
                          ปริมาณยาหน่วยย่อย/หน่วยขาย:
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 w-32 text-sm"
                          value={formData.strength}
                        />
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 w-32 text-sm"
                          value={formData.unit}
                        />
                        <span className="text-sm ml-4">หน่วย</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 w-32">
                          หน่วยย่อย:
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 w-28 text-sm"
                          value={formData.quantityUnit}
                        />
                        <label className="text-sm text-gray-700 ml-4">
                          ลักษณะยา:
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 flex-1 text-sm"
                          placeholder=""
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 w-32">
                          หน่วยขาย:
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 w-28 text-sm"
                          value={formData.orderName}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 w-32">
                          สีตัวอักษร:
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 w-48 text-sm"
                        />
                        <button className="bg-blue-500 text-white px-3 py-2 text-sm">
                          📋
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700 w-32">
                            รหัสมาตราฐาน (DID):
                          </label>
                          <input
                            type="text"
                            className="border border-gray-300 px-2 py-1 flex-1 text-sm"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700 w-32">
                            รหัสยา (GFMIS):
                          </label>
                          <input
                            type="text"
                            className="border border-gray-300 px-2 py-1 flex-1 text-sm"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700 w-32">
                            รหัสคลังยา:
                          </label>
                          <input
                            type="text"
                            className="border border-gray-300 px-2 py-1 flex-1 text-sm"
                            placeholder=""
                          />
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="label">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm checked:bg-blue-600 checked:text-white"
                            />
                            <p className="text-gray-700 text-sm">
                              ยาโรคเรื้อรัง/ใช้ติดต่อกันเป็นเวลานาน
                            </p>
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="label">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm checked:bg-blue-600 checked:text-white"
                            />
                            <p className="text-sm text-gray-700">ยาแซ่เย็น</p>
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="label">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm checked:bg-blue-600 checked:text-white"
                            />
                            <p className="text-sm text-gray-700">
                              ยาที่ต้องกันแสง
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Dose Section */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 w-32">
                          คำนวณ Dose:
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 w-24 text-sm"
                        />
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 w-24 text-sm"
                        />
                        <span className="text-sm">หน่วย</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 w-32">
                          รูปแบบการคำนวณ:
                        </label>
                        <select className="border border-gray-300 px-2 py-1 flex-1 text-sm">
                          <option value=""></option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2">
                    {/* Country Selection */}
                    <div className="grid grid-cols-2 grid-rows-3">
                      <label className="row-start-1 row-span-1 col-start-1 col-span-1 text-sm text-gray-700">
                        ประเภทเวชภัณฑ์:
                      </label>
                      <select className="row-start-1 row-span-1 col-start-2 col-span-1 border border-gray-300 px-2 py-1 text-sm">
                        <option>ยา</option>
                      </select>

                      <label className="row-start-2 row-span-1 col-start-1 col-span-1 text-sm text-gray-700">
                        ประเภท:
                      </label>
                      <select className="row-start-2 row-span-1 col-start-2 col-span-1 border border-gray-300 px-2 py-1 text-sm">
                        <option>ทั่วไป</option>
                      </select>

                      <label className=" row-start-3 row-span-1 col-start-1 col-span-1  text-sm text-gray-700">
                        ประเภทยาตามระเบียบ PTC:
                      </label>
                      <select className="row-start-3 row-span-1 col-start-2 col-span-1 border border-gray-300 px-2 py-1 text-sm flex-1">
                        <option value=""></option>
                      </select>
                    </div>

                    {/* Medicine Categories */}

                    <div className="space-y-2 ">
                      <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border px-2">
                        <legend class="fieldset-legend">ประเภทรายการ</legend>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="ed"
                              name="medicine_type"
                              className="w-4 h-4"
                            />
                            <label
                              htmlFor="ed"
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              ED
                            </label>

                            <input
                              type="checkbox"
                              id="project"
                              className="w-4 h-4 ml-4"
                            />
                            <label
                              htmlFor="project"
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              โครงการ
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="ned"
                              name="medicine_type"
                              className="w-4 h-4"
                            />
                            <label
                              htmlFor="ned"
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              NED
                            </label>
                          </div>
                        </div>
                      </fieldset>

                      <div className="mt-4">
                        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border px-2">
                          <legend class="fieldset-legend">
                            การคำนวณราคายา
                          </legend>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="calc1"
                                name="price_calc"
                                className="w-4 h-4"
                                defaultChecked
                              />
                              <label
                                htmlFor="calc1"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                ตามหน่วยย่อย
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="calc2"
                                name="price_calc"
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor="calc2"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                หน่วยย่อยแล้วนำสมบันยางหน่วยย่อย
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="calc3"
                                name="price_calc"
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor="calc3"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                เต็มหน่วยขาย
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="calc4"
                                name="price_calc"
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor="calc4"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                ง่ายขาด
                              </label>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="lock"
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor="lock"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                ห้ามแก้ไขโดยใหม่ที่สั่งยา
                              </label>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                      <div className="space-y-2">
                        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border px-2">
                          <legend class="fieldset-legend">ประเภทรายการ</legend>

                          <label className="text-sm text-gray-700 font-medium">
                            ประเภทในโบกีล
                          </label>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="loc_a"
                                name="location_type"
                                className="w-4 h-4"
                                defaultChecked
                              />
                              <label
                                htmlFor="loc_a"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                บัญชี ก
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="loc_b"
                                name="location_type"
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor="loc_b"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                บัญชี ข
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="loc_c"
                                name="location_type"
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor="loc_c"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                บัญชี ค
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="loc_d"
                                name="location_type"
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor="loc_d"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                บัญชี ง
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="loc_e1"
                                name="location_type"
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor="loc_e1"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                บัญชี จ1
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="loc_e2"
                                name="location_type"
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor="loc_e2"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                บัญชี จ2
                              </label>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>

                    {/* Location Categories */}

                    {/* Price Fields */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 w-32">
                          ราคาต้นทุน:
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 flex-1 text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 w-32">
                          ราคาจำหน่าย(IPD):
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 flex-1 text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 w-32">
                          ราคาจำหน่าย(OPD):
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 px-2 py-1 flex-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <input
            type="radio"
            name="my_tabs_6"
            className="tab"
            aria-label="Tab 2"
          />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            Tab content 2
          </div>

          <input
            type="radio"
            name="my_tabs_6"
            className="tab"
            aria-label="Tab 3"
          />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            Tab content 3
          </div>
        </div>
      </div>
    </div>
  );
};
