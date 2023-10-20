import type { ClientWithEns } from "@ensdomains/ensjs/contracts";
import type { IRequest } from "itty-router";
import type { Address } from "viem";
import { getEnsAvatar } from "viem/actions/ens/getEnsAvatar";
import { getAddress } from "viem/utils/address/getAddress";
import { AvatarWithEnsIcon } from "../components/AvatarWithEnsIcon";
import { Layout } from "../components/Layout";
import { client } from "../utils/consts";
import { getName } from "../utils/dynamic";
import { generateImage } from "../utils/generateImage";
import { normaliseAvatar } from "../utils/normaliseAvatar";
import { shortenAddress } from "../utils/shortenAddress";
import { tryNormalise } from "../utils/tryNormalise";

export const addressHandler = async ({ params }: IRequest) => {
  const address = decodeURIComponent(params.address);
  if (!address) {
    return new Response("No address provided", { status: 400 });
  }

  let normalisedAddress: Address;
  try {
    normalisedAddress = getAddress(address);
  } catch {
    return new Response("Invalid address", { status: 400 });
  }

  const nameData = await getName(client as ClientWithEns, {
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

  const avatarSrc = await normaliseAvatar({
    type: "address",
    avatar,
    address: normalisedAddress,
  });

  const element = (
    <Layout
      imageElement={<AvatarWithEnsIcon src={avatarSrc} />}
      title={shortenAddress(normalisedAddress)}
      subtitle={primaryName}
      type="address"
    />
  );

  return generateImage(element);
};
