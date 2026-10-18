import React from 'react';
import success from '../../../../img/success.png';
import cancel from '../../../../img/cancel.png';
import { camelCase } from 'lodash';
export default function SideEffect() {
  return (
    <div className="w-[100%] h-full grid grid-rows-3">
      <div className="row-start-1 row-span-1 col-start-1 col-span-1 grid grid-rows-4 grid-cols-10">
        {/*input แถว1 */}
        {/********************************************** block1 **********************************************/}

        <div className="row-start-1 row-span-1 col-start-1 col-span-4 space-x-2 flex items-center ">
          <span className="w-[48%] h-full flex justify-end items-center">
            วันที่ผู้ป่วยได้รับยา :{' '}
          </span>
          <input
            type="text"
            className="w-[35%] h-[80%] border-collapse border border-gray-400 px-2"
          />
          <button className="w-[7%] h-[80%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
          <span className="w-[10%] h-[80%]"></span>
        </div>
        <div className="row-start-2 row-span-1 col-start-1 col-span-4 space-x-2 flex">
          <span className="w-[48%] h-full flex justify-end items-center">
            วันที่เกิด Side Effect :{' '}
          </span>
          <input
            type="date"
            className="w-[35%] h-[80%] border-collapse border border-gray-400 px-2"
          />
          <span className="w-[7%] h-[80%]"></span>

          <span className="w-[10%] h-[80%]"></span>
        </div>
        <div className="row-start-3 row-span-1 col-start-1 col-span-4 space-x-2 flex">
          <span className="w-[48%] h-full flex justify-end items-center">
            Side effect ที่พบ :{' '}
          </span>
          <input
            type="text"
            className="w-[35%] h-[80%] border-collapse border border-gray-400 px-2"
          />
          <button className="w-[7%] h-[80%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
          <button className="w-[10%] h-[80%] bg-white hover:bg-gray-100 active:bg-white text-black border border-collapse border-gray-500">
            {'=>'}
          </button>
        </div>
        <div className="row-start-4 row-span-1 col-start-1 col-span-4 space-x-2 flex">
          <span className="w-[48%] h-full flex justify-end items-center">
            Grade'Of SIDE EFFECT :{' '}
          </span>
          <input
            type="text"
            className="w-[35%] h-[80%] border-collapse border border-gray-400 px-2"
          />
          <button className="w-[7%] h-[80%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
          <button className="w-[10%] h-[80%] bg-white hover:bg-gray-100 active:bg-white text-black border border-collapse border-gray-500">
            {'=>'}
          </button>
        </div>
        {/********************************************** block2 **********************************************/}
        <div className="row-start-1 row-span-1 col-start-5 col-span-3 space-x-2 flex items-center ">
          <span className="flex justify-start items-center">
            Detail Management
          </span>
        </div>
        <div className="row-start-2 row-span-3 col-start-5 col-span-3 space-x-[2px] flex items-center py-1 justify-end ">
          <textarea className="w-[88%] h-[100%] border-collapse border border-gray-400 px-2"></textarea>
          <button className="w-[10%] h-[30%] bg-white hover:bg-gray-100 active:bg-white text-black border border-collapse border-gray-500">
            {'<='}
          </button>
        </div>
        {/********************************************** block3 **********************************************/}
        <div className="row-start-1 row-span-1 col-start-8 col-span-3 space-x-2 flex items-center ">
          <span className="flex justify-start items-center">Drug</span>
        </div>
        <div className="row-start-2 row-span-3 col-start-8 col-span-3 space-x-[2px] flex flex-col items-center px-[2px] justify-start ">
          <div className="w-full h-[28%] flex items-center justify-start">
            <input
              type="text"
              className="w-[81%] h-[85%] border-collapse border border-gray-400  "
            />
            <button className="w-[7%] h-[80%] bg-gray-700 rounded rotate-180 text-white ml-1">
              ^
            </button>{' '}
          </div>
          <div className="w-full h-[72%] flex items-start justify-start">
            <textarea className="w-[88%] h-[95%] border-collapse border border-gray-400 px-2"></textarea>
          </div>
        </div>
      </div>
      <div className="row-start-2 row-span-1 col-start-1 col-span-1 grid grid-rows-3 grid-cols-10 ">
        {/*input แถวสอง */}
        <div className="row-start-1 row-span-3 col-span-8 col-start-1 bg-white border border-collapse border-black overflow-auto">
          <table className="w-full h-full">
            <thead className="border border-collapse  border-gray-400 bg-white sticky top-0">
              <tr>
                <th className="border border-collapse border-gray-400 px-2 py-1 min-w-[150px]">
                  SE Date
                </th>
                <th className="border border-collapse border-gray-400 px-2 py-1 min-w-[150px]">
                  Side Effect
                </th>
                <th className="border border-collapse border-gray-400 px-2 py-1 min-w-[100px]">
                  grade
                </th>
                <th className="border border-collapse border-gray-400 px-2 py-1 min-w-[400px]">
                  Details & Management
                </th>
                <th className="border border-collapse border-gray-400 px-2 py-1 min-w-[150px]">
                  Admin Date
                </th>
                <th className="border border-collapse border-gray-400 px-2 py-1 min-w-[100px]">
                  [ลบ]
                </th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <div className="row-start-1 row-span-1 col-span-1 col-start-9 flex items-center justify-center">
          <button className="w-[90%] h-[90%] flex justify-center space-x-2 items-center border-collapse border border-black bg-white hover:bg-gray-200 active:bg-white ">
            <img src={success} alt="รูป" className="w-6 h-6" />
            <span>บันทึก</span>
          </button>
        </div>
        <div className="row-start-2 row-span-1 col-span-1 col-start-9 flex items-center justify-center">
          <button className="w-[90%] h-[90%] flex justify-center space-x-2 items-center border-collapse border border-black bg-white hover:bg-gray-200 active:bg-white ">
            <img src={cancel} alt="รูป" className="w-6 h-6" />
            <span>บันทึก</span>
          </button>
        </div>
      </div>
      <div className="row-start-3 row-span-1 col-start-1 col-span-1 grid grid-rows-5 grid-cols-10">
        {/*input แถวสาม */}
        <div className="row-start-1 row-span-1 col-start-1 col-span-8 flex items-end">
          <div className="border border-collapse border-black w-full h-[90%] flex items-center justify-center">
            Grade
          </div>
        </div>
        <div className="row-start-2 row-span-4 col-start-1 col-span-8">
          <div className="border border-collapse border-black bg-white w-full h-full">
            <table className="w-full h-full">
              <thead className="border border-collapse  border-gray-400 bg-white sticky top-0">
                <tr>
                  <th className="border border-collapse border-gray-400 px-2 py-1 w-[20%]">
                    1
                  </th>
                  <th className="border border-collapse border-gray-400 px-2 py-1 w-[20%]">
                    2
                  </th>
                  <th className="border border-collapse border-gray-400 px-2 py-1 w-[20%]">
                    3
                  </th>
                  <th className="border border-collapse border-gray-400 px-2 py-1 w-[20%]">
                    4
                  </th>
                  <th className="border border-collapse border-gray-400 px-2 py-1 w-[20%]">
                    5
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className=" border border-collapse border-gray-400">
                    <textarea className="w-[99%] h-[99%]"></textarea>
                  </th>
                  <th className="border border-collapse border-gray-400">
                    <textarea className="w-[99%] h-[99%]"></textarea>
                  </th>
                  <th className="border border-collapse border-gray-400">
                    <textarea className="w-[99%] h-[99%]"></textarea>
                  </th>
                  <th className="border border-collapse border-gray-400">
                    <textarea className="w-[99%] h-[99%]"></textarea>
                  </th>
                  <th className="border border-collapse border-gray-400">
                    <textarea className="w-[99%] h-[99%]"></textarea>
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="row-start-2 row-span-2 col-start-9 col-span-2 ">
          <div className="flex justify-center flex-wrap space-x-1">
            <span>Remark : </span>
            <span>ALSO_CONSIDER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
