import React, { useState } from 'react'; // นำเข้า useState

const PopUp = ({ icon, label, shortcut }) => {
  const [isOpen, setIsOpen] = useState(false); // ใช้ useState เพื่อควบคุมการแสดงป๊อปอัพ

  // ฟังก์ชันเพื่อเปิด/ปิดป๊อปอัพ
  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        onClick={togglePopup} // เมื่อคลิกปุ่มจะเปิด/ปิดป๊อปอัพ
        className="bg-white text-[15px] text-gray-700 border-[1px] border-black h-full px-1 cursor-pointer hover:bg-gray-200 active:bg-gray-400 flex justify-between items-center w-[100px]"
      >
        <img src={icon} alt={label} className="mr-[2px] w-8 h-8" />
        <div className="flex flex-col items-end">
          {shortcut && (
            <span className="text-gray-500 text-[10px]">{shortcut}</span>
          )}
          <span className="text-center">{label}</span>
        </div>
      </button>

      {/* ถ้าป๊อปอัพเปิดอยู่ */}
      {isOpen && (
        <>
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 z-40" />
          <div className="fixed top-1/4 left-1/4 right-1/4 bg-white p-6 rounded-lg shadow-lg z-50 w-[600px]">
            {/* กรอบนอก */}
            <div className="border-4 border-gray-800 rounded-lg p-4">
              {/* กรอบบนสุด สีเหลือง */}
              <div className="bg-yellow-500 text-red-700 p-2 rounded-t-lg">
                <h2 className="text-xl font-bold">แจ้งเตือน</h2>
              </div>

              {/* ช่องข้อความ สีขาว */}
              <div className="bg-white p-4 my-4 rounded-lg shadow-inner">
                <p className="text-black">ข้อความแจ้งเตือนที่นี่!</p>
              </div>

              {/* ช่องกลางใหญ่สุด */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  รายละเอียดป๊อปอัพจะถูกแสดงที่นี่...
                </p>
              </div>

              {/* ปุ่มตกลง */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={togglePopup} // เมื่อคลิกปิดป๊อปอัพ
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PopUp;
