import { BRAND } from "@/lib/brand";

type Props = { className?: string };

/** Two-tone wordmark — XION (white) + ID (gradient). Uses Manrope display weight. */
export const Wordmark = ({ className }: Props) => (
  <span
    className={`font-display ${className ?? ""}`}
    style={{ letterSpacing: "0.02em" }}
    aria-label={`${BRAND.wordmarkPrefix.trim()}${BRAND.wordmarkSuffix}`}
  >
    <span aria-hidden="true">{BRAND.wordmarkPrefix}</span>
    <span aria-hidden="true" className="text-gradient-brand">{BRAND.wordmarkSuffix}</span>
  </span>
);
