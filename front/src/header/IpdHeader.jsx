import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function IpdHeader() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full">
      <div className="flex items-center bg-blue-100 w-full h-full">
        <DropdownIPD icon="🛏️" label="ห้องยา IPD" />
        <button
          className="flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md "
          onClick={() => {
            if ('/pharmcare') navigate('/pharmcare');
            onclick();
          }}
        >
          <span className="">💊</span>
          <span className="ml-2">Pharmcare</span>
        </button>

        <button
          className="flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md "
          onClick={() => {
            if ('/DataDispenseDose') navigate('/DataDispenseDose');
            onclick();
          }}
        >
          <span className="text-sx">🏥</span>
          <span className="ml-2">ข้อมูลการจ่าย</span>
        </button>

        <button
          className="flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md "
          onClick={() => {
            if ('/NurseStation') navigate('/NurseStation');
            onclick();
            // console.log('clicik');
          }}
        >
          <span className="text-sx">👩‍⚕️</span>
          <span className="ml-2">Nurse Station</span>
        </button>

        <DropdownReport icon="📄" label="Report" />

        <button
          className="flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md "
          onClick={() => '/subtreasury' && navigate('/subtreasury')}
        >
          <span className="text-sx">📝</span>
          <span className="ml-2">คลังย่อย</span>
        </button>
        <button
          className="flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md "
          onClick={() => '/returndose' && navigate('/returndose')}
        >
          <span className="text-sx">🛒</span>
          <span className="ml-2">คืนยา</span>
        </button>
        <button className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md ">
          <span className="text-sx">📊</span>
          <span className="ml-2">Med Reconcile</span>
        </button>
        <button
          className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md "
          onClick={() => '/setting' && navigate('/setting')}
        >
          <span className="">⚙️</span>
          <span className="ml-2">Setting</span>
        </button>
      </div>
    </div>
  );
}

const DropdownIPD = ({ icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuVariants = {
    open: {
      opacity: 1,
      y: 0,
      display: 'block',
      transition: {
        type: 'spring',
        stiffness: 800,
        damping: 20,
      },
    },
    closed: {
      opacity: 0,
      y: -5,
      transitionEnd: {
        display: 'none',
      },
    },
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md transition duration-300 ease-in-out"
      >
        <span className="">{icon}</span>
        <span className="ml-2">{label}</span>
        <FaChevronDown
          style={{
            marginLeft: '4px',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        />
      </button>
      <motion.div
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={menuVariants}
        className="absolute left-0 mt-2 w-64 bg-white border border-gray-400 rounded-lg shadow-lg z-10"
      >
        <DropdownItem label="ห้องยา IPD Profile" path="/" />
        <DropdownItem label="Screen Create Order" shortcut="Alt+S" />
        <DropdownItem label="Screening" shortcut="Alt+S" path="/screening" />
        <DropdownItem
          label="[ER] Quick Order"
          shortcut="Alt+Q"
          path="/quickorder"
        />
        <DropdownItem label="Prescription Order" shortcut="Alt+P" />
        <DropdownItem label="Screen Create Order" />
        <DropdownItem label="Matching" />
        <DropdownItem label="Check Out" shortcut="Alt+C" />
        <DropdownItem label="Med Tranfer" shortcut="Alt+T" path="/medtranfer" />
      </motion.div>
    </div>
  );
};

const DropdownReport = ({ icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuVariants = {
    open: {
      opacity: 1,
      y: 0,
      display: 'block',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    closed: {
      opacity: 0,
      y: -20,
      transitionEnd: {
        display: 'none',
      },
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-[80%] flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md transition duration-300 ease-in-out"
      >
        <span className="">{icon}</span>
        <span className="ml-2">{label}</span>
        <FaChevronDown
          style={{
            marginLeft: '4px',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        />
      </button>
      <motion.div
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={menuVariants}
        className="absolute left-0 mt-2 w-64 bg-white border border-gray-400 rounded-lg shadow-lg z-10"
      >
        <DropdownItem label="ADR" />
        <DropdownItem label="IV Admixture" />
        <DropdownItem label="Med Transfer" />
        <DropdownItem label="Nurse Station" />
        <DropdownItem label="Pharmcare" hasSubmenu icon="🏥">
          <DropdownItem label="ห้องยา IPD" path="/mainIPD" />
          <DropdownItem label="ห้องยา OPD" />
          <DropdownItem label="รายงานสรุปการทำ Pharmcare" />
        </DropdownItem>
        <DropdownItem label="Sticker ยา" />
        <DropdownItem label="Workload" />
        <DropdownItem label="ใบเบิก" />
        <DropdownItem label="การใช้งานของผู้ป่วย" />
        <DropdownItem label="ขายยานอก HAD,TDM,LAB และเคมีบำบัด" />
        <DropdownItem label="การป้องกันการใช้ยา" />
        <DropdownItem label="ขายส่งและผลิต" />
        <DropdownItem label="แบบบันทึกการเตรียมยา" />
        <DropdownItem label="การคืนยา" />
      </motion.div>
    </div>
  );
};

const DropdownItem = ({ label, shortcut, path }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-300 ease-in-out"
      onClick={() => path && navigate(path)}
    >
      <span>{label}</span>
      {shortcut && <span className="text-gray-500">{shortcut}</span>}
    </div>
  );
};
