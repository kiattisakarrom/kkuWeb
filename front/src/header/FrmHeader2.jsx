import { React, useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
export default function FrmHeader2() {
  return (
    <div className="text-[13px]">
      <div className="flex items-center bg-gray-200 ">
        <DropdownIV
          icon="💉"
          label="ห้องยา IV"
          items={['Medication Profile', 'screenning', 'CheckOut']}
        />
        <DropdownIV
          icon="🧪"
          label="ห้องยาเคมี"
          items={[
            'Medication Profile',
            'Gen Order',
            'Screenning',
            'CheckOut',
            'Med Tranfer',
          ]}
        />
        <DropdownIV
          icon="📑"
          label="บันทึกการผลิตยา"
          items={[
            'แบบบันทึกการผลิตทั่วไป',
            'แบบบันทึกการผลิตยาสมุนไพร',
            'แบบบันทึกการผลิตน้ำยาฆ่าเชื้อ',
            'แบบบันทึกการผลิตยาปราศจากฆ่าเชื้อ',
          ]}
        />
        <DropdownIV
          icon="📑"
          label="บันทึกการผลิตยา"
          items={['Medication Profile', 'CheckOut']}
        />
        <DropdownIV
          icon="🏥"
          label="ห้องยา TPN"
          items={['Medication Profile', 'CheckOut']}
        />
        <button className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md ">
          <span className="">💊</span>
          <span className="ml-2">Pharmcare</span>
        </button>
        <button className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md ">
          <span className="">🏥</span>
          <span className="ml-2">ข้อมูลการจ่าย</span>
        </button>
        <button className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md ">
          <span className="  ">👩‍⚕️</span>
          <span className="ml-2">Nurse Station</span>
        </button>
        <DropdownReport icon="📄" label="Report" />

        <button className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md ">
          <span className="">📝</span>
          <span className="ml-2">คลังย่อย</span>
        </button>
        <button className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md ">
          <span className="">🛒</span>
          <span className="ml-2">คืนยา</span>
        </button>
        <button className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md ">
          <span className="">📊</span>
          <span className="ml-2">Med Reconcile</span>
        </button>
        <button className=" flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md ">
          <span className="">⚙️</span>
          <span className="ml-2">Setting</span>
        </button>
      </div>
    </div>
  );
}

const DropdownIV = ({ icon, label, items }) => {
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
  const click = () => {
    alert('medication');
  };
  return (
    <div
      className="relative inline-block text-left z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md  transition duration-300 ease-in-out"
      >
        <span className="">{icon}</span>
        <span>{label}</span>
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
        className="absolute text-sm left-0 mt-2 w-64 bg-white border border-gray-400 rounded-lg shadow-lg z-10"
      >
        {items.map((item) => (
          <DropdownItem key={item} label={item} onClick={() => alert(item)} />
        ))}
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
    <div
      className="relative inline-block text-left "
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center hover:bg-gray-500 active:bg-gray-300 px-3 py-1 rounded-md transition duration-300 ease-in-out"
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
        className="absolute text-sm left-0 mt-2 w-64 bg-white border border-gray-400 rounded-lg shadow-lg z-50"
      >
        <DropdownItem label="ADR" onClick={() => alert('ADR')} />
        <DropdownItem label="IV Admixture" />
        <DropdownItem label="Med Transfer" />
        <DropdownItem label="Nurse Station" />
        <DropdownItem label="Pharmcare" hasSubmenu icon="🏥">
          <DropdownItem label="ห้องยา IPD" />
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

const DropdownItem = ({ label, shortcut, onClick }) => (
  <div
    className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-300 ease-in-out "
    onClick={onClick}
  >
    <span>{label}</span>
    {shortcut && <span className="text-sm text-gray-500">{shortcut}</span>}
  </div>
);
