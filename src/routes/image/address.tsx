import type { IRequest } from "itty-router";
import { AvatarWithEnsIcon } from "../../components/AvatarWithEnsIcon";
import { Layout } from "../../components/Layout";
import { generateImage } from "../../utils/generateImage";
import { getApiData } from "../../utils/getApiData";
import { normaliseAvatar } from "../../utils/normaliseAvatar";
import { shortenAddress } from "../../utils/shortenAddress";
import { ApiAddressHandlerResponse } from "../api/address";

export const addressHandler = async (
  { params, url }: IRequest,
  _: unknown,
  ctx: ExecutionContext
) => {
  const apiResponse = await getApiData<ApiAddressHandlerResponse>({
    url,
    path: "/api/v1/address",
    params: { address: params.address },
    ctx,
  });

  if (!apiResponse.ok) return apiResponse.error;

  const { avatar, normalisedAddress, primaryName } = apiResponse.data;

  const avatarSrc = await normaliseAvatar({
    type: "address",
    avatar,
    address: normalisedAddress,
  });

  const element = (
    <Layout
      imageElement={<AvatarWithEnsIcon avatarSrc={avatarSrc} />}
      title={shortenAddress(normalisedAddress)}
      subtitle={primaryName}
      type="address"
    />
  );

  return generateImage(element);
};
