import { XION_CONFIG } from "@/lib/xion";

// Minimal CW721 client over the LCD smart-contract query endpoint.
// Endpoint: GET {restUrl}/cosmwasm/wasm/v1/contract/{contract}/smart/{base64Json}

export type NftItem = {
  contract: string;
  tokenId: string;
  name?: string;
  description?: string;
  image?: string;
  collection?: string;
};

const b64 = (obj: unknown) => {
  const json = JSON.stringify(obj);
  // Browser-safe base64
  return btoa(unescape(encodeURIComponent(json)));
};

const smartQuery = async <T>(contract: string, query: unknown): Promise<T> => {
  const url = `${XION_CONFIG.restUrl}/cosmwasm/wasm/v1/contract/${contract}/smart/${b64(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Query failed (${res.status})`);
  const json = (await res.json()) as { data: T };
  return json.data;
};

const ipfsToHttp = (uri?: string) => {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
  }
  return uri;
};

/** Fetch token IDs of `owner` held in `contract` (CW721 standard). */
export const fetchTokensOfOwner = async (
  contract: string,
  owner: string,
  limit = 12,
): Promise<string[]> => {
  const data = await smartQuery<{ tokens: string[] }>(contract, {
    tokens: { owner, limit },
  });
  return data.tokens || [];
};

/** Fetch nft_info (token_uri + extension metadata) for one token. */
export const fetchNftInfo = async (
  contract: string,
  tokenId: string,
): Promise<NftItem> => {
  type NftInfo = {
    token_uri?: string;
    extension?: { name?: string; description?: string; image?: string };
  };
  const data = await smartQuery<NftInfo>(contract, { nft_info: { token_id: tokenId } });

  let meta: { name?: string; description?: string; image?: string } = data.extension || {};

  // If a token_uri is set, try to fetch off-chain metadata too.
  if (data.token_uri) {
    try {
      const uri = ipfsToHttp(data.token_uri)!;
      const res = await fetch(uri);
      if (res.ok) {
        const off = (await res.json()) as { name?: string; description?: string; image?: string };
        meta = { ...off, ...meta };
      }
    } catch {
      /* off-chain fetch errors are non-fatal */
    }
  }

  return {
    contract,
    tokenId,
    name: meta.name,
    description: meta.description,
    image: ipfsToHttp(meta.image),
  };
};

export type CollectionInfo = { name?: string; symbol?: string };
export const fetchContractInfo = async (contract: string): Promise<CollectionInfo> => {
  try {
    return await smartQuery<CollectionInfo>(contract, { contract_info: {} });
  } catch {
    return {};
  }
};

/** Convenience: fetch a full gallery (with metadata) for an owner across one contract. */
export const fetchGalleryForContract = async (
  contract: string,
  owner: string,
  limit = 8,
): Promise<NftItem[]> => {
  const collection = await fetchContractInfo(contract);
  const tokenIds = await fetchTokensOfOwner(contract, owner, limit);
  const items = await Promise.allSettled(tokenIds.map((id) => fetchNftInfo(contract, id)));
  return items
    .filter((r): r is PromiseFulfilledResult<NftItem> => r.status === "fulfilled")
    .map((r) => ({ ...r.value, collection: collection.name }));
};
