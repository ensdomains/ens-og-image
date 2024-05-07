import { normalize } from "viem/ens";

export const tryNormalise = async (name: string) => {
  try {
    return normalize(name);
    // eslint-disable-next-line no-empty
  } catch {
    return null;
  }
};
