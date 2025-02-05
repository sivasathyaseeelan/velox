"use client";

import { useState } from "react";

const FormComponent = () => {
  const [amount, setAmount] = useState("");
  const [deposit, setDeposit] = useState(true);

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return alert("Please enter an amount!");
    alert(`Buying ${amount} tokens!`);
  };

  // Allow only numbers and decimal points
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div 
    className="flex flex-col items-center justify-between bg-gray-900 p-6 rounded-lg shadow-lg w-96 h-96"
    >
        <div className="flex justify-center items-center bg-gray-600 w-full rounded">
            <button className={`text-white text-xl font-bold h-full w-full py-2 rounded ${deposit ? "bg-blue-500" : "hover:bg-gray-700"}`} onClick={()=>{setDeposit(true)}}>Deposit</button>
            <button className={`text-white text-xl font-bold h-full w-full py-2 rounded ${!deposit ? "bg-blue-500" : "hover:bg-gray-700"}`} onClick={()=>{setDeposit(false)}}>Withdraw</button>
        </div>
        <form
        onSubmit={handleBuy}
        className="flex flex-col items-center justify-between space-y-4 bg-gray-900 p-6 rounded-lg shadow-lg w-96 h-96"
        >

        {/* Input Box */}
        <input
            type="text"
            value={amount}
            onChange={handleChange}
            onKeyDown={(e) => {
            if (e.key === "e" || e.key === "+" || e.key === "-") {
                e.preventDefault();
            }
            }}
            className="w-full p-2 rounded border bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount in USDC"
        />

        {/* Buy Button */}
        <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            {
                deposit ? "Deposit" : "Withdraw"
            }
        </button>
        </form>
    </div>
  );
};

export default FormComponent;
