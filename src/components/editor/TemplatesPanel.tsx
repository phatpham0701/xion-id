import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

/**
 * Inline templates panel — short list with a link to the full gallery
 * so users can swap their starter without leaving the Studio.
 */
export const TemplatesPanel = () => (
  <div className="space-y-3">
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
      <div className="text-xs font-semibold">Pick a starting point</div>
      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
        Start from a polished passport. You can edit anything after applying.
      </p>
    </div>

    <Link
      to="/templates"
      className="block rounded-xl border border-border/40 bg-background/40 p-4 hover:border-primary/40 transition-colors"
    >
      <div className="text-sm font-medium flex items-center gap-1.5">
        Browse all templates <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Includes Essential Rewards, Minimal Card, Badge-First, Creator Hub, and more.
      </p>
    </Link>
  </div>
);
