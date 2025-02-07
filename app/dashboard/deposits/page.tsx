"use client";

import DashboardNavbar from "@/components/DashboardNavbar";
import { useWallet } from "@/components/context/index"; // Import the wallet context
import { useEffect, useState } from "react";
import axios from "axios";

export default function Page() {
  const { account } = useWallet(); // Get wallet connection status

  const [transactions, setTransactions] = useState([]); // Full transaction list
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 15;

  const fetchData = async () => {
    try {
      if (!account) return; // Avoid calling API if no wallet is connected

      const response = await axios.post(
        "https://api.studio.thegraph.com/query/103123/velox-graph/version/latest",
        {
          query: `
          query {
            withdrawns(orderBy: blockTimestamp, where:{user: "${account}"}) {
              amount
              user
              blockTimestamp
              id
              blockNumber
            }
            depositeds(orderBy: blockTimestamp, where:{user: "${account}"}) {
              amount
              blockNumber
              blockTimestamp
              id
              user
            }
          }`,
        }
      );

      console.log("API Response:", response.data); // Debugging log

      // Ensure response structure is valid
      const { data } = response;
      if (!data || !data.data) {
        console.error("Invalid API response format:", response);
        return;
      }

      const { withdrawns = [], depositeds = [] } = data.data; // Default to empty arrays if undefined

      const formattedWithdrawns = withdrawns.map((tx) => ({
        ...tx,
        type: "withdraw",
      }));
      const formattedDepositeds = depositeds.map((tx) => ({
        ...tx,
        type: "deposit",
      }));

      // Merge and sort by blockTimestamp (descending order)
      const mergedTransactions = [...formattedWithdrawns, ...formattedDepositeds].sort(
        (a, b) => b.blockTimestamp - a.blockTimestamp
      );

      setTransactions(mergedTransactions);
      console.log("Merged Transactions:", mergedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (account) fetchData();
  }, [account]);

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  return (
    <div className="w-full h-screen text-white flex flex-col">
      <DashboardNavbar />

      <div className={`flex flex-1 flex-col items-center ${account ? "justify-start" : "justify-center"} w-full p-6`}>
        {account ? (
          <div className="w-full max-w-4xl">
            <h2 className="text-xl font-semibold text-center mb-4">Transaction History</h2>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-700 text-left">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-2 border border-gray-700">Type</th>
                    <th className="px-4 py-2 border border-gray-700">Amount</th>
                    <th className="px-4 py-2 border border-gray-700">Block Number</th>
                    <th className="px-4 py-2 border border-gray-700">Timestamp</th>
                    <th className="px-4 py-2 border border-gray-700">Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.length > 0 ? (
                    currentTransactions.map((tx, index) => (
                      <tr key={tx.id} className="bg-gray-700">
                        <td className="px-4 py-2 border border-gray-600 font-medium">
                          {tx.type === "withdraw" ? (
                            <span className="text-red-400">Withdraw</span>
                          ) : (
                            <span className="text-green-400">Deposit</span>
                          )}
                        </td>
                        <td className="px-4 py-2 border border-gray-600">{Number(tx.amount) / 1000000}</td>
                        <td className="px-4 py-2 border border-gray-600">{tx.blockNumber}</td>
                        <td className="px-4 py-2 border border-gray-600">
                          {new Date(tx.blockTimestamp * 1000).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border border-gray-600">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.id.slice(0, -8)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4 text-gray-400">No transactions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {transactions.length > transactionsPerPage && (
              <div className="flex justify-between mt-4">
                <button
                  className={`px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="text-gray-300 px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className={`px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 ${
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
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
