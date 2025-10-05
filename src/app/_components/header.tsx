import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Zap } from "lucide-react";
import { useChainId } from "wagmi";

const Header = () => {
  const chainId = useChainId();

  const getNetworkName = () => {
    switch (chainId) {
      case 11155111:
        return "Sepolia";
      case 31337:
        return "Hardhat";
      default:
        return "Unknown";
    }
  };

  return (
    <header className="liquid-glass border-b border-white/10 relative z-10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Web3 Lottery
              </span>
              <span className="text-xs text-muted-foreground">
                Network: {getNetworkName()}
              </span>
            </div>
          </div>
          <ConnectButton accountStatus="address" showBalance={false} />
        </div>
      </div>
    </header>
  );
};

export default Header;
