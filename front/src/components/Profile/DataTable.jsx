// DataTable.jsx ใหม่ทดสอบแสดงข้อมูลห้องยา iv ipd tpn
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_SCREEN } from '../../../config';

const DataTable = ({ data = [] }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      const updatedData = await Promise.all(
        data.map(async (item) => {
          const status = await checkDispenseStatus(item.meditemindex);
          return { ...item, meditemindexStatus: status };
        })
      );
      setTableData(updatedData);
    };

    if (data.length > 0) {
      fetchStatus();
    }
  }, [data]);

  const checkDispenseStatus = async (index) => {
    try {
      const res = await axios.post(API_SCREEN + '/checkdispense', {
        meditemindex: index,
      });
      return res.data.status;
    } catch {
      return 'ข้อผิดพลาด';
    }
  };

  const handleCheckboxChange = (e, item) => {
    const newStatus = e.target.checked ? 1 : 0;
    console.log(`Item ${item.id} status changed to ${newStatus}`);
    // คุณสามารถส่งข้อมูลนี้กลับไปยัง backend ได้
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="sticky top-0 h-5">
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[20px]">
                ลำดับ
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[20px]">
                สถานะ
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[30px]">
                <input type="checkbox" />
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[30px]">
                group
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[30px]">
                L
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[30px]">
                M
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[30px]">
                V
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[30px]">
                C
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[30px]">
                T
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[70px]">
                ใบอนุมัติ
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[70px]">
                DUE Online
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[30px]">
                MRC
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[30px]">
                Type
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[250px]">
                ชื่อยา
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[20px]"></th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[70px]">
                วิธีคำนวณ
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[60px]">
                คำนวณ
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                จำนวนที่ใช้
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                หน่วย
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[50px]">
                วิธีใช้
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                ความถี่
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                เวลา
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[70px]">
                จำนวนจ่าย
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                หน่วยขาย
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                Firstdose
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                วันที่เริ่ม
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                วันสุดท้ายที่หยุดยา
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                จำนวนวัน
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                ราคาต่อหน่วย
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                ราคารวม
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[300px]">
                วิธีใช้ยา
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                สถานะหยุดยา
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[100px]">
                imecount
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                ผู้สั่ง
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                varymealtime
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                voiddatetime
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                วันที่กิน
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                statusevent
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                tmtcode
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                pricetype
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                dediluentcode
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                didluentstatus
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                displaycolour
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                varymealstatus
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                AppUpto
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                oddatetime
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[80px]">
                วันเว้นวัน
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                freetext3
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[90px]">
                paytype
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                firstdosestatus
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[280px]">
                ordercreatedatetime
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                firsttimecount
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                DIDcode
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                continuestatus
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                holddatetime
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[150px]">
                doctorcode
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[180px]">
                doctorname
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[90px]">
                สถานะเวลาหยุด
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[70px]">
                เวลาเริ่ม
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[70px]">
                เวลาหยุดยา
              </th>
              <th className="p-2 text-center border-collapse border border-gray-200 min-w-[50px]">
                วันanimetest
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((item, index) => (
                // {data.length > 0 ? (
                //   data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="p-2 text-center border">{index + 1}</td>
                  <td className="p-2 text-center border">
                    {/* {item.meditemindex} */}
                    {item.meditemindexStatus}
                  </td>
                  <td className="p-2 text-left border"></td>
                  <td className="p-2 text-center border">{item.groupdrug}</td>
                  <td className="p-2 text-center border">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={item.printstatus === '1'}
                      onChange={(e) => handleCheckboxChange(e, item)}
                    />
                  </td>
                  {/* L */}
                  <td className="p-2 text-center border">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={item.sendmachine === 'Y'}
                    />
                  </td>
                  {/* M */}
                  <td className="p-2 text-center border">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={item.sendmix === 'Y'}
                    />
                  </td>
                  {/* V */}
                  <td className="p-2 text-center border">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={item.sendchemo === 'Y'}
                    />
                  </td>
                  {/* C */}
                  <td className="p-2 text-center border">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={item.sendtpn === 'Y'}
                    />
                  </td>{' '}
                  {/* T */}
                  <td className="p-2 text-center border"></td> {/* ใบอนุมัติ */}
                  <td className="p-2 text-center border"></td> {/* DUE */}
                  <td className="p-2 text-center border">{item.firstdose}</td>
                  {/* <td className="p-2 text-center border">{item.startdate}</td> */}
                  <td className="p-2 text-center border">
                    {item.prioritycode}
                  </td>
                  {/* Type */}
                  <td className="p-2 text-left border">
                    {item.orderitemENname}
                  </td>
                  <td className="p-2 text-right border">{item.totalprice}</td>
                  <td className="p-2 text-center border">
                    {item.statuscal}
                  </td>{' '}
                  {/* วิธีคำนวณ */}
                  <td className="p-2 text-left border">{item.ordertype}</td>
                  <td className="p-2 text-center border">{item.varymeal}</td>
                  <td className="p-2 text-center border">
                    {item.DispensedUnitTH}
                  </td>
                  <td className="p-2 text-center border">
                    {item.instructioncode}
                  </td>{' '}
                  {/* วิธีใช้ */}
                  <td className="p-2 text-center border">
                    {item.frequencycode}
                  </td>{' '}
                  {/* ความถี่ */}
                  <td className="border border-gray-300 p-1">
                    {new Date(item.startdate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-2 text-center border">{item.orderqty}</td>
                  <td className="p-2 text-center border">
                    {item.DispensedTotalUnitTH}
                  </td>
                  {/* หน่วยขาย*/}
                  <td className="p-2 text-center border">{item.firstdose}</td>
                  <td className="border border-gray-300 p-1">
                    {new Date(item.startdate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>{' '}
                  <td className="border border-gray-300 p-1">
                    {new Date(item.enddate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>{' '}
                  <td className="p-2 text-center border"></td>
                  <td className="p-2 text-center border">{item.price}</td>
                  <td className="p-2 text-center border">{item.totalprice}</td>
                  {/* ราคารวม */}
                  <td className="p-2 text-left border">
                    {item.freetext2}
                  </td>{' '}
                  {/* วิธีใช้ยา */}
                  <td className="p-2 text-center border">{item.offstatus}</td>
                  <td className="p-2 text-center border">{item.timecount}</td>
                  <td className="p-2 text-center border">{item.fullname}</td>
                  <td className="p-2 text-center border"></td>
                  <td className="p-2 text-center border"></td>
                  <td className="p-2 text-center border">
                    {new Date(item.takedate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-2 text-center border"></td>
                  <td className="p-2 text-center border">{item.tmtcode}</td>
                  <td className="p-2 text-center border">{item.pricetype}</td>
                  <td className="p-2 text-center border">{item.sendmixcode}</td>
                  <td className="p-2 text-center border">{item.seq}</td>
                  <td className="p-2 text-center border">
                    {item.displaycolour}
                  </td>
                  <td className="p-2 text-center border">
                    {item.varymealstatus}
                  </td>
                  <td className="p-2 text-center border">{item.diluentadd}</td>
                  <td className="p-2 text-center border"></td>
                  <td className="p-2 text-center border">{item.odd}</td>
                  <td className="p-2 text-center border"></td>
                  <td className="p-2 text-center border"></td>
                  <td className="p-2 text-center border">
                    {item.firstdosestatus}
                  </td>
                  <td className="p-2 text-center border">
                    {new Date(item.ordercreatedate).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </td>
                  <td className="p-2 text-center border">
                    {item.firsttimecount}
                  </td>
                  <td className="p-2 text-center border">{item.DIDcode}</td>
                  <td className="p-2 text-center border">
                    {item.continuestatus}
                  </td>
                  <td className="p-2 text-center border"></td>
                  <td className="p-2 text-center border">{item.doctorcode}</td>
                  <td className="p-2 text-center border">{item.doctorname}</td>
                  <td className="p-2 text-center border">
                    {item.statustimeend}
                  </td>
                  <td className="p-2 text-center border">{item.timestart}</td>
                  <td className="p-2 text-center border">{item.timeend}</td>
                  <td className="p-2 text-center border">{item.dayend}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="18" className="p-2 text-center border">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;

//     If dt.Rows(i).Item("ordertype").ToString() = "0" Then
//         ordertype = "ใบสั่งยาผู้ป่วยใน"
//     ElseIf dt.Rows(i).Item("ordertype").ToString() = "1" Then
//         ordertype = "ใบสั่งยาผู้ป่วยกลับบ้าน"
//     ElseIf dt.Rows(i).Item("ordertype").ToString() = "3" Then
//         ordertype = "ใบสั่งยาเพิ่มเติม"
//     End If

// If dtdue.Rows(0).Item("status").ToString() = "" Then
//     status = "รออนุมัติ"
// ElseIf dtdue.Rows(0).Item("status").ToString() = "1" Then
//     status = "อนุมัติ"
// ElseIf dtdue.Rows(0).Item("status").ToString() = "2" Then
//     status = "ไม่อนุมัติ"
// End If
