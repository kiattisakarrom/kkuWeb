import React from 'react';
import FrmInputDataPharmcare from './Pharmcare/FrmInputDataPharmcare';
import { Tabs, Tab } from './Pharmcare/TabControlPharmcare';
import DRP from './Pharmcare/DRP';
import DUE from './Pharmcare/DUE';
import SideEffect from './Pharmcare/SideEffect';
import Me from './Pharmcare/Me';

export default function FrmPharmcare() {
  return (
    <div className="w-full h-full ">
      <div className="w-full h-[25%]">
        <FrmInputDataPharmcare />
      </div>
      <div className="w-full h-[75%]  p-1 flex space-x-1">
        <div className="w-[20%] h-full border border-collapse border-gray-400 flex flex-col p-1">
          {/*ตารางซ้าย */}
          <span className="h-[6%] flex items-center w-full">
            ประวัติการบันทึกข้อมูล Pharmcare
          </span>
          <div className="h-[94%]  overflow-auto  bg-white w-full">
            <table className="w-full">
              <thead className=" sticky top-0 border-t border border-collapse border-gray-400 bg-white">
                <tr>
                  <th className="border border-collapse border-gray-400 p-2">
                    <input type="checkBox" />
                  </th>
                  <th className="border border-collapse border-gray-400 p-2">
                    OrderNo
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="border border-collapse border-gray-400 p-2">
                    fdf
                  </th>
                  <th className="border border-collapse border-gray-400 p-2">
                    fdf
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-[80%] h-full border border-collapse border-gray-400 bg-white">
          <Tabs>
            <Tab label="DRP">
              <div className=" w-full h-[92%] ">
                <DRP />
              </div>
            </Tab>
            <Tab label="DUE">
              <div className=" w-full h-[90%]">
                <DUE />
              </div>
            </Tab>
            <Tab label="Side Effect">
              <div className=" w-full h-[90%]">
                <SideEffect />
              </div>
            </Tab>
            <Tab label="ME">
              <div className=" w-full h-[90%]">
                <Me />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
