'use client';

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
    <div className="">
      {account ? (
        <>
          <button
            className="px-4 py-2 border text-white rounded ml-2"
            onClick={disconnectWallet}
          >
            {truncateAddress(account)}
          </button>
        </>
      ) : (
        <button className="px-4 py-2 border text-white rounded" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;
