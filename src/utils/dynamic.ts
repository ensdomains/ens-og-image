import type { ClientWithEns } from "@ensdomains/ensjs/contracts";
import type { GetExpiryParameters } from "@ensdomains/ensjs/functions/public/getExpiry";
import type { GetNameParameters } from "@ensdomains/ensjs/functions/public/getName";

export const getName = async (client: ClientWithEns, args: GetNameParameters) =>
  await import("@ensdomains/ensjs/functions/public/getName").then((m) =>
    m.default(client, args)
  );
export const getExpiry = async (
  client: ClientWithEns,
  args: GetExpiryParameters
) =>
  await import("@ensdomains/ensjs/functions/public/getExpiry").then((m) =>
    m.default(client, args)
  );
