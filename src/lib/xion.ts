// Public XION testnet-2 config — safe to bundle to client.
//
// IMPORTANT: `treasury` must be a real contract address you own on
// xion-testnet-2. Create one at https://dashboard.burnt.com (Treasury tab),
// then set VITE_XION_TREASURY in your project's environment.
//
// If unset, wallet connect will be disabled with a friendly message instead
// of crashing inside Abstraxion's "Unable to load application details" modal.

const ENV_TREASURY = (import.meta.env.VITE_XION_TREASURY as string | undefined)?.trim();

// Bech32 quick check — Abstraxion will reject anything that isn't a
// well-formed xion1… contract address with a valid checksum.
const isLikelyXionAddress = (addr: string | undefined): addr is string =>
  !!addr && /^xion1[02-9ac-hj-np-z]{38,72}$/.test(addr);

export const XION_CONFIG = {
  // Empty string when not configured — code paths must check `isTreasuryConfigured`.
  treasury: isLikelyXionAddress(ENV_TREASURY) ? ENV_TREASURY : "",
  rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
  // NOTE: REST URL must NOT carry an explicit :443 suffix — some Cosmos SDK
  // routes 404 when the port is appended. Matches Burnt's official demo .env.
  restUrl: "https://api.xion-testnet-2.burnt.com",
  chainId: "xion-testnet-2",
  denom: "uxion",
  explorerTx: (h: string) => `https://www.mintscan.io/xion-testnet/tx/${h}`,
  explorerAddr: (a: string) => `https://www.mintscan.io/xion-testnet/address/${a}`,
};

export const isTreasuryConfigured = (): boolean => XION_CONFIG.treasury.length > 0;

export const truncateAddress = (addr?: string | null, head = 8, tail = 6): string => {
  if (!addr) return "";
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
};
