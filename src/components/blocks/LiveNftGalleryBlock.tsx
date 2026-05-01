import { useEffect, useState } from "react";
import { Gem, Loader2, ExternalLink, AlertCircle, ImageOff } from "lucide-react";
import { fetchGalleryForContract, type NftItem } from "@/lib/nftGallery";
import { XION_CONFIG, truncateAddress } from "@/lib/xion";

type Props = {
  ownerAddress?: string | null;
  contracts: string[];
  limit: number;
  title: string;
};

export const LiveNftGalleryBlock = ({ ownerAddress, contracts, limit, title }: Props) => {
  const [items, setItems] = useState<NftItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerAddress || contracts.length === 0) {
      setStatus("ready");
      setItems([]);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError(null);

    (async () => {
      try {
        const perContract = Math.max(1, Math.ceil(limit / contracts.length));
        const results = await Promise.allSettled(
          contracts.map((c) => fetchGalleryForContract(c.trim(), ownerAddress, perContract)),
        );
        if (cancelled) return;
        const merged = results
          .filter((r): r is PromiseFulfilledResult<NftItem[]> => r.status === "fulfilled")
          .flatMap((r) => r.value)
          .slice(0, limit);
        setItems(merged);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load NFTs");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ownerAddress, contracts.join(","), limit]);

  if (!ownerAddress) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-5 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-2xl bg-muted/40 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold">NFT gallery not available</div>
        <p className="mt-1 text-xs text-muted-foreground">Owner hasn't connected a XION wallet.</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-5 text-center">
        <div className="text-sm font-semibold">Add a CW721 contract to start</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Owner needs to add at least one NFT collection contract address.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-secondary/15 text-secondary">
          <Gem className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-[10px] text-muted-foreground">Live · on-chain</div>
        </div>
      </div>

      {status === "loading" ? (
        <div className="flex items-center justify-center rounded-2xl border border-border/40 bg-background/40 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : status === "error" ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {error || "Couldn't load NFTs"}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-background/40 p-5 text-center text-xs text-muted-foreground">
          No NFTs found in these collections for{" "}
          <span className="font-mono">{truncateAddress(ownerAddress, 6, 4)}</span>.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((nft) => (
            <a
              key={`${nft.contract}-${nft.tokenId}`}
              href={XION_CONFIG.explorerAddr(nft.contract)}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-background/40 transition-transform hover:scale-[1.02]"
            >
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name || `Token #${nft.tokenId}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground">
                  <ImageOff className="h-6 w-6" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-2">
                <div className="truncate text-[11px] font-semibold text-foreground">
                  {nft.name || `#${nft.tokenId}`}
                </div>
                {nft.collection ? (
                  <div className="truncate text-[9px] text-muted-foreground">{nft.collection}</div>
                ) : null}
              </div>
              <ExternalLink className="absolute right-1.5 top-1.5 h-3 w-3 text-foreground/60 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
