import type { ClientWithEns } from "@ensdomains/ensjs/contracts";
import getExpiry from "@ensdomains/ensjs/functions/public/getExpiry";
import type { IRequest } from "itty-router";
import { getEnsAddress } from "viem/actions/ens/getEnsAddress";
import { getEnsAvatar } from "viem/actions/ens/getEnsAvatar";
import { AvatarWithEnsIcon } from "../components/AvatarWithEnsIcon";
import { LargeEnsIcon } from "../components/LargeEnsIcon";
import { Layout } from "../components/Layout";
import { client } from "../utils/consts";
import { generateImage } from "../utils/generateImage";
import { isSupportedTld } from "../utils/isSupportedTld";
import { normaliseAvatar } from "../utils/normaliseAvatar";
import { getRegistrationStatus } from "../utils/registrationStatus";
import { shortenAddress } from "../utils/shortenAddress";
import { tryNormalise } from "../utils/tryNormalise";

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
    getExpiry(client as ClientWithEns, {
      name: normalisedName,
    }),
    isSupportedTld(normalisedName),
  ]);

  const avatarSrc = await normaliseAvatar({
    type: "name",
    name: normalisedName,
    avatar,
  });

  const registrationStatus = getRegistrationStatus({
    name: normalisedName,
    expiryData,
    supportedTld,
  });

  if (registrationStatus === null)
    return new Response(undefined, { status: 200 });

  const element =
    registrationStatus === "available" ? (
      <Layout
        imageElement={<LargeEnsIcon />}
        title={name}
        subtitle="Available to register"
        type="name"
      />
    ) : (
      <Layout
        imageElement={<AvatarWithEnsIcon src={avatarSrc} />}
        title={name}
        subtitle={ethAddress ? shortenAddress(ethAddress) : undefined}
        type="name"
      />
    );

  return generateImage(element);
};
