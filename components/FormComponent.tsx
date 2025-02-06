"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/components/context/index";

// The contract ABI and address (replace with your contract's ABI and address)
const contractAddress = "0x969deCDb279e5A3629Ba8d0A4aF0834d481ECda0";
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Invested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"WithdrawInvestment","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"MyMoney","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getData","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWithdrawalFromLiquidityPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"invest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stablecoin","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalInvestment","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"uniswapRouter","outputs":[{"internalType":"contract IPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawInvest","outputs":[],"stateMutability":"nonpayable","type":"function"}];

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
  
    // Deposit function
    const depositFunds = async () => {
      try {
        fetchDeposits();
        const contract = await getContract();
        const tx = await contract.deposit(amount); // Assuming the amount is in ETH
        setLoading(true);
        await tx.wait();
        alert("Deposit successful!");
        // getUpdatedBalance();
        // getTotalPool();
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
        // getUpdatedBalance();
        // getTotalPool();
      } catch (error) {
        console.error("Withdrawal failed", error);
        alert("Withdrawal failed");
      } finally {
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
    
    if(deposit) depositFunds();
    else withdrawFunds();
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
