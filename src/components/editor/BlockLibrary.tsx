import { useMemo, useState } from "react";
import { Plus, Sparkles, ArrowUpDown, Search, X } from "lucide-react";
import {
  BLOCK_LIBRARY, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, type BlockMeta,
} from "@/lib/blocks";
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BlockRenderer } from "./BlockRenderer";
import { DEFAULT_THEME, themeStyleVars, BACKGROUNDS, FONTS } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
  PERSONAS, SORT_LABELS, sortLibrary, scoreBlock,
  type BlockPrefs, type Persona, type SortMode,
} from "@/lib/blockRanking";

type Props = {
  onAdd: (meta: BlockMeta) => void;
  prefs: BlockPrefs;
  onPrefsChange: (patch: Partial<BlockPrefs>) => void;
};

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

const BlockRow = ({
  meta, onAdd, showFitScore, prefs,
}: { meta: BlockMeta; onAdd: (m: BlockMeta) => void; showFitScore: boolean; prefs: BlockPrefs }) => {
  // Normalize score → 0-100 for display.
  const fit = showFitScore ? Math.min(100, Math.round(scoreBlock(meta, prefs) / 2)) : null;
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          onClick={() => onAdd(meta)}
          className="w-full glass rounded-xl p-3 text-left group hover:border-primary/50 hover:bg-card/80 transition-all flex items-start gap-3"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <meta.icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <div className="text-sm font-medium leading-tight truncate">{meta.label}</div>
              {meta.badge && (
                <span className={cn(
                  "text-[8px] px-1 py-0.5 rounded-full border font-medium uppercase tracking-wider shrink-0",
                  BADGE_STYLES[meta.badge],
                )}>
                  {meta.badge}
                </span>
              )}
              {fit !== null && fit >= 70 && (
                <span className="text-[8px] px-1 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                  {fit}% fit
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">
              {meta.description}
            </div>
          </div>
          <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0 mt-1" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" sideOffset={12} className="w-80 p-4 glass-strong border-glass-border">
        <BlockPreview meta={meta} />
        <button
          onClick={() => onAdd(meta)}
          className="mt-3 w-full h-9 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add to profile
        </button>
      </HoverCardContent>
    </HoverCard>
  );
};

export const BlockLibrary = ({ onAdd, prefs, onPrefsChange }: Props) => {
  const showFit = prefs.sortMode === "recommended";

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="space-y-2.5">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
            Profile type
          </label>
          <Select
            value={prefs.persona}
            onValueChange={(v) => onPrefsChange({ persona: v as Persona })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERSONAS.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  <span className="mr-1.5">{p.emoji}</span>
                  {p.label}
                  <span className="ml-2 text-muted-foreground">· {p.hint}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1.5 flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" />
            Sort by
          </label>
          <Select
            value={prefs.sortMode}
            onValueChange={(v) => onPrefsChange({ sortMode: v as SortMode })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortMode[]).map((m) => (
                <SelectItem key={m} value={m} className="text-xs">
                  {SORT_LABELS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {prefs.sortMode === "category" ? (
        <div className="space-y-5">
          {(Object.keys(CATEGORY_LABELS) as BlockMeta["category"][]).map((cat) => {
            const items = BLOCK_LIBRARY.filter((b) => b.category === cat);
            return (
              <div key={cat}>
                <div className="px-1 mb-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {CATEGORY_LABELS[cat]}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {CATEGORY_DESCRIPTIONS[cat]}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {items.map((b) => (
                    <BlockRow key={b.type} meta={b} onAdd={onAdd} showFitScore={false} prefs={prefs} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="px-1 mb-2 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {SORT_LABELS[prefs.sortMode]}
            </div>
            {showFit && (
              <div className="text-[9px] text-muted-foreground/70">
                Tuned for {PERSONAS.find((p) => p.id === prefs.persona)?.label}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {sortLibrary(BLOCK_LIBRARY, prefs).map((b) => (
              <BlockRow key={b.type} meta={b} onAdd={onAdd} showFitScore={showFit} prefs={prefs} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
