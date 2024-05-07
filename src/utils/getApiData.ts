import { apiRouter } from "../routers/api";

type BaseApiDataParameters = {
  url: string;
  ctx: ExecutionContext;
};

type GetApiDataParameters = BaseApiDataParameters &
  (
    | {
        path: "/api/v1/name";
        params: {
          name: string;
        };
      }
    | {
        path: "/api/v1/address";
        params: {
          address: string;
        };
      }
  );

export const getApiData = async <TData = unknown>({
  url: urlString,
  path,
  params,
  ctx,
}: GetApiDataParameters) => {
  const url = new URL(urlString);
  if (path === "/api/v1/name") url.pathname = `${path}/${params.name}`;
  else url.pathname = `${path}/${params.address}`;

  const data = await apiRouter.fetch(new Request(url), undefined, ctx);

  if (data.status !== 200)
    return {
      ok: false,
      error: new Response(await data.text(), { status: data.status }),
    } as const;

  return { ok: true, data: await data.json<TData>() } as const;
};
