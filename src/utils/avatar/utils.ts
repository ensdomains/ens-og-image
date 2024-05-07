import {
  Address,
  AssetGatewayUrls,
  Chain,
  Client,
  EnsAvatarInvalidNftUriError,
  EnsAvatarUnsupportedNamespaceError,
  EnsAvatarUriResolutionError,
  Transport,
} from "viem";
import { readContract } from "viem/actions";
import { ErrorType } from "viem/errors/utils";
import { EnsAvatarInvalidMetadataError } from "./error";

type UriItem = {
  uri: string;
  isOnChain: boolean;
  isEncoded: boolean;
};

const networkRegex =
  /(?<protocol>https?:\/\/[^\/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/;
const ipfsHashRegex =
  /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/;
const base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/;
const dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;

export type IsImageUriErrorType = ErrorType;

const APNG = "image/apng";
const PNG = "image/png";
const JPEG = "image/jpeg";
const GIF = "image/gif";
const SVG = "image/svg+xml";
const ALLOWED_IMAGE_TYPES = [PNG, APNG, JPEG, GIF, SVG];

export async function isImageUri(uri: string) {
  try {
    const res = await fetch(uri, { method: "HEAD" });
    // retrieve content type header to check if content is image
    if (res.status === 200) {
      const contentType = res.headers.get("content-type");
      return (
        contentType?.startsWith("image/") &&
        ALLOWED_IMAGE_TYPES.includes(contentType)
      );
    }
    return false;
  } catch (error: any) {
    return false;
  }
}

export type GetGatewayErrorType = ErrorType;

export function getGateway(custom: string | undefined, defaultGateway: string) {
  if (!custom) return defaultGateway;
  if (custom.endsWith("/")) return custom.slice(0, -1);
  return custom;
}

export function resolveAvatarUri({
  uri,
  gatewayUrls,
}: {
  uri: string;
  gatewayUrls?: AssetGatewayUrls | undefined;
}): UriItem {
  const isEncoded = base64Regex.test(uri);
  if (isEncoded) return { uri, isOnChain: true, isEncoded };

  const ipfsGateway = getGateway(gatewayUrls?.ipfs, "https://ipfs.euc.li");
  const arweaveGateway = getGateway(
    gatewayUrls?.arweave,
    "https://arweave.net"
  );

  const networkRegexMatch = uri.match(networkRegex);
  const {
    protocol,
    subpath,
    target,
    subtarget = "",
  } = networkRegexMatch?.groups || {};

  const isIPNS = protocol === "ipns:/" || subpath === "ipns/";
  const isIPFS =
    protocol === "ipfs:/" || subpath === "ipfs/" || ipfsHashRegex.test(uri);

  if (uri.startsWith("http") && !isIPNS && !isIPFS) {
    let replacedUri = uri;
    if (gatewayUrls?.arweave)
      replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls?.arweave);
    return { uri: replacedUri, isOnChain: false, isEncoded: false };
  }

  if ((isIPNS || isIPFS) && target) {
    return {
      uri: `${ipfsGateway}/${isIPNS ? "ipns" : "ipfs"}/${target}${subtarget}`,
      isOnChain: false,
      isEncoded: false,
    };
  }

  if (protocol === "ar:/" && target) {
    return {
      uri: `${arweaveGateway}/${target}${subtarget || ""}`,
      isOnChain: false,
      isEncoded: false,
    };
  }

  let parsedUri = uri.replace(dataURIRegex, "");
  if (parsedUri.startsWith("<svg")) {
    // if svg, base64 encode
    parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`;
  }

  if (parsedUri.startsWith("data:") || parsedUri.startsWith("{")) {
    return {
      uri: parsedUri,
      isOnChain: true,
      isEncoded: false,
    };
  }

  throw new EnsAvatarUriResolutionError({ uri });
}

export function getJsonImage(data: any) {
  // validation check for json data, must include one of theses properties
  if (
    typeof data !== "object" ||
    (!("image" in data) && !("image_url" in data) && !("image_data" in data))
  ) {
    throw new EnsAvatarInvalidMetadataError({ data });
  }

  return data.image || data.image_url || data.image_data;
}

export async function getMetadataAvatarUri({
  gatewayUrls,
  uri,
}: {
  gatewayUrls?: AssetGatewayUrls | undefined;
  uri: string;
}): Promise<string> {
  try {
    const res = await fetch(uri).then((res) => res.json());
    const image = await parseAvatarUri({
      gatewayUrls,
      uri: getJsonImage(res),
    });
    return image;
  } catch {
    throw new EnsAvatarUriResolutionError({ uri });
  }
}

export async function parseAvatarUri({
  gatewayUrls,
  uri,
}: {
  gatewayUrls?: AssetGatewayUrls | undefined;
  uri: string;
}): Promise<string> {
  const { uri: resolvedURI } = resolveAvatarUri({
    uri,
    gatewayUrls,
  });
  return resolvedURI;
}

type ParsedNft = {
  chainID: number;
  namespace: string;
  contractAddress: Address;
  tokenID: string;
};

export function parseNftUri(uri_: string): ParsedNft {
  let uri = uri_;
  // parse valid nft spec (CAIP-22/CAIP-29)
  // @see: https://github.com/ChainAgnostic/CAIPs/tree/master/CAIPs
  if (uri.startsWith("did:nft:")) {
    // convert DID to CAIP
    uri = uri.replace("did:nft:", "").replace(/_/g, "/");
  }

  const [reference, asset_namespace, tokenID] = uri.split("/");
  const [eip_namespace, chainID] = reference.split(":");
  const [erc_namespace, contractAddress] = asset_namespace.split(":");

  if (!eip_namespace || eip_namespace.toLowerCase() !== "eip155")
    throw new EnsAvatarInvalidNftUriError({ reason: "Only EIP-155 supported" });
  if (!chainID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Chain ID not found" });
  if (!contractAddress)
    throw new EnsAvatarInvalidNftUriError({
      reason: "Contract address not found",
    });
  if (!tokenID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Token ID not found" });
  if (!erc_namespace)
    throw new EnsAvatarInvalidNftUriError({
      reason: "ERC namespace not found",
    });

  return {
    chainID: parseInt(chainID),
    namespace: erc_namespace.toLowerCase(),
    contractAddress: contractAddress as Address,
    tokenID,
  };
}

export async function getNftTokenUri<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  { nft }: { nft: ParsedNft }
) {
  if (nft.namespace === "erc721") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "tokenURI",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "tokenId", type: "uint256" }],
          outputs: [{ name: "", type: "string" }],
        },
      ],
      functionName: "tokenURI",
      args: [BigInt(nft.tokenID)],
    });
  }
  if (nft.namespace === "erc1155") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "uri",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "_id", type: "uint256" }],
          outputs: [{ name: "", type: "string" }],
        },
      ],
      functionName: "uri",
      args: [BigInt(nft.tokenID)],
    });
  }
  throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace });
}
