import { useState } from "react";
import { Link } from "react-router-dom";
import { ScanLine, Gift, Pencil, QrCode, Megaphone, BadgeCheck, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ClaimIdDialog } from "@/components/identity/ClaimIdDialog";

type Tile = {
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  hint?: string;
};

type Props = {
  onScan?: () => void;
  onClaimRewards?: () => void;
};

/**
 * Calm command center — 4 primary actions on top, secondary row below.
 */
export const QuickActionTiles = ({ onScan, onClaimRewards }: Props) => {
  const [claimOpen, setClaimOpen] = useState(false);

  const primary: Tile[] = [
    { label: "Verify signal",   icon: ScanLine, onClick: onScan,         hint: "Add a new proof" },
    { label: "Open Offer Box",  icon: Gift,     onClick: onClaimRewards, hint: "See your matches" },
    { label: "Edit in Studio",  icon: Pencil,   to: "/editor",           hint: "Tune your passport" },
    { label: "Create QR",       icon: QrCode,   to: "/qr",               hint: "Share offline" },
  ];

  const secondary: Tile[] = [
    { label: "Campaigns",      icon: Megaphone,  to: "/campaigns" },
    { label: "Claim your ID",  icon: BadgeCheck, onClick: () => setClaimOpen(true) },
  ];

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base font-semibold">Quick actions</h2>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Demo</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {primary.map((t) => {
          const inner = (
            <>
              <div className="h-10 w-10 rounded-xl grid place-items-center mb-3 bg-gradient-primary text-primary-foreground shadow-glow-primary">
                <t.icon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </div>
              <div className="text-sm font-semibold leading-tight">{t.label}</div>
              {t.hint && <div className="text-[11px] text-muted-foreground mt-0.5">{t.hint}</div>}
            </>
          );
          const cls =
            "rounded-2xl p-4 text-left border border-glass-border bg-background/40 hover:border-primary/50 hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
          return t.to ? (
            <Link key={t.label} to={t.to} className={cls}>{inner}</Link>
          ) : (
            <button key={t.label} type="button" onClick={t.onClick} className={cls}>{inner}</button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {secondary.map((t) => {
          const inner = (
            <>
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              <ArrowUpRight className="h-3 w-3 opacity-50" />
            </>
          );
          const cls =
            "inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-background/30 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors";
          return t.to ? (
            <Link key={t.label} to={t.to} className={cls}>{inner}</Link>
          ) : (
            <button key={t.label} type="button" onClick={t.onClick} className={cls}>{inner}</button>
          );
        })}
      </div>

      <ClaimIdDialog open={claimOpen} onOpenChange={setClaimOpen} />
    </div>
  );
};
