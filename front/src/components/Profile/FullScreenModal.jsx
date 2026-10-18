// FullScreenModal.jsx
import React from 'react';

const FullScreenModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[80%] h-[90%] bg-white rounded shadow-xl overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};
