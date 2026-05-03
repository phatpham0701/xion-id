import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, ScanLine, Gift, QrCode, Megaphone, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ClaimIdDialog } from "@/components/identity/ClaimIdDialog";

type Tile = {
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  hint?: string;
  accent?: boolean;
};

type Props = {
  onScan?: () => void;
  onClaimRewards?: () => void;
};

export const QuickActionTiles = ({ onScan, onClaimRewards }: Props) => {
  const [claimOpen, setClaimOpen] = useState(false);

  const tiles: Tile[] = [
    { label: "Edit profile",     icon: Pencil,     to: "/editor",     hint: "Open the studio" },
    { label: "Scan for badges",  icon: ScanLine,   onClick: onScan,   hint: "Find new proof" },
    { label: "Claim rewards",    icon: Gift,       onClick: onClaimRewards, hint: "See what's unlocked" },
    { label: "QR Center",        icon: QrCode,     to: "/qr",         hint: "All your scannable links" },
    { label: "Campaigns",        icon: Megaphone,  to: "/campaigns",  hint: "Get support" },
    { label: "Claim your ID",    icon: BadgeCheck, accent: true,      onClick: () => setClaimOpen(true), hint: "Reserve your name" },
  ];

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-base font-semibold">Quick actions</h2>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Demo</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {tiles.map((t) => {
          const inner = (
            <>
              <div
                className={`h-9 w-9 rounded-xl grid place-items-center mb-2 ${
                  t.accent
                    ? "bg-gradient-primary text-primary-foreground shadow-glow-primary"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <t.icon className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <div className="text-sm font-medium leading-tight">{t.label}</div>
              {t.hint && <div className="text-[11px] text-muted-foreground mt-0.5">{t.hint}</div>}
            </>
          );

          const className =
            "rounded-2xl p-3 text-left border border-glass-border bg-background/30 hover:border-primary/40 hover:-translate-y-0.5 transition-all";

          if (t.to) {
            return (
              <Link key={t.label} to={t.to} className={className}>
                {inner}
              </Link>
            );
          }
          return (
            <button key={t.label} type="button" onClick={t.onClick} className={className}>
              {inner}
            </button>
          );
        })}
      </div>

      <ClaimIdDialog open={claimOpen} onOpenChange={setClaimOpen} />
    </div>
  );
};

