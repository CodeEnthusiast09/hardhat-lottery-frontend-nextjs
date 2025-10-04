"use client";

import { Clock, Trophy, Users, Wallet } from "lucide-react";
import Header from "./_components/header";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { wagmiContractConfig } from "@/lib/contracts";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";

export default function Home() {
  const { isConnected, address } = useAccount();

  const publicClient = usePublicClient();

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [players, setPlayers] = useState<string[]>([]);

  const [hasEntered, setHasEntered] = useState(false);

  // Contract read hooks
  const { data: entranceFee } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getEntranceFee",
  });

  const { data: numberOfPlayers } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getNumberOfPlayers",
  });

  const { data: recentWinner } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getRecentWinner",
  });

  const { data: raffleState } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getRaffleState",
  });

  const { data: lastTimeStamp } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getLastTimeStamp",
  });

  const { data: interval } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getInterval",
  });

  // Get contract balance (prize pool)
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: wagmiContractConfig.address as `0x${string}`,
  });

  // Write contract hook
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // useEffect(() => {
  //   if (isConfirmed && hash) {
  //     showNotification(
  //       "success",
  //       "You have successfully entered the raffle! Good luck!",
  //       "Entry Confirmed"
  //     );
  //     // Refetch balance and player data
  //     refetchBalance();
  //   }
  // }, [isConfirmed, hash, refetchBalance]);

  // // Handle transaction errors
  // useEffect(() => {
  //   if (isPending) {
  //     showNotification(
  //       "pending",
  //       "Please confirm the transaction in your wallet...",
  //       "Transaction Pending"
  //     );
  //   }
  // }, [isPending]);

  // Calculate time until next draw
  useEffect(() => {
    if (lastTimeStamp && interval) {
      const updateCountdown = () => {
        const now = Math.floor(Date.now() / 1000);
        const nextDraw = Number(lastTimeStamp) + Number(interval);
        const timeRemaining = Math.max(0, nextDraw - now);

        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = timeRemaining % 60;

        setTimeLeft({ hours, minutes, seconds });
      };

      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);

      return () => clearInterval(timer);
    }
  }, [lastTimeStamp, interval]);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!numberOfPlayers || !publicClient) return;

      const total = Number(numberOfPlayers);

      const playerPromises = Array.from({ length: total }, (_, i) =>
        // low-level read call
        publicClient.readContract({
          ...wagmiContractConfig,
          functionName: "getPlayer",
          args: [BigInt(i)],
        }),
      );

      const playerAddresses = await Promise.all(playerPromises);
      setPlayers(playerAddresses as string[]);
    };

    fetchPlayers();
  }, [numberOfPlayers]);

  useEffect(() => {
    if (!address || players.length === 0) return;

    const entered = players.some(
      (p) => p.toLowerCase() === address.toLowerCase(),
    );
    setHasEntered(entered);
  }, [players, address]);

  const enterRaffle = async () => {
    if (!entranceFee) return;

    writeContract({
      ...wagmiContractConfig,
      functionName: "enterRaffle",
      value: entranceFee as bigint,
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const estimatedPrizePool = balanceData?.value ?? BigInt(0);

  const isRaffleOpen = raffleState?.toString() === "0";

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>

      <Header />

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div>
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-[50px]">
            <h1 className="text-5xl font-bold text-balance leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Decentralized Lottery
              </span>
              <br />
              <span className="text-foreground">Made Simple</span>
            </h1>
            <p className="text-muted-foreground text-xl text-pretty max-w-4xl mx-auto leading-relaxed">
              Experience the future of lottery gaming with blockchain
              technology. Every draw is verifiable, every winner is guaranteed,
              and every player has equal odds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <div className="liquid-glass p-6 text-center border-white/10 rounded-xl">
                <div className="text-3xl font-bold text-primary mb-2">🎲</div>
                <h3 className="font-semibold mb-2">Provably Fair</h3>
                <p className="text-sm text-muted-foreground">
                  Smart contracts ensure complete transparency and fairness in
                  every draw
                </p>
              </div>

              <div className="liquid-glass p-6 text-center border-white/10 rounded-xl">
                <div className="text-3xl font-bold text-accent mb-2">💎</div>
                <h3 className="font-semibold mb-2">Instant Payouts</h3>
                <p className="text-sm text-muted-foreground">
                  Winners receive their prizes automatically through smart
                  contracts
                </p>
              </div>

              <div className="liquid-glass p-6 text-center border-white/10 rounded-xl">
                <div className="text-3xl font-bold text-primary mb-2">🌍</div>
                <h3 className="font-semibold mb-2">Global Access</h3>
                <p className="text-sm text-muted-foreground">
                  Play from anywhere in the world with just your crypto wallet
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="liquid-glass p-5 rounded-xl border-white/10">
              <div className="pb-4">
                <div className="flex items-center space-x-3 text-xl mb-5">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <span>Wallet Connection</span>
                </div>
                <div className="text-muted-foreground text-base mb-5">
                  {isConnected
                    ? "Your wallet is connected and ready to play"
                    : "Connect your MetaMask wallet to participate in the lottery"}
                </div>
              </div>
              <div className="space-y-6">
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="liquid-glass p-4 rounded-xl border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Connected Account
                          </span>
                          <span className="text-sm font-mono">
                            {address && formatAddress(address)}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            Entry Fee:{" "}
                            {entranceFee
                              ? formatEther(entranceFee as bigint)
                              : "0"}
                            ETH
                          </span>
                        </div>

                        <button
                          onClick={enterRaffle}
                          disabled={
                            !isRaffleOpen ||
                            isPending ||
                            isConfirming ||
                            !entranceFee ||
                            hasEntered
                          }
                          className="bg-[#0039d9] disabled:bg-gray-600 disabled:cursor-not-allowed p-3.5 rounded-lg font-bold tracking-widest transition-all hover:bg-[#0033c7]"
                        >
                          {isPending || isConfirming
                            ? "Entering..."
                            : hasEntered
                              ? "Draw in Progress"
                              : "Enter Raffle"}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full pulse-dot"></div>
                        <span className="text-green-400 font-medium">
                          {isRaffleOpen
                            ? "Connected & Ready to Play"
                            : "Raffle Draw in Progress"}
                        </span>
                      </div>
                      {isConfirmed && (
                        <div className="text-green-400 text-sm text-center">
                          Successfully entered the raffle!
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <ConnectButton />
                  </div>
                )}
              </div>
            </div>

            <div className="liquid-glass w-full mx-auto p-5 rounded-xl border-white/10">
              <div className="pb-4">
                <div className="flex items-center space-x-3 text-xl mb-5">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                  <span>Current Prize Pool</span>
                </div>
                <div className="text-muted-foreground text-base">
                  Total ETH accumulated for the next draw
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-4xl text-center mb-5 font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  {estimatedPrizePool ? formatEther(estimatedPrizePool) : "0"}
                  ETH
                </div>

                <div className="liquid-glass p-3 rounded-xl border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Participants</span>
                    <span className="font-medium">
                      {numberOfPlayers ? numberOfPlayers.toString() : "0"}{" "}
                      players
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="liquid-glass p-5 rounded-xl border-white/10">
              <div className="pb-4">
                <div className="flex items-center space-x-3 text-xl mb-5">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <span>Next Draw</span>
                </div>
                <div className="text-muted-foreground text-base">
                  Countdown to the next lottery draw
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-foreground">
                    {String(timeLeft.hours).padStart(2, "0")}:
                    {String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Hours : Minutes : Seconds
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {isRaffleOpen
                    ? "Draw happens automatically when time is up"
                    : "Winner selection in progress..."}
                </div>
              </div>
            </div>

            <div className="liquid-glass p-5 rounded-xl border-white/10">
              <div className="pb-4">
                <div className="flex items-center space-x-3 text-xl mb-5">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <span>Recent Winner</span>
                </div>
                <div className="text-muted-foreground text-base">
                  Latest lottery winner
                </div>
              </div>
              <div className="space-y-3">
                {recentWinner &&
                recentWinner !==
                  "0x0000000000000000000000000000000000000000" ? (
                  <div className="liquid-glass p-3 rounded-xl border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">
                        {formatAddress(recentWinner as string)}
                      </span>
                      <span className="text-green-400 font-medium">
                        {estimatedPrizePool
                          ? formatEther(estimatedPrizePool)
                          : "0"}{" "}
                        ETH
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Latest winner
                    </div>
                  </div>
                ) : (
                  <div className="liquid-glass p-3 rounded-xl border-white/10">
                    <div className="text-center text-muted-foreground">
                      No winner yet - be the first!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
