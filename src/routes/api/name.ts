import { getExpiry } from "@ensdomains/ensjs/public";
import { json, type IRequest } from "itty-router";
import { Address } from "viem";
import { getEnsAddress } from "viem/ens";
import { getEnsAvatar } from "../../utils/avatar/getEnsAvatar";
import { client } from "../../utils/consts";
import { isSupportedTld } from "../../utils/isSupportedTld";
import {
  RegistrationStatus,
  getRegistrationStatus,
} from "../../utils/registrationStatus";
import { tryNormalise } from "../../utils/tryNormalise";

export type ApiNameHandlerResponse =
  | {
      error: "unsupported";
    }
  | {
      normalisedName: string;
      avatar: string;
      ethAddress: Address;
      registrationStatus: RegistrationStatus;
    };

export const nameHandler = async ({ params }: IRequest) => {
  const name = decodeURIComponent(params.name);
  if (!name) {
    return new Response("No name provided", { status: 400 });
  }

  const normalisedName = await tryNormalise(name);
  if (!normalisedName) return new Response("Invalid name", { status: 400 });

  const [avatar, ethAddress, expiryData, supportedTld] = await Promise.all([
    getEnsAvatar(client, {
      name: normalisedName,
    }),
    getEnsAddress(client, {
      name: normalisedName,
    }),
    getExpiry(client, {
      name: normalisedName,
    }),
    isSupportedTld(normalisedName),
  ]);

  const registrationStatus = getRegistrationStatus({
    name: normalisedName,
    expiryData,
    supportedTld,
  });

  if (registrationStatus === null)
    return json({ error: "unsupported" } as ApiNameHandlerResponse);

  return json({
    normalisedName,
    avatar,
    ethAddress,
    registrationStatus,
  } as ApiNameHandlerResponse);
};
