"use client";

import React, { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useWallet } from "@/components/context/index";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full h-screen bg-cover bg-center flex flex-col">
      <DashboardNavbar />

      <div className={`flex flex-1 flex-col items-center ${account ? "justify-start" : "justify-center"} w-full p-6`}>
        {account ? (
          <div className="w-full max-w-4xl">
            <h2 className="text-xl font-semibold text-gray-200 text-center mb-4 flex items-center justify-center gap-2">
              Agent Trades
            </h2>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-center text-gray-300">
                <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 w-1/4">Asset Class</th>
                    <th className="px-6 py-3 w-1/4">Symbol</th>
                    <th className="px-6 py-3 w-1/4">Amount</th>
                    <th className="px-6 py-3 w-1/4">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <React.Fragment key={item._id}>
                        <tr
                          className="bg-gray-900 border-b border-gray-700 hover:bg-gray-700 transition cursor-pointer"
                          onClick={() => toggleRow(item._id)}
                        >
                          <td className="px-6 py-4">
                            {["deposit", "withdraw"].includes(item.decision) ? (
                              <span className="text-green-400">Liquidity Pool</span>
                            ) : (
                              <span className="text-blue-400">Token</span>
                            )}
                          </td>
                          <td className="px-6 py-4">{item.cryptocurrency_symbol}</td>
                          <td className="px-6 py-4 text-gray-300 text-center">
                            {Number(item.current_amount)/1000000} USDC
                          </td>
                          <td className="px-6 py-4 capitalize">
                            {item.decision === "withdraw" ? (
                              <span className="text-red-400">Withdraw</span>
                            ) : (
                              <span className="text-green-400">Deposit</span>
                            )}
                          </td>
                        </tr>
                        {expandedRow === item._id && (
                          <tr className="bg-gray-800">
                            <td colSpan={4} className="px-6 py-4 text-gray-400 text-sm">
                              <strong>Reason:</strong> {item.reason}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center p-4 text-gray-400">
                        No trades found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-300">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
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
