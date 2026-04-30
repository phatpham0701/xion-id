import { Plus, Sparkles } from "lucide-react";
import {
  BLOCK_LIBRARY, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, type BlockMeta,
} from "@/lib/blocks";
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BlockRenderer } from "./BlockRenderer";
import { DEFAULT_THEME, themeStyleVars, BACKGROUNDS, FONTS } from "@/lib/theme";
import { cn } from "@/lib/utils";

type Props = { onAdd: (meta: BlockMeta) => void };

const PREVIEW_THEME = DEFAULT_THEME;

const BADGE_STYLES: Record<NonNullable<BlockMeta["badge"]>, string> = {
  Popular: "bg-primary/15 text-primary border-primary/30",
  Essential: "bg-secondary/15 text-secondary border-secondary/30",
  Web3: "bg-accent/15 text-accent border-accent/30",
  Pro: "bg-muted text-foreground border-border",
};

const BlockPreview = ({ meta }: { meta: BlockMeta }) => {
  const style = themeStyleVars(PREVIEW_THEME);
  const previewBlock = {
    id: `preview-${meta.type}`,
    profile_id: "preview",
    type: meta.type,
    position: 0,
    config: meta.previewConfig,
    is_visible: true,
  };
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center shrink-0">
          <meta.icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm font-semibold">{meta.label}</div>
            {meta.badge && (
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-medium uppercase tracking-wider", BADGE_STYLES[meta.badge])}>
                {meta.badge}
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground leading-snug">{meta.description}</div>
        </div>
      </div>

      {/* Live preview rendered with real BlockRenderer */}
      <div
        className="rounded-2xl p-4 overflow-hidden border border-border/40"
        style={{
          ...style,
          background: BACKGROUNDS[PREVIEW_THEME.background].css,
          fontFamily: FONTS[PREVIEW_THEME.font].family,
        }}
      >
        <div className="text-foreground">
          <BlockRenderer block={previewBlock} theme={PREVIEW_THEME} />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-snug">
          <span className="text-primary mt-0.5">●</span>
          <span><span className="font-medium text-foreground/90">When to use: </span>{meta.useCase}</span>
        </div>
        {meta.tip && (
          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-snug">
            <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
            <span>{meta.tip}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const BlockLibrary = ({ onAdd }: Props) => {
  const grouped = (Object.keys(CATEGORY_LABELS) as BlockMeta["category"][]).map((cat) => ({
    cat,
    items: BLOCK_LIBRARY.filter((b) => b.category === cat),
  }));

  return (
    <div className="space-y-6">
      {grouped.map(({ cat, items }) => (
        <div key={cat}>
          <div className="px-1 mb-2.5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {CATEGORY_LABELS[cat]}
            </div>
            <div className="text-[10px] text-muted-foreground/70 mt-0.5">
              {CATEGORY_DESCRIPTIONS[cat]}
            </div>
          </div>

          <div className="space-y-1.5">
            {items.map((b) => (
              <HoverCard key={b.type} openDelay={120} closeDelay={80}>
                <HoverCardTrigger asChild>
                  <button
                    onClick={() => onAdd(b)}
                    className="w-full glass rounded-xl p-3 text-left group hover:border-primary/50 hover:bg-card/80 transition-all flex items-start gap-3"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <b.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="text-sm font-medium leading-tight truncate">{b.label}</div>
                        {b.badge && (
                          <span className={cn(
                            "text-[8px] px-1 py-0.5 rounded-full border font-medium uppercase tracking-wider shrink-0",
                            BADGE_STYLES[b.badge],
                          )}>
                            {b.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">
                        {b.description}
                      </div>
                    </div>
                    <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0 mt-1" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent
                  side="right"
                  align="start"
                  sideOffset={12}
                  className="w-80 p-4 glass-strong border-glass-border"
                >
                  <BlockPreview meta={b} />
                  <button
                    onClick={() => onAdd(b)}
                    className="mt-3 w-full h-9 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add to profile
                  </button>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
