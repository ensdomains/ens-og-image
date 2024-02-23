import type { Address } from "viem";

type BaseParams = {
  type: string;
  avatar: string | null;
  name?: string;
  address?: Address;
};

type NameParams = {
  type: "name";
  name: string;
  address?: never;
};

type AddressParams = {
  type: "address";
  address: Address;
  name?: never;
};

type Params = BaseParams & (NameParams | AddressParams);

export const normaliseAvatar = async ({
  type,
  avatar,
  address,
  name,
}: Params) => {
  const { zorbImageDataURI } = await import("./gradient");
  const input = type === "address" ? address : name;

  if (!avatar) {
    return { avatar: zorbImageDataURI(input, type, {} as any) };
  }

  return {
    avatar,
    fallback: zorbImageDataURI(input, type, {} as any),
  };
};
