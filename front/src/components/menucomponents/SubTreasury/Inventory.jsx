import React, { useEffect, useState } from 'react';
import search from '../../../../img/searchList.svg';
import searchBlack from '../../../../img/searchBlack.png';
import print from '../../../../img/print.png';
import addDoc from '../../../../img/addDoc.png';
import close from '../../../../img/close.png';
import axios from 'axios';
import { API_URL } from '../../../../config';
import Modal from 'react-modal';

Modal.setAppElement('#root');
export default function Inventory() {
  const [drugs, setDrugs] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('001'); // ตั้งค่าเริ่มต้นให้กับ roomcode
  const [modalEXP, setModalEXP] = useState(false); //ข้อมูลหอผู้ป่วย
  const [selectedDrug, setSelectedDrug] = useState({
    orderitemcode: '',
    orderitemENname: '',
  });
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await axios.post(API_URL + '/ucHouse', {
          roomcode: selectedRoom, // ส่ง roomcode ไปยัง Backend
        });
        setDrugs(response.data); // เก็บข้อมูลที่ได้รับจาก API ลงใน state
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDrugs(); // เรียกใช้งานฟังก์ชันดึงข้อมูลทุกครั้งที่ roomcode เปลี่ยน
  }, [selectedRoom]); // useEffect จะทำงานทุกครั้งเมื่อ selectedRoom เปลี่ยน

  // ฟังก์ชันจัดการการเปลี่ยนแปลงห้อง
  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value); // ตั้งค่า roomcode ใหม่เมื่อมีการเลือกห้อง
  };

  const [receive, setReceive] = useState(0);
  const [dispense, setDispense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [data, setData] = useState([]);
  const [selectedOrderItemCode, setSelectedOrderItemCode] = useState('');
  // const [selectedRoom, setSelectedRoom] = useState(''); // เพิ่มการจัดการ roomcode

  const handleRowClick = async (orderitemcode, orderitemENname) => {
    try {
      // ตั้งค่า orderitemcode และ orderitemENname ที่ถูกคลิก
      setSelectedDrug({ orderitemcode, orderitemENname });
      setSelectedOrderItemCode(orderitemcode); // เก็บ orderitemcode ที่ถูกคลิก

      // เรียกใช้ API เพื่อดึงข้อมูล balance, receive, dispense
      const response = await axios.post(API_URL + '/balancestockHouse', {
        roomcode: selectedRoom, // ใช้ค่า roomcode ที่เลือกจาก state
        orderitemcode: orderitemcode,
      });

      const responseData = response.data;

      // อัปเดต state ด้วยข้อมูลที่ได้จาก API
      setReceive(responseData.receive);
      setDispense(responseData.dispense);
      setBalance(responseData.balance);
      setData(responseData.data); // Set the data to be displayed in the table

      console.log('ข้อมูลที่ได้รับจากการกรอง:', responseData);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการส่งข้อมูล:', error);
    }
  };

  return (
    <div className="w-full h-full text-sm flex space-x-1">
      <div className="w-[35%] h-[98.4%] mt-1 border border-collapse border-gray-400 border-1">
        <div className="flex w-full h-[15%] ">
          <div className="grid grid-rows-4 grid-cols-6 w-full h-full">
            <div className="h-full row-start-1 row-span-1 col-start-1 col-span-1 flex justify-center items-start  pt-2">
              <span className="text-[18px] font-bold">ข้อมูลยา</span>
            </div>
            <div className="h-full row-start-2 row-span-2 col-start-1 col-span-2 flex justify-center items-center ">
              <input
                type="text"
                className=" h-[70%] w-[90%] rounded-sm border border-collapse border-gray-400"
              />
            </div>
            <div className="row-start-2 row-span-2 col-start-3 col-span-2  flex flex-col justify-center items-center">
              <select
                name="room"
                id="1"
                className="w-[100%] h-5/6 border border-gray-300 text-xs"
                value={selectedRoom} // ใช้ state ที่เก็บ roomcode
                onChange={handleRoomChange} // เรียกใช้เมื่อมีการเปลี่ยนแปลงค่า
              >
                <option value="001">ห้องยา IPD[001]</option>
                <option value="002">ห้องเตรียมยาอาคารเภสัชกรรม</option>
                <option value="003">ห้องยา ICU[003]</option>
              </select>
            </div>
            <div className="row-start-4 row-span-2 col-start-1 col-span-2  space-x-2 flex justify-start items-center px-1">
              <span className="text-red-500">จำนวน</span>
              <span className="text-red-500">0</span>
              <span className="text-red-500">รายการ</span>
            </div>
            <div className="row-start-2 row-span-2 col-start-5 col-span-1 space-x-2 flex justify-center items-center px-1">
              <button className="w-[80%] h-[90%] rounded-sm text-black font-bold bg-red-200 hover:bg-slate-200 active:bg-slate-300 flex flex-col items-center justify-center space-x-2">
                <img src={search} alt={'ค้นหา'} className="w-6 h-6" />
                <span>{'ค้นหา'}</span>
              </button>
            </div>
            <div className="row-start-2 row-span-2 col-start-6 col-span-1 space-x-2 flex justify-center items-center px-1">
              <button
                className="w-[80%] h-[90%] rounded-sm text-black font-bold bg-purple-200  hover:bg-slate-200 active:bg-slate-300 flex flex-col items-center justify-center space-x-2"
                onClick={() => setModalEXP(true)}
              >
                <img src={search} alt={'ค้นหา'} className="w-6 h-6" />
                <span>{'EXP'}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex w-full h-[85%] p-2">
          <div className="max-h-full w-full overflow-auto bg-white">
            <table className="w-full border-collapse border border-gray-400">
              <thead className="stick top-0">
                <tr>
                  <th className="border border-gray-300 p-2 text-xs min-w-[20px]">
                    รหัสยา
                  </th>
                  <th className="border border-gray-300 p-2 text-xs min-w-[120px]">
                    ชื่อยา
                  </th>
                </tr>
              </thead>
              <tbody>
                {drugs.map((drug) => (
                  <tr
                    key={drug.orderitemcode}
                    className="hover:bg-blue-400 hover:text-white active:bg-blue-700 cursor-pointer"
                    onClick={() =>
                      handleRowClick(drug.orderitemcode, drug.orderitemENname)
                    }
                  >
                    <td className="border border-gray-300 p-2 text-xs">
                      {drug.orderitemcode}
                    </td>
                    <td className="border border-gray-300 p-2 text-xs">
                      {drug.orderitemENname}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="w-[65%] h-[98%]  mt-1 space-y-1">
        <div className="flex w-full h-[20%] border border-collapse border-gray-400  ">
          <div className="grid grid-rows-5 grid-cols-6 h-full w-full">
            <div className="row-start-1 row-span-5 col-span-1 col-start-1 flex justify-center items-center">
              <div className=" w-[70%] h-[90%] border border-collapse bg-white border-gray-400">
                {/* ใส่ภาพ */}
              </div>
            </div>
            <div className=" row-start-1 row-span-1 col-span-2 col-start-2 flex justify-start space-x-1 items-center">
              <span className="font-bold">รหัสยา : </span>
              <span className="font-bold">{selectedDrug.orderitemcode}</span>
            </div>
            <div className=" row-start-2 row-span-1 col-span-2 col-start-2 flex justify-start space-x-1 items-center">
              <span className="font-bold">ชื่อยา : </span>
              <span className="font-bold">{selectedDrug.orderitemENname}</span>
            </div>
            <div className=" row-start-4 row-span-1 col-span-1 col-start-2 flex justify-start space-x-1 items-center">
              <span className="font-bold">Max : </span>
              <span className="font-bold">{'0'}</span>
            </div>
            <div className="row-start-5 row-span-1 col-span-1 col-start-2 flex justify-start items-center space-x-1">
              <span className="font-bold">รับเข้า : </span>
              <span className="font-bold">{receive}</span>
            </div>
            <div className=" row-start-4 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-1">
              <span className="font-bold">Min : </span>
              <span className="font-bold">{'0'}</span>
            </div>
            <div className="row-start-5 row-span-1 col-span-1 col-start-3 flex justify-start items-center space-x-1">
              <span className="font-bold">จ่ายออก : </span>
              <span className="font-bold">{dispense}</span>
            </div>

            <div className="row-start-4 row-span-1 col-span-1 col-start-4 flex justify-start items-center space-x-1">
              <button className="w-10 h-10 rounded-sm text-black font-bold bg-gray-400 hover:bg-slate-200 active:bg-slate-300 flex flex-col items-center justify-center space-x-2">
                <img src={addDoc} alt={'ค้นหา'} className="w-6 h-6" />
              </button>
            </div>
            <div className="row-start-5 row-span-1 col-span-1 col-start-4 flex justify-start items-center space-x-1">
              <span className="font-bold">คงเหลือ : </span>
              <span className="font-bold">{balance}</span>
            </div>
          </div>
        </div>
        <div className=" w-full h-[80%] border border-collapse border-gray-400">
          <div className="grid grid-rows-3 grid-cols-12 h-[15%] w-full">
            <div className="flex row-start-1 row-span-1 col-start-1 col-span-2 px-2 items-end">
              <span className="font-bold text-lg">ประวัติการใช้ยา</span>
            </div>
            <div className="row-start-2 row-span-2 col-start-1 col-span-3  px-2 flex justify-center space-x-2 items-center">
              <span className="font-bold">วันที่ : </span>
              <input
                type="date"
                className="h-[60%] w-[80%] border border-collapse border-gray-400 px-2"
              />
            </div>
            <div className="row-start-2 row-span-2 col-start-4 col-span-3 px-2 flex justify-center space-x-2 items-center">
              <span className="font-bold">ถึง : </span>
              <input
                type="date"
                className="h-[60%] w-[80%] border border-collapse border-gray-400 px-2"
              />
            </div>
            <div className="row-start-2 row-span-2 col-start-7 col-span-1 px-2 flex justify-center space-x-2 items-center ">
              <button className="w-[80%] h-[80%] rounded-sm text-black font-bold bg-green-400 hover:bg-slate-200 active:bg-slate-300 flex flex-col items-center justify-center space-x-2">
                <img src={searchBlack} alt={'ค้นหา'} className="w-6 h-6" />
              </button>
            </div>
            <div className="row-start-2 row-span-2 col-start-8 col-span-1 px-2 flex justify-center space-x-2 items-center ">
              <button className="w-[80%] h-[80%] rounded-sm text-black font-bold bg-blue-400 hover:bg-slate-200 active:bg-slate-300 flex flex-col items-center justify-center space-x-2 ">
                <img src={print} alt={'ค้นหา'} className="w-12 h-12" />
              </button>
            </div>
            <div className="row-start-2 row-span-1 col-start-9 col-span-2 px-2 flex justify-start space-x-2 items-center">
              <span className="font-bold">รับเข้า : </span>
              <span className="font-bold">{'0'}</span>
            </div>
            <div className="row-start-3 row-span-1 col-start-9 col-span-2 px-2 flex justify-start space-x-2 items-center">
              <span className="font-bold">จ่ายออก : </span>
              <span className="font-bold">{'0'}</span>
            </div>
            <div className="row-start-2 row-span-1 col-start-11 col-span-2 px-2 flex justify-start space-x-2 items-center">
              <span className="font-bold">คืนยา : </span>
              <span className="font-bold">{'0'}</span>
            </div>
            <div className="row-start-3 row-span-1 col-start-11 col-span-2 px-2 flex justify-start space-x-2 items-center">
              <span className="font-bold">คงเหลือ : </span>
              <span className="font-bold">{'0'}</span>
            </div>
          </div>
          <div className="h-[85%] w-full p-2">
            <div className=" border border-collapse border-black w-full h-full bg-white">
              <div className="max-h-full w-full overflow-auto">
                <table className="w-full border-collapse bg-white border border-gray-400">
                  <thead className="stick top-0 ">
                    <tr>
                      <th className="border border-gray-300 p-2 text-xs min-w-[120px]">
                        วันที่
                      </th>
                      <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                        ใบเบิก
                      </th>
                      <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                        รับเข้า
                      </th>
                      <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                        คืนยา
                      </th>
                      <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                        จ่ายออก
                      </th>
                      <th className="border border-gray-300 p-2 text-xs  min-w-[120px]">
                        คงเหลือ
                      </th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalEXP}
        onRequestClose={() => setModalEXP(false)}
        className=" z-10 w-[80%] h-[80%] bg-white flex justify-center items-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center"
      >
        <div className="h-full w-full">
          <HeaderModal
            label={`*รายการยาที่ใกล้หมดอายุ*`}
            closePage={() => setModalEXP(false)}
          />
          <div className="w-full h-[95%]">
            <div className="flex justify-center items-center h-[10%] w-[100%] space-x-3 ">
              <span>วันที่ EXP : </span>
              <input
                type="date"
                className="border border-collapse border-black px-2"
              />
              <span>ถึง : </span>
              <input
                type="date"
                className="border border-collapse border-black px-2"
              />
              <button className="w-[2.5%] h-[50%] p-1 bg-green-300 rounded hover:bg-gray-500 active:bg-gray-300 flex justify-center items-center">
                <img
                  src={searchBlack}
                  alt="ค้นหา"
                  className="w-[90%] h-[90%]"
                />
              </button>
            </div>
            <div className="w-full h-[90%] bg-red-200"></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
const HeaderModal = ({ label, closePage }) => {
  return (
    <div className="w-full h-[7%] py-2 bg-blue-900 flex items-center justify-between px-5 ">
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
