import ConnectWallet from "./connect";

const Navbar = () => {
    return (
      <nav className="text-white py-4 px-6 flex justify-between items-center shadow-md w-full">
        <div className="container mx-auto flex justify-between items-center">
          {/* Title on the left */}
          <h1 className="text-5xl font-bold">velox</h1>
          
          {/* Connect Wallet Button on the right */}
          <ConnectWallet />
        </div>
      </nav>
    );
  };
  
export default Navbar;