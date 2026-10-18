import React from 'react';

export default function DUE() {
  return (
    <div className="w-full h-full grid grid-rows-3 grid-cols-4">
      <div className="row-start-1 row-span-2 col-span-4 col-start-1 grid grid-rows-11 grid-cols-4">
        <div className="row-start-2 row-span-2 col-span-2 col-start-1 flex justify-center items-center space-x-1 ">
          <span className="w-[30%] h-full flex justify-end items-start ">
            DrugDUE :
          </span>
          <textarea className="w-[35%] h-[95%] border-collapse border border-gray-400 p-2"></textarea>
          <button className="w-[5%] h-[50%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
        </div>
        <div className="row-start-4 row-span-1 col-span-2 col-start-1 flex justify-center items-center space-x-1 ">
          <span className="w-[30%] flex justify-end items-center ">
            Doctor :
          </span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
          <button className="w-[5%] h-[90%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
        </div>
        <div className="row-start-5 row-span-1 col-span-2 col-start-1 flex justify-center items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Indication :
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">Approrpiate</option>
            <option value="2">Unjustify</option>
          </select>
        </div>
        <div className="row-start-6 row-span-1 col-span-2 col-start-1 flex justify-center items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Empiric :
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">Empiric</option>
            <option value="2">Specific</option>
          </select>
        </div>
        <div className="row-start-7 row-span-1 col-span-2 col-start-1 flex justify-center items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Document :
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">First line</option>
            <option value="2">Not first line</option>
          </select>
        </div>
        <div className="row-start-8 row-span-1 col-span-2 col-start-1 flex justify-center items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Start :
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">At admit</option>
            <option value="2">Not response ATB</option>
            <option value="3">During admit</option>
            <option value="4">At D/C</option>
          </select>
        </div>
        <div className="row-start-9 row-span-1 col-span-2 col-start-1 flex justify-center items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Combine :
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">Yes</option>
            <option value="2">No</option>
          </select>
        </div>
        <div className="row-start-10 row-span-1 col-span-2 col-start-1 flex justify-center items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Interventionl:
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">No Intervene</option>
            <option value="2">Intervene And Appropriate</option>
            <option value="3">Intervene But confirm</option>
            <option value="4">Intervene And Change to</option>
          </select>
        </div>
        <div className="row-start-11 row-span-1 col-span-2 col-start-1 flex justify-center items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Dosage :
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">Appropriate</option>
            <option value="2">Inappropriate</option>
          </select>
        </div>

        <div className="row-start-2 row-span-1 col-span-2 col-start-3 flex justify-start items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            InterventionD :
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">No Intervene</option>
            <option value="2">Intervene And Appropriate</option>
            <option value="3">Intervene But confirm</option>
            <option value="4">Intervene And Change to</option>
          </select>
        </div>
        <div className="row-start-3 row-span-1 col-span-2 col-start-3  flex justify-start items-center space-x-2 ">
          <span className="w-[30%] flex justify-end items-center ">
            DurationUse :
          </span>
          <input
            type="text"
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-4 row-span-1 col-span-2 col-start-3 flex justify-start items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">ADR :</span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">Yes</option>
            <option value="2">No</option>
          </select>
        </div>
        <div className="row-start-5 row-span-1 col-span-2 col-start-3 flex justify-start items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Nscor :
          </span>
          <input
            type="text"
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-6 row-span-1 col-span-2 col-start-3 flex justify-start items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Outcome :
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">Improve</option>
            <option value="2">Not Improve</option>
            <option value="3">Exclude</option>
            <option value="4">Expired</option>
          </select>
        </div>
        <div className="row-start-7 row-span-1 col-span-2 col-start-3 flex justify-start items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            DrugAmount :
          </span>
          <input
            type="text"
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-8 row-span-1 col-span-2 col-start-3 flex justify-start items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            Value :
          </span>
          <input
            type="text"
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
          />
        </div>
        <div className="row-start-9 row-span-1 col-span-2 col-start-3  flex justify-start items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            DUEPha :
          </span>
          <input
            type="text"
            className="w-[35%] h-[90%] border-collapse border border-gray-400 px-2"
          />
          <button className="w-[5%] h-[90%] bg-gray-700 rounded rotate-180 text-white">
            ^
          </button>
        </div>
        <div className="row-start-10 row-span-1 col-span-2 col-start-3 flex justify-start items-center space-x-2">
          <span className="w-[30%] flex justify-end items-center ">
            DUEform :
          </span>
          <select
            className="w-[40%] h-[90%] border-collapse border border-gray-400 px-2"
            name="ward"
            id="1"
          >
            <option value="0"></option>
            <option value="1">Yes</option>
            <option value="2">No</option>
          </select>
        </div>
      </div>
    </div>
  );
}
