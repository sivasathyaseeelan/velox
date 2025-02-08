"use client";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useWallet } from "@/components/context/index";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Page() {
  const { account } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const fetchData = async () => {
    try {
      if (!account) return;
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

      console.log("API Response:", response.data);
      const { data } = response;
      if (!data || !data.data) {
        console.error("Invalid API response format:", response);
        return;
      }
      const { withdrawns = [], depositeds = [] } = data.data;
      const formattedWithdrawns = withdrawns.map((tx) => ({
        ...tx,
        type: "withdraw",
      }));
      const formattedDepositeds = depositeds.map((tx) => ({
        ...tx,
        type: "deposit",
      }));
      const mergedTransactions = [...formattedWithdrawns, ...formattedDepositeds].sort(
        (a, b) => b.blockTimestamp - a.blockTimestamp
      );
      setTransactions(mergedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (account) fetchData();
  }, [account]);

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const shortenTxId = (txId) => `${txId.slice(0, 6)}...${txId.slice(-6)}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
<div className="w-full h-screen text-white flex flex-col">
  <div className="bg-black bg-opacity-50 w-full h-full flex flex-col">
    <DashboardNavbar />
    <div className={`flex flex-1 flex-col items-center ${account ? "justify-start" : "justify-center"} w-full`}>
      {account ? (
        <div className="w-full max-w-4xl p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-200 text-center mb-4 flex items-center justify-center gap-2">
              Orders
            </h2>
          {/* <h2 className="text-xl font-semibold text-center mb-4">T</h2> */}
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-center text-gray-300">
              <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                <tr>
                  <th className="px-6 py-3 w-1/5">Type</th>
                  <th className="px-6 py-3 w-1/5">Amount</th>
                  <th className="px-6 py-3 w-full">Block Number</th>
                  <th className="px-6 py-3 w-full">Timestamp</th>
                  <th className="px-6 py-3 w-1/5">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((tx, index) => (
                    <tr key={tx.id} className="bg-gray-900 border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-6 py-4">
                        {tx.type === "withdraw" ? (
                          <span className="text-red-400">Withdraw</span>
                        ) : (
                          <span className="text-green-400">Deposit</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{Number(tx.amount) / 1000000} USDC</td>
                      <td className="px-6 py-4">{tx.blockNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.blockTimestamp * 1000).toLocaleString()}</td>
                      <td className="px-6 py-4 w-48 whitespace-nowrap text-center">
                        <div className="flex items-center justify-between space-x-2">
                          <span className="truncate">{shortenTxId(tx.id.slice(0, -8))}</span>
                          <button
                            onClick={() => copyToClipboard(tx.id.slice(0, -8))}
                            className="text-gray-400 hover:text-gray-200"
                          >
                            📋
                          </button>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.id.slice(0, -8)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            🔗
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {transactions.length > transactionsPerPage && (
            <div className="flex justify-between mt-4">
              <button
                className={`px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 ${
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
                className={`px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 ${
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
</div>

  );
}
