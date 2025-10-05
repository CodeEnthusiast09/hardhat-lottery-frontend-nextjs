export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const formatTimeUnit = (value: number): string => {
  return String(value).padStart(2, "0");
};
