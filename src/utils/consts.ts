import { addEnsContracts } from "@ensdomains/ensjs";
import { createClient, http } from "viem";
import { mainnet } from "viem/chains";

export const client = createClient({
  chain: addEnsContracts(mainnet),
  transport: http("https://mainnet.gateway.tenderly.co/4imxc4hQfRjxrVB2kWKvTo"),
  batch: {
    multicall: {
      batchSize: 8196,
    },
  },
});
