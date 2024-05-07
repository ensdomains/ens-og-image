import { IRequest, Router, error } from "itty-router";

const cacheMatch = async (request: IRequest) => {
  request.start = performance.now();

  // @ts-expect-error
  const cache = caches.default;
  const cacheUrl = new URL(request.url);

  console.log(`[${cacheUrl.pathname}][cacheMatch] getting cached response...`);

  const response = await cache.match(cacheUrl.toString());

  if (response) {
    console.log(`[${cacheUrl.pathname}][cacheMatch] got cached response!`);
    request.wasCached = true;
    return new Response(response.body, response);
  } else {
    console.log(`[${cacheUrl.pathname}][cacheMatch] no cached response found`);
  }
};

const cachePut = async (
  response: Response,
  request: IRequest,
  _: unknown,
  ctx: ExecutionContext
) => {
  // @ts-expect-error
  const cache = caches.default;
  const cacheUrl = new URL(request.url);

  console.log(`[${cacheUrl.pathname}][cachePut] putting response in cache...`);

  if (!request.wasCached) {
    console.log(
      `[${cacheUrl.pathname}][cachePut] response was not cached, storing in cache`
    );
    response.headers.set(
      "Cache-Control",
      "max-age=0, no-cache, no-store, must-revalidate"
    );
    response.headers.set(
      "CDN-Cache-Control",
      // cache image for 30 minutes, can reuse as stale for 4 hours, and if error can reuse for 1 minute
      "public, immutable, no-transform, max-age=1800, stale-while-revalidate=14400, stale-if-error=60"
    );
    ctx.waitUntil(cache.put(cacheUrl.toString(), response.clone()));
  } else {
    console.log(
      `[${cacheUrl.pathname}][cachePut] response was already cached, not storing in cache`
    );
  }

  const end = performance.now();

  console.log(
    `[${cacheUrl.pathname}][perf] request took`,
    end - request.start,
    "ms"
  );
};

export const createBaseRouter = ({ base }: { base: string }) =>
  Router<IRequest, [unknown, ctx: ExecutionContext], Response>({
    base,
    before: [cacheMatch],
    catch: (err) => {
      console.error(err);
      return error(500, "Internal Server Error");
    },
    finally: [cachePut],
  });
