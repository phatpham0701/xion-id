import { BRAND } from "@/lib/brand";

type Props = { className?: string };

/** Two-tone wordmark — keep brand string in one place. */
export const Wordmark = ({ className }: Props) => (
  <span className={className}>
    {BRAND.wordmarkPrefix}
    <span className="text-gradient">{BRAND.wordmarkSuffix}</span>
  </span>
);
