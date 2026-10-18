import React, { useState } from 'react';

const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full h-full">
      <div className="flex border-b">
        {React.Children.map(children, (child, index) => (
          <button
            className={`px-4 text-sm py-2 focus:outline-none ${
              index === activeTab ? 'border-b-2 border-custom-r3 font-bold' : ''
            }`}
            onClick={() => setActiveTab(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className=" w-full h-[100%] ">
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
