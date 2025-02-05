"use client";

import React from "react";
import { useWallet } from "./context/index";

const ConnectWallet: React.FC = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();

  // Function to truncate the wallet address
  const truncateAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div>
      {account ? (
        <button
          className="w-40 px-4 py-2 border text-white rounded text-center truncate"
          onClick={disconnectWallet}
        >
          {truncateAddress(account)}
        </button>
      ) : (
        <button
          className="w-40 px-4 py-2 border text-white rounded text-center"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;
