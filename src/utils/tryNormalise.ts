export const tryNormalise = async (name: string) => {
  const { normalize } = await import("viem/utils/ens/normalize");
  try {
    return normalize(name);
    // eslint-disable-next-line no-empty
  } catch {
    return null;
  }
};
