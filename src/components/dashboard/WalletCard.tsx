import { useState } from "react";
import { Copy, Check, ExternalLink, Loader2, LogOut, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useXionWallet } from "@/hooks/useXionWallet";
import { XION_CONFIG, truncateAddress } from "@/lib/xion";
import { toast } from "sonner";

export const WalletCard = () => {
  const { address, isConnected, isConnecting, connect, disconnect } = useXionWallet();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="glass-strong rounded-3xl p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow-primary glow-primary">
          <Wallet className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-display font-semibold tracking-tight">XION Wallet</h3>
          <p className="text-xs text-muted-foreground">
            {isConnected ? "Connected · xion-testnet-2" : "Sign in with email or social"}
          </p>
        </div>
      </div>

      {!isConnected ? (
        <>
          <Button
            onClick={connect}
            disabled={isConnecting}
            className="w-full h-11 bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium shadow-glow-primary glow-primary"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Zap className="h-4 w-4 mr-1.5" strokeWidth={2.5} />
                Connect XION Wallet
              </>
            )}
          </Button>
          <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
            Powered by Abstraxion · Meta Account · gasless transactions sponsored by your treasury.
          </p>
        </>
      ) : (
        <>
          <div className="glass rounded-2xl p-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-primary shrink-0 grid place-items-center text-[10px] font-bold text-primary-foreground">
              ⚡
            </div>
            <code className="font-mono text-xs flex-1 truncate">
              {truncateAddress(address, 10, 8)}
            </code>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onCopy} aria-label="Copy address">
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" asChild aria-label="View on explorer">
              <a href={XION_CONFIG.explorerAddr(address!)} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>

          <div className="mt-4 rounded-2xl border border-glass-border/60 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">On-chain badges</span>
              <span className="text-muted-foreground">Coming in Step 3</span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
              We'll scan your wallet history and award badges like <em>OG 2024</em>,
              <em> NFT Collector</em>, <em>dApp Explorer</em> — all verified on-chain.
            </p>
          </div>

          <Button
            onClick={disconnect}
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Disconnect
          </Button>
        </>
      )}
    </div>
  );
};
