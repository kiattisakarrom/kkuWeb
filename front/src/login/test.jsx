import React, { useState } from 'react';
import { motion } from 'framer-motion';

function MotionScoll() {
  return (
    <div className="flex items-center bg-gray-200 py-2 px-4 space-x-4">
      <DropdownMenu icon="🛏️" label="ห้องยา IPD" />
      <DropdownMenu icon="💊" label="Pharmcare" />
      <DropdownMenu icon="🏥" label="ข้อมูลการจ่าย" />
      <DropdownMenu icon="👩‍⚕️" label="Nurse Station" />
      <DropdownMenu icon="📄" label="Report" />
      <DropdownMenu icon="📝" label="คลังย่อย" />
      <DropdownMenu icon="🛒" label="คืนยา" />
      <DropdownMenu icon="📊" label="Med Reconcile" />
    </div>
  );
}

const DropdownMenu = ({ icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuVariants = {
    open: {
      opacity: 1,
      y: 0,
      display: 'block',
    },
    closed: {
      opacity: 0,
      y: -20,
      transitionEnd: {
        display: 'none',
      },
    },
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        <span className="text-lg">{icon}</span>
        <span className="ml-2">{label}</span>
      </button>
      <motion.div
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={menuVariants}
        className="absolute left-0 mt-2 w-48 bg-white border border-gray-400 rounded shadow-lg z-10"
      >
        <DropdownItem label="Connect Unitdose" />
        <DropdownItem label="ห้องยา IPD Profile" />
        <DropdownItem label="Screen Create Order" shortcut="Alt+S" />
        <DropdownItem label="Screening" shortcut="Alt+S" />
        <DropdownItem label="[ER] Quick Order" shortcut="Alt+Q" />
        <DropdownItem label="Prescription Order" shortcut="Alt+P" />
        <DropdownItem label="Screen Create Order" />
        <DropdownItem label="Matching" />
        <DropdownItem label="Check Out" shortcut="Alt+C" />
        <DropdownItem label="Med Tranfer" shortcut="Alt+T" />
      </motion.div>
    </div>
  );
};

const DropdownItem = ({ label, shortcut }) => (
  <div className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
    <span>{label}</span>
    {shortcut && <span className="text-sm text-gray-500">{shortcut}</span>}
  </div>
);

export default MotionScoll;
