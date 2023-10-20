// eslint-disable-next-line import/no-extraneous-dependencies
import { error } from "itty-router";
import { Router } from "itty-router/Router";
import { createCors } from "itty-router/createCors";
import { addressHandler } from "./routes/address";
import { nameHandler } from "./routes/name";

const { corsify } = createCors({
  origins: ["*"],
  methods: ["GET", "OPTIONS"],
  headers: ["Content-Type"],
  maxAge: 30,
});

const router = Router();
router.get("/name/:name", nameHandler);
router.get("/address/:address", addressHandler);

const main = async (request: Request, ctx: ExecutionContext) => {
  const start = performance.now();

  const cache = caches.default;
  const cacheKey = request.url;

  let response = await cache.match(cacheKey);

  if (!response) {
    const result = await router.handle(request);
    const [body1, body2] = result.body?.tee() || [null, null];
    result.headers.append("Cache-Control", "s-maxage=30");
    ctx.waitUntil(cache.put(cacheKey, new Response(body1, result)));
    response = new Response(body2, result);
  } else {
    console.log(`Cache hit - ${cacheKey}`);
  }

  const end = performance.now();

  console.log(`Returned in ${end - start}ms - ${cacheKey}`);

  return response;
};

export default {
  fetch: async (request: Request, _: unknown, ctx: ExecutionContext) =>
    main(request, ctx).catch(error).then(corsify),
};
