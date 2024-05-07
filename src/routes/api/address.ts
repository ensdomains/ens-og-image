import { getName } from "@ensdomains/ensjs/public";
import { error, json, type IRequest } from "itty-router";
import type { Address } from "viem";
import { getAddress } from "viem/utils/address/getAddress";
import { getEnsAvatar } from "../../utils/avatar/getEnsAvatar";
import { client } from "../../utils/consts";
import { tryNormalise } from "../../utils/tryNormalise";

export type ApiAddressHandlerResponse = {
  normalisedAddress: Address;
  primaryName: string;
  avatar: string;
};

export const addressHandler = async ({ params }: IRequest) => {
  const address = decodeURIComponent(params.address);
  if (!address) {
    return error(400, "No address provided");
  }

  let normalisedAddress: Address;
  try {
    normalisedAddress = getAddress(address);
  } catch {
    return error(400, "Invalid address");
  }

  const nameData = await getName(client, {
    address: normalisedAddress,
  });

  let primaryName = nameData?.match ? nameData.name : null;

  if (primaryName) {
    const normalisedName = await tryNormalise(primaryName);
    if (!normalisedName || normalisedName !== primaryName) primaryName = null;
  }

  const avatar = primaryName
    ? await getEnsAvatar(client, {
        name: primaryName,
      })
    : null;

  return json({
    normalisedAddress,
    primaryName,
    avatar,
  } as ApiAddressHandlerResponse);
};
