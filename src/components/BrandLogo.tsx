type Props = {
  className?: string;
  size?: number;
  /** When true, render only the orbit + star (no wordmark). */
  iconOnly?: boolean;
};

/**
 * XIONID brand mark — orbit ring + sparkle star + indigo dot.
 * Pure SVG so it scales crisply at any size and respects currentColor.
 */
export const BrandLogo = ({ className, size = 36 }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="xid-orbit" x1="8" y1="56" x2="56" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="hsl(165 71% 67%)" />
        <stop offset="55%" stopColor="hsl(213 100% 71%)" />
        <stop offset="100%" stopColor="hsl(246 89% 67%)" />
      </linearGradient>
      <linearGradient id="xid-star" x1="20" y1="44" x2="44" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="hsl(220 27% 93%)" />
      </linearGradient>
    </defs>
    {/* Orbit ring */}
    <circle cx="32" cy="32" r="22" stroke="url(#xid-orbit)" strokeWidth="3" />
    {/* Indigo dot on orbit */}
    <circle cx="50" cy="18" r="4.5" fill="hsl(246 89% 67%)" />
    {/* Four-point sparkle star */}
    <path
      d="M32 14 L35.2 28.8 L50 32 L35.2 35.2 L32 50 L28.8 35.2 L14 32 L28.8 28.8 Z"
      fill="url(#xid-star)"
    />
  </svg>
);

export default BrandLogo;
