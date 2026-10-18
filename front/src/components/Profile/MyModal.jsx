import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
//////////////////////////////  ชื่อยา  /////////////////////////////////////////
const MyModal = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [showTMT, setShowTMT] = useState(false);
  const [data, setData] = useState([]); // ✅ ต้องมีบรรทัดนี้

  useEffect(() => {
    const fetchData = async () => {
      if (query.trim() === '') {
        setData([]);
        return;
      }

      const url = showTMT
        ? API_URL +
          `/dose/getDoseBySearch?chkKeydrug=true&txtorderitemname=${query}`
        : API_URL + `/dose/getDoseBySearch?txtorderitemname=${query}`;

      try {
        const response = await axios.get(url);
        let result;

        if (showTMT) {
          // กรณี showTMT = true คาดว่า response.data เป็น object มี recordset
          result = response.data.recordset || [];
        } else {
          // กรณี showTMT = false คาดว่า response.data เป็น array ตรง ๆ
          result = Array.isArray(response.data) ? response.data : [];
        }

        setData(result);
      } catch (err) {
        console.error('API error:', err);
        setData([]);
      }
    };

    fetchData();
  }, [query, showTMT]);

  /////////////////////////////////////////////////////////////////////
  const [diluentQuery, setDiluentQuery] = useState('');
  const [filteredDiluentData, setFilteredDiluentData] = useState([]);
  const [selectedDiluent, setSelectedDiluent] = useState(null);
  const [isDiluentLoading, setIsDiluentLoading] = useState(false);

  // FETCH API
  const fetchDiluentData = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredDiluentData([]);
      return;
    }

    setIsDiluentLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/dose/getDiluentname?txtdiluentname=${encodeURIComponent(searchTerm)}`
      );

      if (response.ok) {
        const result = await response.json();
        const data = result?.recordset || [];
        setFilteredDiluentData(data);
      } else {
        console.error('Failed to fetch diluent data:', response.status);
        setFilteredDiluentData([]);
      }
    } catch (error) {
      console.error('Error fetching diluent data:', error);
      setFilteredDiluentData([]);
    } finally {
      setIsDiluentLoading(false);
    }
  };

  // DEBOUNCE
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDiluentData(diluentQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [diluentQuery]);

  // HANDLE SELECT
  const handleSelectDiluent = (item) => {
    setSelectedDiluent(item);
    setDiluentQuery(item.diluentname); // ใช้ชื่อแสดงใน input
    setFilteredDiluentData([]); // ปิด dropdown
  };

  /////////////////////////////////////////////////////////////////////

  const filteredData =
    query === '' || !Array.isArray(data)
      ? []
      : data.filter(
          (item) =>
            (item.orderitemENname || '')
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            (item.TradeName || '')
              .toLowerCase()
              .includes(query.toLowerCase()) ||
            (item.ActiveIngredient || '')
              .toLowerCase()
              .includes(query.toLowerCase())
        );

  const handleToggle = (value) => {
    if (selected === value) {
      setSelected(null); // ถ้าคลิกซ้ำที่อันเดิม → ยกเลิกการเลือก
    } else {
      setSelected(value); // ถ้าคลิกอันใหม่ → เลือกอันนั้น
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedOption, setSelectedOption] = useState('unit');

  const options = [
    { value: 'unit', label: 'ตามหน่วยย่อย' },
    { value: 'adjusted', label: 'หน่วยย่อยแล้วปรับหน่วยขาย' },
    { value: 'fulltime', label: 'เต็มหน่วยเวลา' },
    { value: 'short', label: 'จ่ายขาด' },
  ];

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());

  const [selectedValue, setSelectedValue] = useState('bsa');

  const handleChange = (event) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    // ใช้งานค่าทันที
    console.log('ผู้ใช้เลือก:', newValue);
    // ตัวอย่าง: เรียก API หรือเปลี่ยนค่าคำนวณ
    // fetch(`/api/data?type=${newValue}`).then(...)
  };

  const [group1, setGroup1] = useState('');
  const [group2, setGroup2] = useState('');

  const handleGroup1Change = (value) => {
    setGroup1((prev) => (prev === value ? '' : value));
  };

  const handleGroup2Change = (value) => {
    setGroup2((prev) => (prev === value ? '' : value));
  };

  const [value, setValue] = useState('yes');

  //////////////////////////   วิธีใช้   ///////////////////////////
  const [instructionQuery, setInstructionQuery] = useState(''); // ข้อความค้นหา
  const [filteredInstructionData, setFilteredInstructionData] = useState([]); // ผลลัพธ์จาก API
  const [selectedInstruction, setSelectedInstruction] = useState(null); // เก็บ item ที่เลือก
  const [isLoading, setIsLoading] = useState(false); // สถานะโหลด

  // ฟังก์ชันเรียก API
  const fetchInstructionData = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredInstructionData([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        API_URL +
          `/dose/getInstruction/?txtInstructionName=${encodeURIComponent(searchTerm)}`
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Instruction data:', result);

        const data = result?.recordset || []; // ดึงข้อมูลจาก recordset
        setFilteredInstructionData(data);
      } else {
        console.error('Failed to fetch instructions:', response.status);
        setFilteredInstructionData([]);
      }
    } catch (error) {
      console.error('Error fetching instructions:', error);
      setFilteredInstructionData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // debounce การค้นหา
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInstructionData(instructionQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [instructionQuery]);

  // เมื่อเลือกจาก dropdown
  const handleSelectInstruction = (item) => {
    setSelectedInstruction(item);
    setInstructionQuery(item.InstructionNameTH); // ใส่ชื่อวิธีใช้ใน input
    setFilteredInstructionData([]); // ปิด dropdown
  };
  ///////////////////////////     ความถี่    //////////////////////////////////
  // STATE
  const [frequencyQuery, setFrequencyQuery] = useState('');
  const [filteredFrequencyData, setFilteredFrequencyData] = useState([]);
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [isFrequencyLoading, setIsFrequencyLoading] = useState(false);

  // FETCH API
  const fetchFrequencyData = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredFrequencyData([]);
      return;
    }

    setIsFrequencyLoading(true);
    try {
      const response = await fetch(
        API_URL +
          `/dose/getFrequency?txtFrequencycode=${encodeURIComponent(searchTerm)}`
      );

      if (response.ok) {
        const result = await response.json();
        const data = result?.recordset || [];
        setFilteredFrequencyData(data);
      } else {
        console.error('Failed to fetch frequency:', response.status);
        setFilteredFrequencyData([]);
      }
    } catch (error) {
      console.error('Error fetching frequency:', error);
      setFilteredFrequencyData([]);
    } finally {
      setIsFrequencyLoading(false);
    }
  };

  // DEBOUNCE
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchFrequencyData(frequencyQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [frequencyQuery]);

  // เมื่อเลือกความถี่
  const handleSelectFrequency = (item) => {
    setSelectedFrequency(item);
    setFrequencyQuery(item.frequency_code); // ใส่รหัสใน input
    setFilteredFrequencyData([]); // ปิด dropdown
  };

  ////////////////////////////// เวลา /////////////////////////////////
  // STATE
  const [timeQuery, setTimeQuery] = useState('');
  const [filteredTimeData, setFilteredTimeData] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isTimeLoading, setIsTimeLoading] = useState(false);

  // FETCH TIME API
  const fetchTimeData = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredTimeData([]);
      return;
    }

    setIsTimeLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/dose/getTimeCode?txttimecode=${encodeURIComponent(searchTerm)}`
      );

      if (response.ok) {
        const result = await response.json();
        const data = result?.recordset || [];
        setFilteredTimeData(data);
      } else {
        console.error('Failed to fetch time data:', response.status);
        setFilteredTimeData([]);
      }
    } catch (error) {
      console.error('Error fetching time data:', error);
      setFilteredTimeData([]);
    } finally {
      setIsTimeLoading(false);
    }
  };

  // DEBOUNCE
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTimeData(timeQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [timeQuery]);

  // HANDLE SELECT
  const handleSelectTime = (item) => {
    setSelectedTime(item);
    setTimeQuery(item.timecode); // แสดง timecode ในช่องค้นหา
    setFilteredTimeData([]); // ปิด dropdown
  };
  ////////////////////////////////// หน่วย Vol, Dose, จำนวนจ่าย ///////////////////////////////////////////

  const [orderUnitQuery, setOrderUnitQuery] = useState('');
  const [filteredOrderUnits, setFilteredOrderUnits] = useState([]);
  const [selectedOrderUnit, setSelectedOrderUnit] = useState(null);
  const [isOrderUnitLoading, setIsOrderUnitLoading] = useState(false);

  const fetchOrderUnits = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredOrderUnits([]);
      return;
    }

    setIsOrderUnitLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/dose/getOrderUnit?txtOrderUnit=${encodeURIComponent(searchTerm)}`
      );

      if (response.ok) {
        const result = await response.json();
        const data = result?.recordset || [];
        setFilteredOrderUnits(data);
      } else {
        console.error('Failed to fetch Order Units:', response.status);
        setFilteredOrderUnits([]);
      }
    } catch (error) {
      console.error('Error fetching Order Units:', error);
      setFilteredOrderUnits([]);
    } finally {
      setIsOrderUnitLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOrderUnits(orderUnitQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [orderUnitQuery]);

  const handleSelectOrderUnit = (item) => {
    setSelectedOrderUnit(item);
    setOrderUnitQuery(item.DispensedTotalUnitEN);
    setFilteredOrderUnits([]);
  };

  ////////////////////////////////////////////////////////////////

  // สำหรับช่อง Dose (input ขวา)
  const [doseUnitQuery, setDoseUnitQuery] = useState('');
  const [filteredDoseUnits, setFilteredDoseUnits] = useState([]);
  const [selectedDoseUnit, setSelectedDoseUnit] = useState(null);
  const [isDoseUnitLoading, setIsDoseUnitLoading] = useState(false);

  // ดึงข้อมูลจาก API ใหม่
  const fetchDoseUnits = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredDoseUnits([]);
      return;
    }

    setIsDoseUnitLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/dose/getOrderUnit?txtOrderUnit=${encodeURIComponent(searchTerm)}`
      );

      if (response.ok) {
        const result = await response.json();
        const data = result?.recordset || [];
        setFilteredDoseUnits(data);
      } else {
        console.error('Failed to fetch Dose Units:', response.status);
        setFilteredDoseUnits([]);
      }
    } catch (error) {
      console.error('Error fetching Dose Units:', error);
      setFilteredDoseUnits([]);
    } finally {
      setIsDoseUnitLoading(false);
    }
  };

  // debounce เวลา user พิมพ์
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDoseUnits(doseUnitQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [doseUnitQuery]);

  // เมื่อเลือกจากตาราง
  const handleSelectDoseUnit = (item) => {
    setSelectedDoseUnit(item);
    setDoseUnitQuery(item.DispensedTotalUnitEN); // แสดง code ในช่อง input
    setFilteredDoseUnits([]);
  };

  ////

  // สำหรับช่อง "จำนวนจ่าย"
  const [dosePayUnitQuery, setDosePayUnitQuery] = useState('');
  const [filteredDosePayUnits, setFilteredDosePayUnits] = useState([]);
  const [selectedDosePayUnit, setSelectedDosePayUnit] = useState(null);
  const [isDosePayLoading, setIsDosePayLoading] = useState(false);

  const fetchDosePayUnits = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredDosePayUnits([]);
      return;
    }

    setIsDosePayLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/dose/getOrderUnit?txtOrderUnit=${encodeURIComponent(searchTerm)}`
      );

      if (response.ok) {
        const result = await response.json();
        const data = result?.recordset || [];
        setFilteredDosePayUnits(data);
      } else {
        console.error('Failed to fetch DosePay Units:', response.status);
        setFilteredDosePayUnits([]);
      }
    } catch (error) {
      console.error('Error fetching DosePay Units:', error);
      setFilteredDosePayUnits([]);
    } finally {
      setIsDosePayLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDosePayUnits(dosePayUnitQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [dosePayUnitQuery]);

  const handleSelectDosePayUnit = (item) => {
    setSelectedDosePayUnit(item);
    setDosePayUnitQuery(item.DispensedTotalUnitTH);
    setFilteredDosePayUnits([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 rounded-2xl">
      <div className="bg-white w-[85vw] h-[88vh]  shadow-lg relative flex flex-col overflow-hidden rounded-2xl">
        {/* ปุ่มปิด */}
        <div className="bg-gray-500 p-4 text-white">เพิ่ม/แก้ไข รายการยา</div>
        <button
          onClick={onClose}
          className="absolute px-3 top-2 right-2 text-xl font-bold text-gray-700 hover:text-red-500"
        >
          ×
        </button>

        {/* เนื้อหา */}
        <div className="w-full bg-gray-200 h-full flex flex-col">
          <div className="h-[90%] w-full flex">
            <div className="bg-gray-200 flex flex-col w-[60%]">
              <div className="bg-gray-200 flex items-center pl-4 h-[10%] space-x-4">
                <span>แพทย์</span>
                <input
                  type="text"
                  placeholder="กรอกชื่อแพทย์"
                  className="border border-gray-400 rounded px-2 py-1 w-[200px]"
                />
                {/* Radio Buttons */}
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name="doctorOption"
                      value="option1"
                      className="form-radio text-blue-600"
                    />
                    <span>เวรเช้า</span>
                  </label>

                  <label className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name="doctorOption"
                      value="option2"
                      className="form-radio text-blue-600"
                    />
                    <span>เวรบ่าย</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-200 flex flex-row  h-[20%]">
                <div className="bg-gray-200 flex flex-col w-[80%] ">
                  <div className="bg-gray-200 h-[33.33%] flex flex-row">
                    <div className="bg-gray-200 flex flex-row items-center w-[60%]">
                      <span className="ml-auto p-1">ชนิดใบสั่งยา :</span>

                      <input
                        type="text"
                        defaultValue="0"
                        className="border border-gray-400 rounded px-2 py-1 w-[25px] text-right"
                      />

                      <input
                        type="text"
                        defaultValue="ใบสั่งยาผู้ป่วยใน"
                        className="border border-gray-400 rounded mr-2 px-2 py-1 w-[160px]"
                      />
                    </div>
                    <div className="bg-gray-200 text-green-900 flex flex-col justify-center w-[40%]">
                      <div className="pl-3">0 = ใบสั่งยาผู้ป่วยใน</div>
                      <div className="pl-3">3 = ใบสั่งยาเพิ่มเติม</div>
                    </div>
                  </div>

                  <div className="bg-green-700 h-[33.33%] flex flex-row ">
                    <div className="bg-gray-200 flex flex-row items-center w-[60%] ">
                      <span className="ml-auto p-1">ประเภท :</span>

                      <input
                        type="text"
                        defaultValue="Oneday"
                        className="border border-gray-400 rounded mr-2 px-2 py-1 w-[185px]"
                      />
                    </div>
                    <div className="bg-gray-200 flex flex-row items-center w-[40%]">
                      <input
                        type="checkbox"
                        checked={showTMT}
                        onChange={() => setShowTMT(!showTMT)}
                      />
                      <span className="p-1">เปิดการใช้งานคีย์ยานอก รพ. F3</span>
                    </div>
                  </div>
                  <div className="bg-gray-200 h-[33.341%] flex flex-row items-center">
                    <span className="">ชื่อยา :</span>

                    <Combobox value={selected} onChange={setSelected}>
                      <div className="relative w-[500px]">
                        <Combobox.Input
                          className="w-full border p-2 rounded text-sm"
                          onChange={(e) => setQuery(e.target.value)}
                          displayValue={(item) =>
                            item
                              ? showTMT
                                ? item.TradeName
                                : item.orderitemENname
                              : ''
                          }
                          placeholder="ค้นหายา..."
                        />

                        {query !== '' && filteredData.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
                            <div className="max-h-[240px] overflow-y-auto">
                              <table className="w-full text-sm table-fixed border-collapse">
                                <thead className="bg-gray-100 sticky top-0">
                                  <tr>
                                    {showTMT ? (
                                      <>
                                        <th className="px-2 py-1 w-1/6 text-left">
                                          TMT
                                        </th>
                                        <th className="px-2 py-1 w-1/6 text-left">
                                          Demanic
                                        </th>
                                        <th className="px-2 py-1 w-1/6 text-left">
                                          ชื่อการค้า
                                        </th>
                                        <th className="px-2 py-1 w-1/6 text-left">
                                          ความแรง
                                        </th>
                                        <th className="px-2 py-1 w-1/6 text-left">
                                          ผู้ผลิต
                                        </th>
                                        <th className="px-2 py-1 w-1/6 text-left">
                                          DosesageForm
                                        </th>
                                        <th className="px-2 py-1 w-1/6 text-left">
                                          DispUnit
                                        </th>
                                      </>
                                    ) : (
                                      <>
                                        <th className="px-2 py-1 w-1/4 text-left">
                                          รหัสยา
                                        </th>
                                        <th className="px-2 py-1 w-1/2 text-left">
                                          ชื่อยา
                                        </th>
                                      </>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredData.map((item) => (
                                    <tr
                                      key={item.id}
                                      className="cursor-pointer hover:bg-blue-100"
                                      onClick={() => {
                                        setSelected(item);
                                        setQuery('');
                                      }}
                                    >
                                      {showTMT ? (
                                        <>
                                          <td className="px-2 py-1">
                                            {item.TPUCode}
                                          </td>
                                          <td className="px-2 py-1">
                                            {item.ActiveIngredient}
                                          </td>
                                          <td className="px-2 py-1">
                                            {item.TradeName}
                                          </td>
                                          <td className="px-2 py-1">
                                            {item.Strength}
                                          </td>
                                          <td className="px-2 py-1">
                                            {item.Manufacturer}
                                          </td>
                                          <td className="px-2 py-1">
                                            {item.Dosageform}
                                          </td>
                                          <td className="px-2 py-1">
                                            {item.DispUnit}
                                          </td>
                                        </>
                                      ) : (
                                        <>
                                          <td className="px-2 py-1">
                                            {item.orderitemcode}
                                          </td>
                                          <td className="px-2 py-1">
                                            {item.orderitemENname}
                                          </td>
                                        </>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </Combobox>

                    <input
                      type="text"
                      defaultValue="0"
                      className="border text-center border-gray-400 rounded text-red-500 px-2 py-1 w-[50px]"
                    />
                  </div>
                </div>
                <div className="bg-green-500 flex flex-col w-[20%]">
                  <div className="bg-green-900 flex flex-row justify-center items-center h-[40%]">
                    <input
                      type="text"
                      defaultValue="0"
                      className="border border-gray-400 rounded px-2 py-1 w-[25px] text-right"
                    />

                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300">
                      Down
                    </button>
                  </div>
                  <div className="bg-red-300 flex items-center h-[60%]">
                    233
                  </div>
                </div>
              </div>
              <div className="bg-gray-200 flex flex-col h-[10%]">
                <div className="flex items-center gap-1 h-[50%] relative">
                  <span className="pl-12">ตัวทำละลาย :</span>

                  <div className="relative w-[500px]">
                    <input
                      type="text"
                      className="border border-gray-400 rounded px-2 py-1 bg-white text-gray-800 w-full h-[29px]"
                      value={diluentQuery}
                      onChange={(e) => {
                        setDiluentQuery(e.target.value);
                        setSelectedDiluent(null);
                      }}
                      placeholder="ค้นหาตัวทำละลาย..."
                    />

                    {isDiluentLoading && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      </div>
                    )}

                    {filteredDiluentData.length > 0 && !selectedDiluent && (
                      <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
                        <div className="max-h-[240px] overflow-y-auto">
                          <table className="w-full text-sm table-fixed border-collapse">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-2 py-1 w-1/2 text-left">
                                  ตัวทำละลาย
                                </th>
                                <th className="px-2 py-1 w-1/4 text-left">
                                  vol
                                </th>
                                <th className="px-2 py-1 w-1/4 text-left">
                                  tmtcode
                                </th>
                                <th className="px-2 py-1 w-1/4 text-left">
                                  orderitemcode1
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDiluentData.map((item, index) => (
                                <tr
                                  key={item.diluentorderitemcode || index}
                                  className="cursor-pointer hover:bg-blue-100"
                                  onClick={() => handleSelectDiluent(item)}
                                >
                                  <td className="px-2 py-1">
                                    {item.diluentname}
                                  </td>
                                  <td className="px-2 py-1">{item.vol}</td>
                                  <td className="px-2 py-1">{item.tmtcode}</td>
                                  <td className="px-2 py-1">
                                    {item.diluentorderitemcode}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300">
                    Add+
                  </button>
                </div>

                <div className="flex items-center gap-1 h-[50%]">
                  <span className="flex pl-[98px]">Vol:</span>

                  <input
                    type="text"
                    defaultValue="0"
                    className="border border-gray-400 rounded h-[30px] bg-orange-100  text-red-500 text-center w-[100px] focus:outline-none "
                  />

                  {/* ช่องขวา: ใช้ค้นหา DispensedTotalUnitCd */}
                  <div className="relative w-[100px]">
                    <input
                      type="text"
                      className="border border-gray-400 rounded h-[30px] bg-purple-200 text-red-500 text-center w-full focus:outline-none"
                      value={orderUnitQuery}
                      onChange={(e) => {
                        setOrderUnitQuery(e.target.value);
                        setSelectedOrderUnit(null); // เคลียร์ค่าเดิมเมื่อพิมพ์ใหม่
                      }}
                      placeholder="ค้นหา"
                    />

                    {/* Loading Spinner */}
                    {isOrderUnitLoading && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      </div>
                    )}

                    {/* Dropdown Table */}
                    {filteredOrderUnits.length > 0 && !selectedOrderUnit && (
                      <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
                        <div className="max-h-[200px] overflow-y-auto">
                          <table className="w-full text-sm table-fixed border-collapse">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-2 py-1 text-left">รหัส</th>
                                <th className="px-2 py-1 text-left">
                                  ชื่อหน่วย
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredOrderUnits.map((item, index) => (
                                <tr
                                  key={item.DispensedTotalUnitCd || index}
                                  className="cursor-pointer hover:bg-blue-100"
                                  onClick={() => handleSelectOrderUnit(item)}
                                >
                                  <td className="px-2 py-1">
                                    {item.DispensedTotalUnitCd}
                                  </td>
                                  <td className="px-2 py-1">
                                    {item.DispensedTotalUnitName}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className=" flex flex-col h-[60%]">
                <div className=" flex space-y-0.5 flex-col h-[45%]  w-full mb-0.5">
                  <div className=" flex items-center pl-7 gap-0.5 h-[30px] w-full ">
                    <span className="pl-6 pr-1">รหัสวิธีใช้ยา:</span>

                    <input
                      type="text"
                      defaultValue="0"
                      className="border border-gray-400 rounded h-[30px] bg-orange-100  text-red-500 text-center w-[100px] focus:outline-none "
                    />
                    <input
                      type="text"
                      defaultValue=""
                      className="border border-gray-400 rounded h-[30px] bg-purple-200 text-red-500 text-center w-[100px] focus:outline-none "
                    />
                  </div>
                  <div className=" flex items-center pl-7 gap-0.5 h-[30px] w-full ">
                    <span className="pl-14 pr-1">Dose :</span>

                    {/* ช่องซ้าย: ปล่อยไว้เหมือนเดิม */}
                    <input
                      type="text"
                      defaultValue="0"
                      className="border border-gray-400 rounded h-[30px] bg-orange-100 text-red-500 text-center w-[100px] focus:outline-none "
                    />

                    {/* ช่องขวา: ใช้ค้นหา DispensedTotalUnitCd จาก API ใหม่ */}
                    <div className="relative w-[100px]">
                      <input
                        type="text"
                        className="border border-gray-400 rounded h-[30px] bg-purple-200 text-red-500 text-center w-full focus:outline-none"
                        value={doseUnitQuery}
                        onChange={(e) => {
                          setDoseUnitQuery(e.target.value);
                          setSelectedDoseUnit(null); // เคลียร์ค่าเดิมเมื่อพิมพ์ใหม่
                        }}
                        placeholder="ค้นหา"
                      />

                      {/* Loading Spinner */}
                      {isDoseUnitLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                        </div>
                      )}

                      {/* Dropdown Table */}
                      {filteredDoseUnits.length > 0 && !selectedDoseUnit && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
                          <div className="max-h-[200px] overflow-y-auto">
                            <table className="w-full text-sm table-fixed border-collapse">
                              <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                  <th className="px-2 py-1 text-left">
                                    ชื่อหน่วย (TH)
                                  </th>
                                  <th className="px-2 py-1 text-left">
                                    ชื่อหน่วย (EN)
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredDoseUnits.map((item, index) => (
                                  <tr
                                    key={item.DispensedTotalUnitCd || index}
                                    className="cursor-pointer hover:bg-blue-100"
                                    onClick={() => handleSelectDoseUnit(item)}
                                  >
                                    <td className="px-2 py-1">
                                      {item.DispensedTotalUnitTH}
                                    </td>
                                    <td className="px-2 py-1">
                                      {item.DispensedTotalUnitEN}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      defaultValue="0"
                      className="border border-gray-400 rounded h-[30px] bg-blue-200 text-blue-500 text-center w-[100px] focus:outline-none "
                    />
                    <span className="pl-14 pr-1">เลือกการคำนวณ: </span>
                    <select
                      className="border border-gray-400 rounded px-2 py-1 bg-white text-gray-800"
                      value={selectedValue}
                      onChange={handleChange}
                    >
                      <option value="bsa">bsa</option>
                      <option value="clcr">clcr</option>
                      <option value="น้ำหนัก">น้ำหนัก</option>
                    </select>
                  </div>
                  <div className="flex items-center pl-8 space-x-0.5 h-[30px] w-full relative">
                    <span className="w-[80px] text-right mr-2">วิธีใช้ :</span>
                    <div className="relative w-[300px]">
                      {/* Input ค้นหา */}
                      <input
                        className="border border-gray-400 rounded h-[30px] bg-purple-200 text-red-500 text-center w-full focus:outline-none"
                        value={instructionQuery}
                        onChange={(e) => {
                          setInstructionQuery(e.target.value);
                          setSelectedInstruction(null); // ถ้าเริ่มพิมพ์ใหม่ ให้ล้างค่าที่เลือก
                        }}
                        placeholder="ค้นหาวิธีใช้..."
                      />

                      {/* Loading spinner */}
                      {isLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      )}

                      {/* Dropdown Table */}
                      {filteredInstructionData.length > 0 &&
                        !selectedInstruction && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
                            <div className="max-h-[240px] overflow-y-auto">
                              <table className="w-full text-sm table-fixed border-collapse">
                                <thead className="bg-gray-100 sticky top-0">
                                  <tr>
                                    <th className="px-2 py-1 w-1/4 text-left">
                                      รหัสวิธีใช้
                                    </th>
                                    <th className="px-2 py-1 w-3/4 text-left">
                                      คำอธิบาย
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredInstructionData.map(
                                    (item, index) => (
                                      <tr
                                        key={item.InstructionCd || index}
                                        className="cursor-pointer hover:bg-blue-100"
                                        onClick={() => {
                                          handleSelectInstruction(item);
                                          setInstructionQuery(
                                            item.InstructionCd
                                          ); // ใส่รหัสที่เลือกลงใน input
                                        }}
                                      >
                                        <td className="px-2 py-1">
                                          {item.InstructionCd}
                                        </td>
                                        <td className="px-2 py-1">
                                          {item.InstructionNameTH}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* ช่องด้านขวา แสดงคำอธิบาย */}
                    <input
                      type="text"
                      value={selectedInstruction?.InstructionNameTH || ''}
                      disabled
                      className="border border-gray-400 rounded h-[30px] bg-gray-200 text-red-500 text-center w-[300px] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center pl-7 space-x-0.5 h-[30px] w-full relative">
                    <span className="pl-12 pr-1">ความถี่ :</span>

                    {/* ช่องค้นหา frequency_code */}
                    <div className="relative w-[300px]">
                      <input
                        type="text"
                        className="border border-gray-400 rounded h-[30px] bg-purple-200 text-red-500 text-center w-full focus:outline-none"
                        value={frequencyQuery}
                        onChange={(e) => {
                          setFrequencyQuery(e.target.value);
                          setSelectedFrequency(null); // ล้างค่าที่เลือกเมื่อพิมพ์ใหม่
                        }}
                        placeholder="ค้นหา..."
                      />

                      {/* Spinner */}
                      {isFrequencyLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                        </div>
                      )}

                      {/* Dropdown */}
                      {filteredFrequencyData.length > 0 &&
                        !selectedFrequency && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
                            <div className="max-h-[240px] overflow-y-auto">
                              <table className="w-full text-sm table-fixed border-collapse">
                                <thead className="bg-gray-100 sticky top-0">
                                  <tr>
                                    <th className="px-2 py-1 w-1/3 text-left">
                                      รหัส
                                    </th>
                                    <th className="px-2 py-1 w-2/3 text-left">
                                      คำอธิบาย
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredFrequencyData.map((item, index) => (
                                    <tr
                                      key={item.frequency_code || index}
                                      className="cursor-pointer hover:bg-blue-100"
                                      onClick={() =>
                                        handleSelectFrequency(item)
                                      }
                                    >
                                      <td className="px-2 py-1">
                                        {item.frequency_code}
                                      </td>
                                      <td className="px-2 py-1">
                                        {item.frequency_nameTH}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* ช่องด้านขวา แสดงชื่อความถี่ */}
                    <input
                      type="text"
                      value={selectedFrequency?.frequency_nameTH || ''}
                      disabled
                      className="border border-gray-400 rounded h-[30px] bg-gray-200 text-red-500 text-center w-[300px] focus:outline-none"
                    />
                  </div>

                  <div className="bg-gray-200 flex items-center pl-7 space-x-0.5 h-[30px] w-full relative">
                    <span className="pl-14 pr-1">เวลา :</span>

                    {/* ช่องค้นหา timecode */}
                    <div className="relative w-[300px]">
                      <input
                        type="text"
                        className="border border-gray-400 rounded h-[30px] bg-purple-200 text-red-500 text-center w-full focus:outline-none"
                        value={timeQuery}
                        onChange={(e) => {
                          setTimeQuery(e.target.value);
                          setSelectedTime(null); // ล้างค่าที่เลือกเมื่อพิมพ์ใหม่
                        }}
                        placeholder="ค้นหาเวลา..."
                      />

                      {/* Spinner */}
                      {isTimeLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                        </div>
                      )}

                      {/* Dropdown */}
                      {filteredTimeData.length > 0 && !selectedTime && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
                          <div className="max-h-[240px] overflow-y-auto">
                            <table className="w-full text-sm table-fixed border-collapse">
                              <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                  <th className="px-2 py-1 w-1/3 text-left">
                                    รหัสเวลา
                                  </th>
                                  <th className="px-2 py-1 w-2/3 text-left">
                                    คำอธิบาย
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTimeData.map((item, index) => (
                                  <tr
                                    key={item.timecode || index}
                                    className="cursor-pointer hover:bg-blue-100"
                                    onClick={() => handleSelectTime(item)}
                                  >
                                    <td className="px-2 py-1">
                                      {item.timecode}
                                    </td>
                                    <td className="px-2 py-1">{item.timeTH}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ช่องด้านขวา แสดง timeTH */}
                    <input
                      type="text"
                      value={selectedTime?.timeTH || ''}
                      disabled
                      className="border border-gray-400 rounded h-[30px] bg-gray-200 text-red-500 text-center w-[300px] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-red-700 h-[55%] w-full flex flex-col ">
                  <div className="flex flex-col justify-center items-center bg-red-400 w-full h-full">
                    <div className="bg-red-400 flex flex-row h-[80%] w-full">
                      <div className=" bg-gray-200 w-[60%]">
                        <div className="flex flex-col">
                          <div className="flex flex-row items-center">
                            <span className="pl-14 pr-1">จำนวนจ่าย :</span>

                            {/* ช่องซ้าย (เหมือนเดิม) */}
                            <input
                              type="text"
                              defaultValue="0"
                              className="border border-gray-400 rounded h-[30px] bg-orange-100 text-red-500 text-center w-[100px] focus:outline-none "
                            />

                            {/* ช่องขวา: ใช้ API ใหม่ */}
                            <div className="relative w-[100px]">
                              <input
                                type="text"
                                className="border border-gray-400 rounded h-[30px] bg-purple-200 text-red-500 text-center w-full focus:outline-none"
                                value={dosePayUnitQuery}
                                onChange={(e) => {
                                  setDosePayUnitQuery(e.target.value);
                                  setSelectedDosePayUnit(null); // ล้างค่าที่เลือกเมื่อพิมพ์ใหม่
                                }}
                                placeholder="ค้นหา"
                              />

                              {/* Loading Spinner */}
                              {isDosePayLoading && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                                </div>
                              )}

                              {/* Dropdown Table */}
                              {filteredDosePayUnits.length > 0 &&
                                !selectedDosePayUnit && (
                                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
                                    <div className="max-h-[200px] overflow-y-auto">
                                      <table className="w-full text-sm table-fixed border-collapse">
                                        <thead className="bg-gray-100 sticky top-0">
                                          <tr>
                                            <th className="px-2 py-1 text-left">
                                              ชื่อหน่วย (TH)
                                            </th>
                                            <th className="px-2 py-1 text-left">
                                              ชื่อหน่วย (EN)
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {filteredDosePayUnits.map(
                                            (item, index) => (
                                              <tr
                                                key={
                                                  item.DispensedTotalUnitCd ||
                                                  index
                                                }
                                                className="cursor-pointer hover:bg-blue-100"
                                                onClick={() =>
                                                  handleSelectDosePayUnit(item)
                                                }
                                              >
                                                <td className="px-2 py-1">
                                                  {item.DispensedTotalUnitTH}
                                                </td>
                                                <td className="px-2 py-1">
                                                  {item.DispensedTotalUnitEN}
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>

                          <div className="flex flex-row items-center p-0.5">
                            <span className="pl-10 pr-1">จำนวนวันแรก :</span>
                            <input
                              type="text"
                              defaultValue="0"
                              className="border border-gray-400 rounded h-[30px] bg-orange-100  text-red-500 text-center w-[100px] focus:outline-none "
                            />
                            <input
                              type="text"
                              defaultValue="0"
                              className="border border-gray-400 rounded h-[30px] bg-orange-100  text-red-500 text-center w-[100px] focus:outline-none "
                            />
                          </div>
                          <div className="bg-gray-200 flex flex-col">
                            <div className="flex flex-col">
                              <div className="flex flex-row items-center px-0.5 py-0.5">
                                <label className="pl-14 px-1">
                                  วันที่เริ่มยา :
                                </label>
                                <input
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                  className="border border-gray-400 rounded px-1 py-0.5 mt-1 "
                                />
                              </div>

                              <div className="flex flex-row items-center">
                                <label className="pl-[54px] px-1">
                                  วันที่หยุดยา :
                                </label>
                                <input
                                  type="date"
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                                  className="border border-gray-400 rounded px-1 py-0.5 "
                                />
                                <input
                                  type="text"
                                  defaultValue="1"
                                  className="border border-gray-400 rounded h-[25px] bg-blue-200 text-blue-500 text-center w-[30px] focus:outline-none "
                                />
                              </div>
                            </div>
                            <div className="flex flex-row p-1">
                              <label className="pl-[120px] inline-flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={selected === 'option1'}
                                  onChange={() => handleToggle('option1')}
                                  className="form-checkbox h-3  text-blue-600"
                                />
                                <span>กำหนดวัน off ยา</span>
                              </label>

                              <label className="inline-flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={selected === 'option2'}
                                  onChange={() => handleToggle('option2')}
                                  className="form-checkbox h-3 ml-[30px] text-blue-600"
                                />
                                <span>กำหนดเวลา off ยา</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-[40%] bg-gray-100 space-y-1">
                        <span className="px-2">คำนวนราคา</span>
                        {options.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center space-x-1"
                          >
                            <input
                              type="radio"
                              name="unit-option"
                              value={opt.value}
                              checked={selectedOption === opt.value}
                              onChange={() => setSelectedOption(opt.value)}
                              className="form-radio text-blue-600 ml-2 h-3 w-4"
                            />
                            <span className="text-green-500 font-semibold">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-200 flex items-center w-full h-[20%] p-1 ">
                      <div className="flex flex-row justify-between w-full">
                        <div className="flex flex-wrap items-center gap-4 p-2 border border-gray-500 rounded">
                          {/* กลุ่มที่ 1 */}
                          <label className="inline-flex items-center space-x-1 text-blue-600">
                            <input
                              type="checkbox"
                              checked={group1 === 'label'}
                              onChange={() => handleGroup1Change('label')}
                              className="form-checkbox h-3 w-3"
                            />
                            <span>พิมพ์ฉลาก</span>
                          </label>

                          <label className="inline-flex items-center space-x-1 text-blue-600">
                            <input
                              type="checkbox"
                              checked={group1 === 'machine'}
                              onChange={() => handleGroup1Change('machine')}
                              className="form-checkbox h-3 w-3"
                            />
                            <span>ส่งเครื่อง</span>
                          </label>

                          <label className="inline-flex items-center space-x-1 text-blue-600">
                            <input
                              type="checkbox"
                              checked={group1 === 'produce'}
                              onChange={() => handleGroup1Change('produce')}
                              className="form-checkbox h-3 w-3"
                            />
                            <span>ส่งผลิต</span>
                          </label>

                          {/* กลุ่มที่ 2 */}
                          <label className="inline-flex items-center space-x-1 text-orange-600">
                            <input
                              type="checkbox"
                              checked={group2 === 'chemo'}
                              onChange={() => handleGroup2Change('chemo')}
                              className="form-checkbox h-3 w-3"
                            />
                            <span>ส่ง chemo</span>
                          </label>

                          <label className="inline-flex items-center space-x-1 text-orange-500">
                            <input
                              type="checkbox"
                              checked={group2 === 'tpn'}
                              onChange={() => handleGroup2Change('tpn')}
                              className="form-checkbox h-3 w-3"
                            />
                            <span>ส่ง TPN</span>
                          </label>
                        </div>

                        <div className=" border border-gray-500 rounded p-2 w-fit">
                          <div className="flex space-x-4">
                            <span>ยาเรื้อรัง</span>
                            <label className="inline-flex items-center space-x-1">
                              <input
                                type="radio"
                                name="chronic"
                                value="yes"
                                checked={value === 'yes'}
                                onChange={() => setValue('yes')}
                                className="form-radio text-green-600"
                              />
                              <span className="text-green-600 font-light">
                                เป็น
                              </span>
                            </label>

                            <label className="inline-flex items-center space-x-1">
                              <input
                                type="radio"
                                name="chronic"
                                value="no"
                                checked={value === 'no'}
                                onChange={() => setValue('no')}
                                className="form-radio text-green-600"
                              />
                              <span className="text-green-600 font-light">
                                ไม่เป็น
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-800 w-[40%]">
              <div className="bg-gray-100 h-[20%]">
                <div className="p-4">
                  <table className="w-full border border-black text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black px-2  text-center">
                          ชื่อยา
                        </th>
                        <th className="border border-black px-2  text-center">
                          จำนวน
                        </th>
                        <th className="border border-black px-2  text-center">
                          หน่วย
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black px-2 ">
                          <input
                            type="text"
                            placeholder="กรอกชื่อยา"
                            className="w-full outline-none"
                          />
                        </td>
                        <td className="border border-black px-2 ">
                          <input
                            type="number"
                            placeholder="0"
                            className="w-full text-right outline-none"
                          />
                        </td>
                        <td className="border border-black px-2 ">
                          <input
                            type="text"
                            placeholder="เช่น เม็ด"
                            className="w-full outline-none"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-gray-100 flex justify-center items-center h-[30%] flex-col">
                <div className="w-full p-0.5">
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium mb-1"
                  >
                    ข้อความฉลาก:
                  </label>
                  <textarea
                    id="note"
                    rows="4"
                    className="w-full h-[150px] border border-gray-300 rounded-md  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder=""
                  ></textarea>
                </div>
              </div>
              <div className="bg-gray-100  flex flex-col h-[25%]">
                <div className="w-full p-0.5">
                  <textarea
                    id="note"
                    rows="4"
                    className="w-full h-[120px] border border-gray-300 rounded-md  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder=""
                  ></textarea>
                </div>
                <div className="flex flex-row justify-between">
                  <div>
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked=""
                        onChange=""
                        className="form-checkbox text-green-500 h-4 w-4"
                      />
                      <span className="text-gray-700">เลือกเพียง 1 อัน</span>
                    </label>
                  </div>

                  <div className="pr-10">ชิดขวา</div>
                </div>
              </div>
              <div className="flex flex-row"> </div>
              <div className="bg-gray-100 p-1  h-[25%]">
                <div className="">
                  <table className="w-full border border-black text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black px-2  text-center">
                          เวลา
                        </th>
                        <th className="border border-black px-2  text-center">
                          คำอธิบายเวลา
                        </th>
                        <th className="border border-black px-2  text-center">
                          หน่วย
                        </th>
                        <th className="border border-black px-2  text-center">
                          วันที่
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black px-2 ">
                          <input
                            type="text"
                            placeholder="กรอกชื่อยา"
                            className="w-full outline-none"
                          />
                        </td>
                        <td className="border border-black px-2 ">
                          <input
                            type="text"
                            placeholder=""
                            className="w-full text-right outline-none"
                          />
                        </td>
                        <td className="border border-black px-2 ">
                          <input
                            type="text"
                            placeholder="เช่น เม็ด"
                            className="w-full outline-none"
                          />
                        </td>
                        <td className="border border-black px-2 ">
                          <input
                            type="text"
                            placeholder="เช่น เม็ด"
                            className="w-full outline-none"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[10%] w-full bg-yellow-300 flex flex-row">
            <div className="bg-gray-400 p-1 flex justify-center items-center w-[60%]">
              {/* ปุ่มสถานะ */}
              <div className="pr-10">
                <button className="flex items-center justify-center border border-black bg-white px-6 py-3 hover:bg-green-100 ">
                  <img
                    src="/icons/save.png"
                    alt="save"
                    className="w-8 h-7 mr-3"
                  />
                  <span className="font-bold">สถานะการจ่าย</span>
                </button>
              </div>
              <div className="flex items-center border border-black">
                <div className="flex flex-col">
                  <input
                    type="text"
                    className="p-1 bg-[#ffe8ba] h-6 w-40 border-b border-black"
                    placeholder=""
                  />
                  <input
                    type="text"
                    value="20250528003158"
                    readOnly
                    className="p-1 bg-[#d9d9f3] h-6 w-40 text-center"
                  />
                </div>
              </div>
              <div className="pl-12 flex flex-row">
                {/* ปุ่มบันทึก */}
                <div className="flex p-0.5">
                  <button className="flex items-center justify-center border border-black bg-white px-6 py-3 hover:bg-green-100 ">
                    <img
                      src="/icons/save.png"
                      alt="save"
                      className="w-8 h-7 mr-3"
                    />
                    <span className="font-bold">บันทึก</span>
                  </button>
                </div>
                {/* ปุ่มยกเลิก */}
                <div className="flex p-0.5">
                  <button className="flex items-center justify-center border border-black bg-white px-6 py-3 hover:bg-red-100">
                    <img
                      src="/icons/cancel.png"
                      alt="cancel"
                      className="w-8 h-7 mr-3"
                    />
                    <span className="font-bold">ยกเลิก</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-gray-400 p-1 flex justify-center items-center w-[40%]">
              <div className="flex items-center justify-between w-full">
                {/* ซ้าย */}
                <div>ชิดซ้าย</div>

                {/* ขวา */}
                <div className="flex flex-col ml-auto">
                  <div className="flex items-center justify-end space-x-2">
                    <span>ราคา/หน่วย :</span>
                    <input
                      type="text"
                      defaultValue="0"
                      readOnly
                      className="border bg-black border-gray-400 rounded text-center text-green-300 px-2 py-1 w-[80px]"
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-1">
                    <span>ราคารวม :</span>
                    <input
                      type="text"
                      defaultValue="0"
                      readOnly
                      className="border bg-black border-gray-400 rounded text-center text-green-300 px-2 py-1 w-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyModal;
