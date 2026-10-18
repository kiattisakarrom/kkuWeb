import { createContext, useState, useEffect } from 'react';

export const ButtonContext = createContext();

export const ButtonProvider = ({ children }) => {
  const storedButton = localStorage.getItem('selectedButton') || '';

  const [selectedButton, setSelectedButton] = useState(storedButton);

  // ✅ อัปเดตค่า localStorage ทุกครั้งที่ selectedButton เปลี่ยน
  useEffect(() => {
    localStorage.setItem('selectedButton', selectedButton);
  }, [selectedButton]);

  return (
    <ButtonContext.Provider value={{ selectedButton, setSelectedButton }}>
      {children}
    </ButtonContext.Provider>
  );
};
