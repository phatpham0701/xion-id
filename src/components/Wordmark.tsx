import { BRAND } from "@/lib/brand";

type Props = { className?: string };

/** Two-tone wordmark — XION (white) + ID (gradient). */
export const Wordmark = ({ className }: Props) => (
  <span className={className} style={{ letterSpacing: "0.02em" }}>
    {BRAND.wordmarkPrefix}
    <span className="text-gradient-brand">{BRAND.wordmarkSuffix}</span>
  </span>
);
