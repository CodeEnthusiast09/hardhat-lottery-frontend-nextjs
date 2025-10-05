import { useState, useEffect } from "react";
import { usePublicClient, useReadContract, useChainId } from "wagmi";
import { getContractAddress, RAFFLE_ABI } from "@/lib/contracts";

export const useRaffleData = () => {
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  // Read contract data
  const { data: entranceFee } = useReadContract({
    address: contractAddress,
    abi: RAFFLE_ABI,
    functionName: "getEntranceFee",
  });

  const { data: numberOfPlayers, refetch: refetchPlayers } = useReadContract({
    address: contractAddress,
    abi: RAFFLE_ABI,
    functionName: "getNumberOfPlayers",
  });

  const { data: recentWinner } = useReadContract({
    address: contractAddress,
    abi: RAFFLE_ABI,
    functionName: "getRecentWinner",
  });

  const { data: raffleState } = useReadContract({
    address: contractAddress,
    abi: RAFFLE_ABI,
    functionName: "getRaffleState",
  });

  const { data: lastTimeStamp } = useReadContract({
    address: contractAddress,
    abi: RAFFLE_ABI,
    functionName: "getLastTimeStamp",
  });

  const { data: interval } = useReadContract({
    address: contractAddress,
    abi: RAFFLE_ABI,
    functionName: "getInterval",
  });

  return {
    entranceFee,
    numberOfPlayers,
    recentWinner,
    raffleState,
    lastTimeStamp,
    interval,
    refetchPlayers,
    contractAddress,
  };
};

export const usePlayers = (
  numberOfPlayers: bigint | undefined,
  contractAddress: `0x${string}`
) => {
  const publicClient = usePublicClient();
  const [players, setPlayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!numberOfPlayers || !publicClient || Number(numberOfPlayers) === 0) {
        setPlayers([]);
        return;
      }

      setIsLoading(true);
      try {
        const total = Number(numberOfPlayers);
        const playerPromises = Array.from({ length: total }, (_, i) =>
          publicClient.readContract({
            address: contractAddress,
            abi: RAFFLE_ABI,
            functionName: "getPlayer",
            args: [BigInt(i)],
          })
        );

        const playerAddresses = await Promise.all(playerPromises);
        setPlayers(playerAddresses as string[]);
      } catch (error) {
        console.error("Error fetching players:", error);
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPlayers();
  }, [numberOfPlayers, publicClient, contractAddress]);

  return { players, isLoading };
};
