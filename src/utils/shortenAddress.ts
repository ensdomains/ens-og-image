import type { Address } from "viem";

export const shortenAddress = (address: Address) =>
  `${address.slice(0, 7)}...${address.slice(-5)}`;
