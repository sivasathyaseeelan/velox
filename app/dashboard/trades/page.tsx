"use client";

import React from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useWallet } from "@/components/context/index";
import { useEffect, useState } from "react";

const fetchData = async () => {
  try {
    const response = await fetch("/api/nillion");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Most recent records", data);
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
};

export default function Page() {
  const { account } = useWallet();
  const [data, setData] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      fetchData().then((res) => {
        if (res) setData(res);
      });
    }
  }, [account]);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="w-full h-screen bg-cover bg-center flex flex-col">
      <DashboardNavbar />

      <div className={`flex flex-1 flex-col items-center ${account ? "justify-start" : "justify-center"} w-full p-6`}>
        {account ? (
          <div className="w-full max-w-4xl">
            <h2 className="text-xl font-semibold text-center mb-4">Trades</h2>
            <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="border p-2">Asset Class</th>
                    <th className="border p-2">Symbol</th>
                    <th className="border p-2">Amount</th>
                    <th className="border p-2">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <React.Fragment key={item._id}>
                      <tr
                        className="cursor-pointer hover:bg-gray-500 transition"
                        onClick={() => toggleRow(item._id)}
                      >
                        <td className="border p-2">
                          {["deposit", "withdraw"].includes(item.decision)
                            ? "Liquidity Pool"
                            : "Token"}
                        </td>
                        <td className="border p-2">{item.cryptocurrency_symbol}</td>
                        <td className="border p-2">{item.current_amount}</td>
                        <td className="border p-2 capitalize">{item.decision}</td>
                      </tr>
                      {expandedRow === item._id && (
                        <tr>
                          <td colSpan={4} className="border p-2 bg-gray-500 text-sm">
                            <strong>Reason:</strong> {item.reason}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center w-full text-gray-400">
            Please connect your wallet to continue.
          </div>
        )}
      </div>
    </div>
  );
}