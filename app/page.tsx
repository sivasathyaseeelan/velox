'use client';

import React, { useState, useEffect } from "react";
import { useWallet } from "@/components/context";
import { ethers } from "ethers";
import ConnectWallet from "@/components/connect";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
// import fire from "@/public/fire.svg";


// The contract ABI and address (replace with your contract's ABI and address)
const contractAddress = "0x7a0f67D70d5f2a782e30cE87433988d3440307e9";
const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Deposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Invested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdrawn",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "invest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "invested",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "stablecoin",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalPool",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "uniswapRouter",
		"outputs": [
			{
				"internalType": "contract IPool",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawInvest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

const Page: React.FC = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const [amount, setAmount] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [totalPool, setTotalPool] = useState<number | null>(null);
  const [invested, setInvested] = useState<number | null>(null);

  const router = useRouter();

  // Initialize ethers.js provider and contract
  const getContract = async () => {
    if (!window.ethereum || !account) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  // Deposit function
  const depositFunds = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.deposit(amount); // Assuming the amount is in ETH
      setLoading(true);
      await tx.wait();
      alert("Deposit successful!");
      getUpdatedBalance();
      getTotalPool();
    } catch (error) {
      console.error("Deposit failed", error);
      alert("Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  // Withdraw function
  const withdrawFunds = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.withdraw(amount); // Assuming the amount is in ETH
      setLoading(true);
      await tx.wait();
      alert("Withdrawal successful!");
      getUpdatedBalance();
      getTotalPool();
    } catch (error) {
      console.error("Withdrawal failed", error);
      alert("Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  // Fetch the updated balance after any transaction
  const getUpdatedBalance = async () => {
    try {
      const contract = await getContract();
      const balance = await contract.balances(account);
      setBalance(balance, 18); // Assuming the balance is in stablecoin (18 decimals)
    } catch (error) {
      console.error("Failed to fetch balance", error);
    }
  };

  // Fetch the total pool amount
  const getTotalPool = async () => {
    try {
      const contract = await getContract();
      const total = await contract.totalPool();
      setTotalPool(total); // Assuming the pool amount is in stablecoin (18 decimals)
    } catch (error) {
      console.error("Failed to fetch total pool", error);
    }
  };

  // Fetch the total invested amount
  const getInvestedAmount = async () => {
    try {
      const contract = await getContract();
      const investedAmount = await contract.invested();
      setInvested(investedAmount); // Assuming the invested amount is in stablecoin (18 decimals)
    } catch (error) {
      console.error("Failed to fetch invested amount", error);
    }
  };

  // Fetch balance, total pool, and invested amount on page load or account change
  useEffect(() => {
    if (account) {
      getUpdatedBalance();
      getTotalPool();
      getInvestedAmount();
    }
  }, [account]);

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex flex-col justify-center items-center"
      style={{ backgroundImage: "url('./../Background.svg')" }}
    >
      <Navbar />

	  <div className="flex flex-1 items-center justify-center w-[60%]">
		<div className="flex flex-col justify-center items-center gap-10">
			<h1 className="text-white text-4xl font-bold text-center">Smart crypto investing, zero turbulence. 🚀 Let AI trade, rebalance, and maximize your yield while you sleep!</h1>
            <button className="bg-[#1068CE] px-4 py-3 rounded-full"
				onClick={() => router.push("/dashboard")}
			>
				<div className="flex justify-center items-center px-2">
					{/* <img src={fire} className="h-6"></img> */}
					<p>Start Investing</p>
				</div>
            </button>
		</div>
      </div>
    </div>
  );
};

export default Page;