// FrmDataTable.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { API_SCREEN } from '../../config';

import { useNavigate } from 'react-router-dom';
// import { labResult } from '../../../back/services/medicationProfile/lab';

export default function FrmDataTable({ ptstatus, orderdate }) {
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [patients, setPatients] = useState([]);
  // const [orderdate, setOrderdate] = useState('2024-05-30');
  // const [ptstatus, setPtstatus] = useState('');

  // Fetch ward data on component mount
  useEffect(() => {
    console.log('ส่งไป backend:', { ptstatus, orderdate }); // <-- เพิ่มบรรทัดนี้ดูค่า

    axios
      .post(API_SCREEN + '/first', {
        ptstatus: ptstatus,
        orderdate: orderdate,
      })
      .then((response) => {
        console.log('Response จาก backend:', response.data);
        setWards(response.data);
      })

      .catch((error) => {
        console.error('There was an error fetching the ward data!', error);
      });
  }, [ptstatus, orderdate]); // เรียก API ใหม่เมื่อค่ามีการเปลี่ยน

  // Fetch patient data when selectedWard, orderdate, or ptstatus changes
  useEffect(() => {
    if (selectedWard) {
      axios
        .post(API_SCREEN + '/second', {
          orderdate: orderdate,
          ptstatus: ptstatus,
          wardcode: selectedWard.wardcode,
        })
        .then((response) => {
          setPatients(response.data);
        })
        .catch((error) => {
          console.error('There was an error fetching the patient data!', error);
        });
    }
  }, [selectedWard, orderdate, ptstatus]);
  const [selectedRadio, setSelectedRadio] = useState('all');

  const navigate = useNavigate();

  const handleDoubleClick = async (an, hn) => {
    try {
      const fetchWithErrorHandling = (apiCall) => {
        return apiCall.catch((error) => {
          console.error('Error in API call:', error);
          return null; // Return null or default value
        });
      };

      const [
        responseView,
        response144,
        responselabResult,
        responsenoteDrp,
        responsemedIPD,
        responsedrugallergy,
      ] = await Promise.all([
        fetchWithErrorHandling(
          axios.post(API_SCREEN + '/Profile_private_hn', { hn })
        ),
        fetchWithErrorHandling(
          axios.post(API_SCREEN + '/Profile_private_an', { an })
        ),
        fetchWithErrorHandling(axios.post(API_SCREEN + '/labResult', { hn })),
        fetchWithErrorHandling(axios.post(API_SCREEN + '/noteDrp', { hn })),
        fetchWithErrorHandling(
          axios.post(API_SCREEN + '/medIPD', { an, roomType: 'IPD' })
        ), // ✅ เพิ่ม roomType: 'IPD'
        fetchWithErrorHandling(axios.post(API_SCREEN + '/drugallergy', { hn })),
      ]);
      console.log('ส่งค่ายาจาก medIPD:', responsemedIPD?.data);

      console.log('AN sent to backend:', an);
      console.log('HN sent to backend:', hn);

      navigate('/mainIPD', {
        state: {
          // ข้อมูลสำหรับ /mainIPD
          patientDataView: responseView?.data || {},
          patientData144: response144?.data || {},
          labResult: responselabResult?.data || [],
          noteDrp: responsenoteDrp?.data || [],
          medIPD: responsemedIPD?.data || [],
          drugAllergyData: responsedrugallergy?.data || '',

          // ข้อมูลเพิ่มเติมสำหรับ FrmProfile
          profileData: responseView?.data || {}, // ตัวอย่างข้อมูลที่อาจจะเกี่ยวข้องกับ Profile
        },
      });
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  ///////////// version มีconsolelog และ api อื่นๆก็จะใช้ไม่ได้เมื่อมีตัวไหนพัง
  // const handleDoubleClick = async (an, hn) => {
  //   try {
  //     const [
  //       responseView,
  //       response144,
  //       responselabResult,
  //       responsenoteDrp,
  //       responsemedIPD,
  //       responsedrugallergy,
  //     ] = await Promise.all([
  //       axios.post(API_SCREEN+ '/Profile_private_hn', { hn: hn }),
  //       axios.post(API_SCREEN+ '/Profile_private_an', { an: an }),
  //       axios.post(API_SCREEN+ '/labResult', { hn: hn }),
  //       axios.post(API_SCREEN+ '/noteDrp', { hn: hn }),
  //       axios.post(API_SCREEN+ '/medIPD', { an: an }),
  //       axios.post(API_SCREEN+ '/drugallergy', { hn: hn }),
  //     ]);

  //     console.log('AN sent to backend:', an);
  //     console.log('HN sent to backend:', hn);

  //     if (
  //       responseView.status === 200 &&
  //       response144.status === 200 &&
  //       responselabResult.status === 200 &&
  //       responsenoteDrp.status === 200 &&
  //       responsemedIPD.status === 200 &&
  //       responsedrugallergy.status === 200
  //     ) {
  //       console.log('ข้อมูลจาก Profile_private_hn:', responseView.data);
  //       console.log('ข้อมูลจาก Profile_private_an:', response144.data);
  //       console.log('ข้อมูลจาก labResult_hn:', responselabResult.data);
  //       console.log('ข้อมูลจาก noteDrp_hn:', responsenoteDrp.data);
  //       console.log('ข้อมูลจาก medIPD_an:', responsemedIPD.data);
  //       console.log('ข้อมูลจาก drugallergy:', responsedrugallergy.data);

  //       navigate('/mainIPD', {
  //         state: {
  //           patientDataView: responseView.data,
  //           patientData144: response144.data,
  //           labResult: responselabResult.data,
  //           noteDrp: responsenoteDrp.data,
  //           noteDrpData: responsenoteDrp.data,
  //           medIPD: responsemedIPD.data,
  //           drugAllergyData: responsedrugallergy.data, // ใช้ชื่อใหม่เพื่อไม่ให้ซ้ำ
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error fetching patient data:', error);
  //   }
  // };

  ///////////version เก่าสุด
  // const handleDoubleClick = async (an) => {
  //   try {
  //     const response = await axios.post(API_SCREEN+ '/test', { an: an });

  //     // ถ้า API สำเร็จ ให้เปลี่ยนหน้าไปพร้อมส่งข้อมูลจาก API
  //     navigate('/mainIPD', {
  //       state: { patientData: response.data, success: true },
  //     });
  //   } catch (error) {
  //     console.error('Error fetching patient data:', error);

  //     // ถ้า API ล้มเหลว ก็ยังเปลี่ยนหน้าไป พร้อมส่งข้อมูลแสดง error
  //     navigate('/mainIPD', {
  //       state: { error: 'Failed to fetch patient data', success: false },
  //     });
  //   }
  // };

  // const handleDoubleClick = (an) => {
  //   // เมื่อดับเบิ้ลคลิก จะเปลี่ยนหน้าไปที่ FrmProfile โดยส่ง an ไปด้วย
  //   navigate('/mainIPD', {
  //     state: { an: an },
  //   });
  // };

  return (
    <div className=" h-full flex w-screen">
      <div className="h-full w-1/4 border-2 border-gray-300 flex flex-col px-2">
        <div className="h-full overflow-auto px-2 ">
          <table className="w-full min-w-full">
            <thead className="bg-custom-r1 sticky top-0">
              <tr>
                <th className="px-4 py-2 border border-gray-300">หอผู้ป่วย</th>
                <th className="px-4 py-2 border border-gray-300">จำนวน</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wards.map((ward, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-400 hover:text-white active:bg-blue-700 cursor-pointer"
                  onClick={() => setSelectedWard(ward)}
                >
                  <td className="px-4 py-2 border border-gray-300">
                    {ward.warddesc}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center">
                    {ward.countadmit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-3/4 max-h-full   border-2 border-gray-300 ml-2 overflow-auto ">
        <div className="w-full h-8 bg-custom-r3 flex justify-between items-center">
          <div className="w-2/4 h-full flex justify-around items-center px-5">
            <h4 className="font-bold">
              รหัสหอผู้ป่วย : {selectedWard ? selectedWard.wardcode : ''}
            </h4>
            <h4 className="font-bold">
              ชื่อหอผู้ป่วย : {selectedWard ? selectedWard.warddesc : ''}
            </h4>
          </div>
          <div className="w-2/4 h-full flex justify-around items-center px-5">
            <div>
              <label className="mr-2">แสดงทั้งหมด</label>
              <input
                value="all"
                checked={selectedRadio === 'all'}
                type="radio"
                name="patientStatus"
                onChange={(event) => {
                  setSelectedRadio(event.target.value);
                  setPtstatus('');
                }}
              />
            </div>
            <div>
              <label className="mr-2">ไม่มีใบสั่งยา</label>
              <input
                type="radio"
                name="patientStatus"
                value="haveNot"
                checked={selectedRadio === 'haveNot'}
                onChange={(event) => {
                  setSelectedRadio(event.target.value);
                  setPtstatus(' AND dbo.ms_patientadmit.DCdatetime is null');
                }}
              />
            </div>
            <div>
              <label className="mr-2">มีใบสั่งยา</label>
              <input
                type="radio"
                name="patientStatus"
                value="have"
                checked={selectedRadio === 'have'}
                onChange={(event) => {
                  const startDate = new Date();
                  const endDate = new Date();

                  setSelectedRadio(event.target.value);
                  endDate.setHours(23, 59, 59);
                  setPtstatus(
                    ` AND dbo.ms_patientadmit.DCdatetime BETWEEN '${startDate
                      .toISOString()
                      .slice(0, 19)
                      .replace('T', ' ')}' AND '${endDate
                      .toISOString()
                      .slice(0, 19)
                      .replace('T', ' ')}'`
                  );
                }}
              />
            </div>
          </div>
        </div>
        <div className="">
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-custom-r1 sticky top-0">
                <th className="text-left p-2">Admit Date</th>
                <th className="p-2 text-center">HN</th>
                <th className="p-2 text-center">AN</th>
                <th className="p-2 text-center">ชื่อ - นามสกุล</th>
                <th className="p-2 text-center">จำนวนใบสั่งยา</th>
                <th className="p-2 text-center">หอผู้ป่วย</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((record, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-400 hover:text-white active:bg-blue-700 cursor-pointer"
                  // เพิ่มการใช้งาน onDoubleClick เพื่อเรียก API และเปลี่ยน route
                  onDoubleClick={() => {
                    console.log('AN:', record.an); // แสดงค่า an ใน console เมื่อมีการดับเบิ้ลคลิก
                    handleDoubleClick(record.an, record.hn); // ส่งค่า an ไปยังฟังก์ชัน handleDoubleClick
                  }}
                >
                  <td className="p-2">
                    {new Date(record.admitteddate).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-center">{record.hn}</td>
                  <td className="p-2 text-center">{record.an}</td>
                  <td className="p-2 text-center">{record.patientname}</td>
                  <td className="p-2 text-center">{record.SumPresc}</td>
                  <td className="p-2 text-center">{record.warddesc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
