"use client";

import DashboardNavbar from "@/components/DashboardNavbar";
import FormComponent from "@/components/FormComponent";
import { useWallet } from "@/components/context/index"; // Import the wallet context
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export default function Page() {
  const { account } = useWallet(); // Get wallet connection status

  const CONTRACT_ADDRESS = "0x4D18D3828a22003e0432AF09c9Bd5D9d655E8643";
  const ABI = [
    "function getContractNetWorth() public view returns (uint256)",
    "function totalInvestment() public view returns (uint256)",
    "function MyMoney(address) public view returns (uint256)",
    "function balances(address) public view returns (uint256)"
  ];

  const [overview, setOverview] = useState([
    { title: "Current Pool Value", amount: "0", currency: "USDC", value: "$0.00", pnl: "+ $0.00 (0.00%)" },
    { title: "Total Pool Depositions", amount: "0", currency: "USDC", value: "$0.00", pnl: "+ $0.00 (0.00%)" },
    { title: "Current Balance", amount: "0", currency: "USDC", value: "$0.00", pnl: "- $0.00 (0.00%)" },
    { title: "Your Despositions", amount: "0", currency: "USDC", value: "$0.00", pnl: "+ $0.00 (0.00%)" },
  ]);

  // Initialize ethers.js provider and contract
  const getContract = async () => {
    if (!window.ethereum || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!account) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = await getContract();

        // Fetch contract values
        const netWorth = await contract.getContractNetWorth();
        const netWorthEth = ethers.formatUnits(netWorth.toString(), 6); // Convert to USDC
        
        const totalInvestment = await contract.totalInvestment();
        const totalInvestmentEth = ethers.formatUnits(totalInvestment.toString(), 6); // Convert to USDC

        const userDeposition = await contract.MyMoney(account);
        const userDepositionEth = ethers.formatUnits(userDeposition.toString(), 6); // Convert to USDC

        const totalBalance = await contract.balances(account);
        const totalBalanceEth = ethers.formatUnits(totalBalance.toString(), 6); // Convert to USDC

        console.log(totalBalanceEth + " total balance");

        // Update state
        const newOverview = [
          { title: "Current Pool Value", amount: netWorthEth, currency: "USDC", value: `` },
          { title: "Total Pool Depositions", amount: totalInvestmentEth, currency: "USDC", value: `$` },
          { title: "Current Balance", amount: userDepositionEth, currency: "USDC", value: `$$` },
          { title: "Your Despositions", amount: totalBalanceEth, currency: "USDC", value: `` },
        ];

        setOverview(newOverview);
      } catch (error) {
        console.error("Error fetching contract data:", error);
      }
    };

    fetchData(); // Initial Fetch
    const interval = setInterval(fetchData, 5000); // Auto-refresh every 5 sec

    return () => clearInterval(interval); // Cleanup
  }, [account]);

  return (
    <div className="w-full h-screen bg-cover bg-center flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1 items-center justify-center w-full">
        {account ? (
          <div className="flex flex-1 items-center justify-center w-full">
            
            <div className="flex flex-1 items-center justify-center w-[50%] ml-16">
              <div className="flex flex-wrap gap-4 justify-center p-6">
                {overview.map((data, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-900 text-white p-6 rounded-lg w-[40%] border border-gray-700 shadow-lg transition-all duration-300 hover:border-transparent hover:shadow-none"
                  >
                    <div className="text-white-400 text-lg">{data.title}</div>
                    <div className="text-2xl font-semibold mt-1">
                      {data.amount} <span className="text-lg text-white-400">USDC</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center w-[50%]">
              <FormComponent />
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
