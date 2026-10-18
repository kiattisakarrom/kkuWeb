import React, { useState } from 'react';
import chse from '../../../../img/icon4.png';
const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full h-full space-y-2">
      <div className="flex border-b w-full h-[7%] ">
        {React.Children.map(children, (child, index) => (
          <button
            className={`w-[10%] h-full text-black mr-2 font-bold space-x-2 bg-white  border border-collapse border-black hover:bg-slate-100 active:bg-slate-300 flex items-center justify-center`}
            onClick={() => setActiveTab(index)}
          >
            <img src={chse} alt="img" className="w-7 h-7" />
            {child.props.label}
          </button>
        ))}
      </div>
      <div className=" w-full h-[93%] ">
        {React.Children.map(children, (child, index) =>
          index === activeTab ? child : null
        )}
      </div>
    </div>
  );
};

const Tab = ({ children }) => {
  return <div className="w-full h-full ">{children}</div>;
};

export { Tabs, Tab };
