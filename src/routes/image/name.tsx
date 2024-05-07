import type { IRequest } from "itty-router";
import { AvatarWithEnsIcon } from "../../components/AvatarWithEnsIcon";
import { LargeEnsIcon } from "../../components/LargeEnsIcon";
import { Layout } from "../../components/Layout";
import { generateImage } from "../../utils/generateImage";
import { getApiData } from "../../utils/getApiData";
import { normaliseAvatar } from "../../utils/normaliseAvatar";
import { shortenAddress } from "../../utils/shortenAddress";
import { ApiNameHandlerResponse } from "../api/name";

export const nameHandler = async (
  { params, url }: IRequest,
  _: unknown,
  ctx: ExecutionContext
) => {
  const apiResponse = await getApiData<ApiNameHandlerResponse>({
    url,
    path: "/api/v1/name",
    params: { name: params.name },
    ctx,
  });

  if (!apiResponse.ok) return apiResponse.error;

  const data = apiResponse.data;

  if ("error" in data) return new Response(undefined, { status: 200 });

  const { normalisedName, avatar, ethAddress, registrationStatus } = data;

  const avatarSrc = await normaliseAvatar({
    type: "name",
    name: normalisedName,
    avatar,
  });

  const element =
    registrationStatus === "available" ? (
      <Layout
        imageElement={<LargeEnsIcon />}
        title={normalisedName}
        subtitle="Available to register"
        type="name"
      />
    ) : (
      <Layout
        imageElement={<AvatarWithEnsIcon avatarSrc={avatarSrc} />}
        title={normalisedName}
        subtitle={ethAddress ? shortenAddress(ethAddress) : undefined}
        type="name"
      />
    );

  return generateImage(element);
};
