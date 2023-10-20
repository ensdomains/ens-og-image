import { addEnsContracts } from "@ensdomains/ensjs/contracts/addEnsContracts";
import type { mainnet as mainnetT } from "viem/chains";
import { mainnet } from "viem/chains/definitions/mainnet";
import type { Chain } from "viem/chains/index";
import type { Client } from "viem/clients/createClient";
import { createClient } from "viem/clients/createClient";
import type { HttpTransport } from "viem/clients/transports/http";
import { http } from "viem/clients/transports/http";

export const client = createClient({
  chain: addEnsContracts(mainnet as typeof mainnetT) as Chain,
  transport: http("https://web3.ens.domains/v1/mainnet"),
}) as Client<HttpTransport, any>;

export const emptyAddress = "0x0000000000000000000000000000000000000000";
