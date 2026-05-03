// XION Abstraxion / Treasury config — read from Vite env.
//
// Treasury contracts are app-specific. We do NOT ship a hardcoded fallback
// because pointing at someone else's treasury silently breaks fee grants.
//
// Required env (see .env.example):
//   VITE_CHAIN_ID
//   VITE_RPC_URL
//   VITE_REST_URL
//   VITE_GAS_PRICE
//   VITE_TREASURY_ADDRESS  (preferred; VITE_XION_TREASURY supported as legacy fallback)
//   VITE_AUTH_APP_URL

const env = import.meta.env;

const pick = (...vals: Array<string | undefined>): string =>
  (vals.find((v) => typeof v === "string" && v.trim().length > 0) ?? "").trim();

const TREASURY = pick(
  env.VITE_TREASURY_ADDRESS as string | undefined,
  env.VITE_XION_TREASURY as string | undefined, // legacy
);

const CHAIN_ID = pick(env.VITE_CHAIN_ID as string | undefined) || "xion-testnet-2";
const RPC_URL =
  pick(env.VITE_RPC_URL as string | undefined) || "https://rpc.xion-testnet-2.burnt.com:443";
const REST_URL =
  pick(env.VITE_REST_URL as string | undefined) || "https://api.xion-testnet-2.burnt.com";
const GAS_PRICE = pick(env.VITE_GAS_PRICE as string | undefined) || "0.001uxion";
const AUTH_APP_URL =
  pick(env.VITE_AUTH_APP_URL as string | undefined) || "https://auth.testnet.burnt.com";

export const XION_CONFIG = {
  chainId: CHAIN_ID,
  treasury: TREASURY,
  rpcUrl: RPC_URL,
  restUrl: REST_URL,
  gasPrice: GAS_PRICE,
  authAppUrl: AUTH_APP_URL,
  denom: "uxion",
  explorerTx: (h: string) => `https://www.mintscan.io/xion-testnet/tx/${h}`,
  explorerAddr: (a: string) => `https://www.mintscan.io/xion-testnet/address/${a}`,
};

export const isTreasuryConfigured = (): boolean => XION_CONFIG.treasury.length > 0;

export const getXionConfigError = (): string | null => {
  const missing: string[] = [];
  if (!XION_CONFIG.treasury) missing.push("VITE_TREASURY_ADDRESS");
  if (!XION_CONFIG.authAppUrl) missing.push("VITE_AUTH_APP_URL");
  if (missing.length === 0) return null;
  return `XION access is not configured yet. Add ${missing.join(" and ")}.`;
};

export const xionEnvStatus = () => ({
  VITE_CHAIN_ID: !!pick(env.VITE_CHAIN_ID as string | undefined),
  VITE_RPC_URL: !!pick(env.VITE_RPC_URL as string | undefined),
  VITE_REST_URL: !!pick(env.VITE_REST_URL as string | undefined),
  VITE_GAS_PRICE: !!pick(env.VITE_GAS_PRICE as string | undefined),
  VITE_TREASURY_ADDRESS: !!TREASURY,
  VITE_AUTH_APP_URL: !!pick(env.VITE_AUTH_APP_URL as string | undefined),
});

export const truncateAddress = (addr?: string | null, head = 8, tail = 6): string => {
  if (!addr) return "";
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
};
