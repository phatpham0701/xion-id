// Public XION testnet-2 config — safe to bundle to client.
export const XION_CONFIG = {
  treasury: "xion1m69vedc7x4p0rx3gkgwyrk87qnqda62evvwut7923evqztnx97gq3cst8h",
  rpcUrl: "https://rpc.xion-testnet-2.burnt.com:443",
  restUrl: "https://api.xion-testnet-2.burnt.com:443",
  chainId: "xion-testnet-2",
  denom: "uxion",
  explorerTx: (h: string) => `https://www.mintscan.io/xion-testnet/tx/${h}`,
  explorerAddr: (a: string) => `https://www.mintscan.io/xion-testnet/address/${a}`,
};

export const truncateAddress = (addr?: string | null, head = 8, tail = 6): string => {
  if (!addr) return "";
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
};
