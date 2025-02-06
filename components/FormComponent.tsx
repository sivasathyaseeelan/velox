"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/components/context/index";

// The contract ABI and address (replace with your contract's ABI and address)
const contractAddress = "0x969deCDb279e5A3629Ba8d0A4aF0834d481ECda0";
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Invested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"WithdrawInvestment","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"MyMoney","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getData","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWithdrawalFromLiquidityPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"invest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stablecoin","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalInvestment","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"uniswapRouter","outputs":[{"internalType":"contract IPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawInvest","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const ERC20Address = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
const ERC20ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
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
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
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
		"name": "totalSupply",
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
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

const Loader = () => {
	return (
	  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
		<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
	  </div>
	);
};

const FormComponent = () => {
    const { account, connectWallet, disconnectWallet } = useWallet();
    const [amount, setAmount] = useState("");
    const [deposit, setDeposit] = useState(true);
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [totalPool, setTotalPool] = useState<number | null>(null);
    const [invested, setInvested] = useState<number | null>(null);
  
  
    // Initialize ethers.js provider and contract
    const getContract = async () => {
      if (!window.ethereum || !account) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(contractAddress, contractABI, signer);
    };

    const getERC20Contract = async () => {
      if (!window.ethereum || !account) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(ERC20Address, ERC20ABI, signer);
    };
  
    // Deposit function
    const depositFunds = async () => {
      try {
        fetchDeposits();
        setLoading(true);

        const contract = await getContract();
        const ERC20contract = await getERC20Contract();

        const ERC20tx = await ERC20contract.approve(contractAddress, Number(amount) * 1000000);
        await ERC20tx.wait();

        const tx = await contract.deposit(Number(amount) * 1000000); // Assuming the amount is in ETH
        await tx.wait();
        alert("Deposit successful!");
        setAmount("");
        setLoading(false);
        // getUpdatedBalance();
        // getTotalPool();
      } catch (error) {
        console.error("Deposit failed", error);
        alert("Deposit failed");
      } finally {
        setAmount("");
        setLoading(false);
      }
    };
  
    // Withdraw function
    const withdrawFunds = async () => {
      try {
        setLoading(true);

        const contract = await getContract();
        // const ERC20contract = await getERC20Contract();

        // const ERC20tx = await ERC20contract.approve(contractAddress, Number(amount) * 1000000);
        // await ERC20tx.wait();

        const tx = await contract.withdraw(Number(amount) * 1000000); // Assuming the amount is in ETH
        await tx.wait();
        alert("Withdrawal successful!");
        setAmount("");
        setLoading(false);
        // getUpdatedBalance();
        // getTotalPool();
      } catch (error) {
        console.error("Withdrawal failed", error);
        alert("Withdrawal failed");
      } finally {
        setAmount("");
        setLoading(false);
      }
    };
  
    // // Fetch the updated balance after any transaction
    // const getUpdatedBalance = async () => {
    //   try {
    //     const contract = await getContract();
    //     const balance = await contract.balances(account);
    //     setBalance(balance, 18); // Assuming the balance is in stablecoin (18 decimals)
    //   } catch (error) {
    //     console.error("Failed to fetch balance", error);
    //   }
    // };
  
    // // Fetch the total pool amount
    // const getTotalPool = async () => {
    //   try {
    //     const contract = await getContract();
    //     const total = await contract.totalPool();
    //     setTotalPool(total); // Assuming the pool amount is in stablecoin (18 decimals)
    //   } catch (error) {
    //     console.error("Failed to fetch total pool", error);
    //   }
    // };
  
    // // Fetch the total invested amount
    // const getInvestedAmount = async () => {
    //   try {
    //     const contract = await getContract();
    //     const investedAmount = await contract.invested();
    //     setInvested(investedAmount); // Assuming the invested amount is in stablecoin (18 decimals)
    //   } catch (error) {
    //     console.error("Failed to fetch invested amount", error);
    //   }
    // };
  
    // // Fetch balance, total pool, and invested amount on page load or account change
    // useEffect(() => {
    //     getUpdatedBalance();
    //     getTotalPool();
    //     getInvestedAmount();
    // }, []);

  const handleDepositWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return alert("Please enter an amount!");
    
    if(!loading){
      if(deposit) depositFunds();
      else withdrawFunds();
    }
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
		{loading && <Loader />}

        <div className="flex justify-center items-center bg-gray-600 w-full rounded">
            <button className={`text-white text-xl font-bold h-full w-full py-2 rounded ${deposit ? "bg-blue-500" : "hover:bg-gray-700"}`} onClick={()=>{setDeposit(true)}}>Deposit</button>
            <button className={`text-white text-xl font-bold h-full w-full py-2 rounded ${!deposit ? "bg-blue-500" : "hover:bg-gray-700"}`} onClick={()=>{setDeposit(false)}}>Withdraw</button>
        </div>
        <form
        onSubmit={handleDepositWithdraw}
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
            className="w-full p-3 border border-gray-500 rounded  bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
