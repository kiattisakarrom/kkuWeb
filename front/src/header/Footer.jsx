import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="container flex justify-between items-center px-4">
      <div className="flex items-center space-x-2">
        <span>Computer Name: LAPTOP-I0GR4VBC</span>
        <span>IP: 192.168.56.1</span>
        <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded flex items-center">
          <span>Print</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v8m4-4H8"
            />
          </svg>
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded flex items-center">
          <span>Auto Print</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v8m4-4H8"
            />
          </svg>
        </button>
        <span>007 หอผู้ป่วย</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>User ID: 0201</span>
        <span>User Name: System Test</span>
        <span>Position: เภสัชกร</span>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
          onClick={handleLogout}
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
