import ConnectWallet from "@/components/connect";
import Connect from "@/components/connect";
import { WalletProvider } from "@/components/context";
import Image from "next/image";

export default function Home() {
  return (
    <WalletProvider>
      <div>
        <ConnectWallet />
      </div>
    </WalletProvider>
  );
}
