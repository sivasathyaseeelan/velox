"use client";

import DashboardNavbar from "@/components/DashboardNavbar";
import FormComponent from "@/components/FormComponent";
import { useWallet } from "@/components/context/index"; // Import the wallet context

export default function Page() {
  const { account } = useWallet(); // Get wallet connection status

  return (
    <div className="w-full h-screen bg-cover bg-center flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1 items-center justify-center w-full">
        {account ? (
          <div className="flex flex-1 items-center justify-center w-full">
            <div className="flex flex-1 items-center justify-center w-[50%]">
              Overview
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