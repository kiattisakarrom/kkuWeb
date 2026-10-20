import { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const menus = [
  {
    icon: '🛏️',
    label: 'ห้องยา IPD',
    items: [
      { label: 'ห้องยา IPD Profile', path: '/' },
      { label: 'Screen Create Order', shortcut: 'Alt+S' },
      { label: 'Screening', shortcut: 'Alt+S', path: '/screening' },
      { label: '[ER] Quick Order', shortcut: 'Alt+Q', path: '/quickorder' },
      { label: 'Prescription Order', shortcut: 'Alt+P' },
      { label: 'Screen Create Order' },
      { label: 'Matching' },
      { label: 'Check Out', shortcut: 'Alt+C', path: '/checkout' },
      { label: 'Med Tranfer', shortcut: 'Alt+T', path: '/medtranfer' },
    ],
  },
  { icon: '💊', label: 'Pharmcare', path: '/pharmcare' },
  { icon: '🏥', label: 'ข้อมูลการจ่าย', path: '/DataDispenseDose' },
  { icon: '👩‍⚕️', label: 'Nurse Station', path: '/nurseStation' },
  {
    icon: '📄',
    label: 'Report',
    items: [
      { label: 'ADR' },
      { label: 'IV Admixture' },
      { label: 'Med Transfer' },
      { label: 'Nurse Station' },
      { label: 'Pharmcare' },
      { label: 'Sticker ยา' },
      { label: 'Workload' },
      { label: 'ใบเบิก' },
      { label: 'การใช้งานของผู้ป่วย' },
      { label: 'ขายยานอก HAD,TDM,LAB และเคมีบำบัด' },
      { label: 'การป้องกันการใช้ยา' },
      { label: 'ขายส่งและผลิต' },
      { label: 'แบบบันทึกการเตรียมยา' },
      { label: 'การคืนยา' },
    ],
  },
  { icon: '📝', label: 'คลังย่อย', path: '/subtreasury' },
  { icon: '🛒', label: 'คืนยา', path: '/returndose' },
  { icon: '📊', label: 'Med Reconcile' },
  { icon: '⚙️', label: 'Setting', path: '/setting' },
];

export default function IpdHeader({ onNavigate }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const headerRef = useRef(null);
  useEffect(() => {
    const closeOutside = (event) => {
      if (!headerRef.current?.contains(event.target)) setOpenMenu(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);
  const select = (item) => {
    setOpenMenu(null);
    if (onNavigate) onNavigate(item.path, item.label);
    else if (item.path) navigate(item.path);
  };
  return (
    <nav
      ref={headerRef}
      aria-label="เมนูหลัก"
      className="relative z-20 flex w-full flex-wrap items-center bg-blue-100 py-1 text-xs"
    >
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            type="button"
            onClick={() =>
              menu.items
                ? setOpenMenu(openMenu === menu.label ? null : menu.label)
                : select(menu)
            }
            aria-expanded={menu.items ? openMenu === menu.label : undefined}
            aria-controls={
              menu.items ? `menu-${menus.indexOf(menu)}` : undefined
            }
            className="flex items-center rounded-md px-3 py-1 hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500 active:bg-gray-400"
          >
            <span aria-hidden="true">{menu.icon}</span>
            <span className="ml-2">{menu.label}</span>
            {menu.items && (
              <FaChevronDown
                className={`ml-1 transition-transform ${openMenu === menu.label ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            )}
          </button>
          {menu.items && openMenu === menu.label && (
            <div
              id={`menu-${menus.indexOf(menu)}`}
              className="absolute left-0 top-full z-30 mt-1 max-h-[75vh] w-72 overflow-y-auto rounded-lg border border-gray-400 bg-white py-1 shadow-lg"
              aria-label={menu.label}
            >
              {menu.items.map((item, index) => (
                <button
                  type="button"
                  key={`${item.label}-${index}`}
                  onClick={() => select(item)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left hover:bg-gray-100 focus-visible:bg-blue-100"
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="text-gray-500">{item.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

IpdHeader.propTypes = {
  onNavigate: (props, name) =>
    props[name] == null || typeof props[name] === 'function'
      ? null
      : new Error(`${name} must be a function`),
};
