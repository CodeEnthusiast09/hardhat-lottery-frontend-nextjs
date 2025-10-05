"use client";

import { Clock, Trophy, Users, Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { formatEther } from "viem";
import { useState, useEffect } from "react";
import { useRaffleData, usePlayers } from "@/hooks/useRaffleData";
import { RAFFLE_ABI } from "@/lib/contracts";
import Header from "./_components/header";
import { useCountdown } from "@/hooks/useCountDown";
import { formatAddress, formatTimeUnit, ZERO_ADDRESS } from "@/lib/utils";

export default function Home() {
  const { isConnected, address } = useAccount();
  const [hasEntered, setHasEntered] = useState(false);

  // Get raffle data
  const {
    entranceFee,
    numberOfPlayers,
    recentWinner,
    raffleState,
    lastTimeStamp,
    interval,
    refetchPlayers,
    contractAddress,
  } = useRaffleData();

  // Get players list
  const { players, isLoading: isLoadingPlayers } = usePlayers(
    numberOfPlayers as bigint | undefined,
    contractAddress
  );

  // Countdown timer
  const timeLeft = useCountdown(
    lastTimeStamp as bigint | undefined,
    interval as bigint | undefined
  );

  // Get contract balance (prize pool)
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: contractAddress,
  });

  // Write contract hook
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Check if user has entered
  useEffect(() => {
    if (!address || players.length === 0) {
      setHasEntered(false);
      return;
    }

    const entered = players.some(
      (p) => p.toLowerCase() === address.toLowerCase()
    );
    setHasEntered(entered);
  }, [players, address]);

  // Refetch data on success
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance();
      refetchPlayers();
    }
  }, [isConfirmed, refetchBalance, refetchPlayers]);

  const enterRaffle = async () => {
    if (!entranceFee) return;

    writeContract({
      address: contractAddress,
      abi: RAFFLE_ABI,
      functionName: "enterRaffle",
      value: entranceFee as bigint,
    });
  };

  const estimatedPrizePool = balanceData?.value ?? BigInt(0);
  const isRaffleOpen = raffleState?.toString() === "0";

  return (
    <div className="bg-background text-foreground relative min-h-screen">
      {/* Floating background orbs */}
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>

      <Header />

      <main className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-[50px] space-y-6 text-center">
          <h1 className="text-5xl leading-tight font-bold text-balance">
            <span className="from-primary via-accent to-primary bg-gradient-to-r bg-clip-text text-transparent">
              Decentralized Lottery
            </span>
            <br />
            <span className="text-foreground">Made Simple</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-4xl text-xl leading-relaxed text-pretty">
            Experience the future of lottery gaming with blockchain technology.
            Every draw is verifiable, every winner is guaranteed, and every
            player has equal odds.
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="liquid-glass rounded-xl border-white/10 p-6 text-center">
              <div className="text-primary mb-2 text-3xl font-bold">🎲</div>
              <h3 className="mb-2 font-semibold">Provably Fair</h3>
              <p className="text-muted-foreground text-sm">
                Smart contracts ensure complete transparency and fairness in
                every draw
              </p>
            </div>

            <div className="liquid-glass rounded-xl border-white/10 p-6 text-center">
              <div className="text-accent mb-2 text-3xl font-bold">💎</div>
              <h3 className="mb-2 font-semibold">Instant Payouts</h3>
              <p className="text-muted-foreground text-sm">
                Winners receive their prizes automatically through smart
                contracts
              </p>
            </div>

            <div className="liquid-glass rounded-xl border-white/10 p-6 text-center">
              <div className="text-primary mb-2 text-3xl font-bold">🌍</div>
              <h3 className="mb-2 font-semibold">Global Access</h3>
              <p className="text-muted-foreground text-sm">
                Play from anywhere in the world with just your crypto wallet
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Wallet Connection Card */}
          <div className="liquid-glass rounded-xl border-white/10 p-5">
            <div className="pb-4">
              <div className="mb-5 flex items-center space-x-3 text-xl">
                <div className="from-primary/20 to-accent/20 rounded-lg bg-gradient-to-br p-2">
                  <Wallet className="text-primary h-6 w-6" />
                </div>
                <span>Wallet Connection</span>
              </div>
              <div className="text-muted-foreground mb-5 text-base">
                {isConnected
                  ? "Your wallet is connected and ready to play"
                  : "Connect your wallet to participate in the lottery"}
              </div>
            </div>
            <div className="space-y-6">
              {isConnected ? (
                <div className="space-y-4">
                  <div className="liquid-glass rounded-xl border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">
                          Connected Account
                        </span>
                        <span className="font-mono text-sm">
                          {address && formatAddress(address)}
                        </span>
                        <span className="text-muted-foreground mt-1 text-xs">
                          Entry Fee:{" "}
                          {entranceFee
                            ? formatEther(entranceFee as bigint)
                            : "0"}{" "}
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
                        className="rounded-lg bg-[#0039d9] p-3.5 font-bold tracking-widest transition-all hover:bg-[#0033c7] disabled:cursor-not-allowed disabled:bg-gray-600"
                      >
                        {isPending || isConfirming
                          ? "Entering..."
                          : hasEntered
                          ? "Already Entered"
                          : "Enter Raffle"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm">
                      <div
                        className={`pulse-dot h-3 w-3 rounded-full ${
                          isRaffleOpen
                            ? "bg-gradient-to-r from-green-400 to-emerald-500"
                            : "bg-gradient-to-r from-yellow-400 to-orange-500"
                        }`}
                      ></div>
                      <span
                        className={`${
                          isRaffleOpen ? "text-green-400" : "text-yellow-400"
                        } font-medium`}
                      >
                        {isRaffleOpen
                          ? "Connected & Ready to Play"
                          : "Raffle Draw in Progress"}
                      </span>
                    </div>
                    {isConfirmed && (
                      <div className="text-center text-sm text-green-400">
                        Successfully entered!
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

          {/* Prize Pool Card */}
          <div className="liquid-glass mx-auto w-full rounded-xl border-white/10 p-5">
            <div className="pb-4">
              <div className="mb-5 flex items-center space-x-3 text-xl">
                <div className="from-accent/20 to-primary/20 rounded-lg bg-gradient-to-br p-2">
                  <Trophy className="text-accent h-6 w-6" />
                </div>
                <span>Current Prize Pool</span>
              </div>
              <div className="text-muted-foreground text-base">
                Total ETH accumulated for the next draw
              </div>
            </div>
            <div className="space-y-4">
              <div className="from-accent to-primary mb-5 bg-gradient-to-r bg-clip-text text-center text-4xl font-bold text-transparent">
                {estimatedPrizePool ? formatEther(estimatedPrizePool) : "0"} ETH
              </div>

              <div className="liquid-glass rounded-xl border-white/10 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-medium">
                    {isLoadingPlayers
                      ? "Loading..."
                      : numberOfPlayers
                      ? numberOfPlayers.toString()
                      : "0"}{" "}
                    players
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Next Draw Card */}
          <div className="liquid-glass rounded-xl border-white/10 p-5">
            <div className="pb-4">
              <div className="mb-5 flex items-center space-x-3 text-xl">
                <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-2">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <span>Next Draw</span>
              </div>
              <div className="text-muted-foreground text-base">
                Countdown to the next lottery draw
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                {lastTimeStamp && interval ? (
                  <>
                    <div className="text-foreground font-mono text-2xl font-bold">
                      {formatTimeUnit(timeLeft.hours)}:
                      {formatTimeUnit(timeLeft.minutes)}:
                      {formatTimeUnit(timeLeft.seconds)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Hours : Minutes : Seconds
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">Loading...</div>
                )}
              </div>
              <div className="text-muted-foreground text-center text-sm">
                {isRaffleOpen
                  ? "Draw happens automatically when time is up"
                  : "Winner selection in progress..."}
              </div>
            </div>
          </div>

          {/* Recent Winner Card */}
          <div className="liquid-glass rounded-xl border-white/10 p-5">
            <div className="pb-4">
              <div className="mb-5 flex items-center space-x-3 text-xl">
                <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20 p-2">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <span>Recent Winner</span>
              </div>
              <div className="text-muted-foreground text-base">
                Latest lottery winner
              </div>
            </div>
            <div className="space-y-3">
              {recentWinner && recentWinner !== ZERO_ADDRESS ? (
                <div className="liquid-glass rounded-xl border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">
                      {formatAddress(recentWinner as string)}
                    </span>
                    <span className="font-medium text-green-400">
                      Winner! 🎉
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Latest winner
                  </div>
                </div>
              ) : (
                <div className="liquid-glass rounded-xl border-white/10 p-3">
                  <div className="text-muted-foreground text-center">
                    No winner yet - be the first!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
