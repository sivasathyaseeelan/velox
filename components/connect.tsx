'use client';

import React from "react";
import { useWallet } from "./context/index";

const ConnectWallet: React.FC = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="">
      {account ? (
        <>
          {/* <p className="mb-2 text-green-600">Connected: {account}</p> */}
          <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={disconnectWallet}>
            Disconnect
          </button>
        </>
      ) : (
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;
