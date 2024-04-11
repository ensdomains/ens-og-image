import { IRequest, Router, cors, error } from "itty-router";
import { addressHandler } from "./routes/address";
import { nameHandler } from "./routes/name";

const { preflight, corsify } = cors({
  allowMethods: ["GET", "OPTIONS"],
  allowHeaders: ["Content-Type"],
  // cache cors preflight for 1 day
  maxAge: 86400,
});

const cacheMatch = async (request: IRequest) => {
  request.start = performance.now();

  const cache = caches.default;
  const cacheUrl = new URL(request.url);

  console.log("[cacheMatch] getting cached response...");

  const response = await cache.match(cacheUrl.toString());

  if (response) {
    console.log("[cacheMatch] got cached response!");
    request.wasCached = true;
    return new Response(response.body, response);
  } else {
    console.log("[cacheMatch] no cached response found");
  }
};

const cachePut = async (
  response: Response,
  request: IRequest,
  _: unknown,
  ctx: ExecutionContext
) => {
  const cache = caches.default;
  const cacheUrl = new URL(request.url);

  console.log("[cachePut] putting response in cache...");

  if (!request.wasCached) {
    console.log("[cachePut] response was not cached, storing in cache");
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
    console.log("[cachePut] response was already cached, not storing in cache");
  }

  const end = performance.now();

  console.log("[perf] request took", end - request.start, "ms");
};

const missing = () => error(404);

const router = Router({
  before: [preflight, cacheMatch],
  catch: (err) => {
    console.error(err);
    return error(500, "Internal Server Error");
  },
  finally: [(response) => response ?? missing(), cachePut, corsify],
});
router.get("/name/:name", nameHandler);
router.get("/address/:address", addressHandler);

export default { ...router };
