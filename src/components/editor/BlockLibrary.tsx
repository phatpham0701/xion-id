import { useMemo, useState } from "react";
import { Plus, Sparkles, ArrowUpDown, Search, X, AlertTriangle, AlertCircle, CheckCircle2, Maximize2 } from "lucide-react";
import { FullPreviewDialog } from "./FullPreviewDialog";
import { toast } from "sonner";
import { validateBlockConfig, summarizeIssues, type ValidationIssue } from "@/lib/blockValidation";
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

const IssueList = ({ issues, title }: { issues: ValidationIssue[]; title: string }) => {
  if (issues.length === 0) {
    return (
      <div className="flex items-start gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 leading-snug">
        <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
        <span>{title}</span>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {title}
      </div>
      {issues.map((iss, i) => {
        const isError = iss.severity === "error";
        const Icon = isError ? AlertCircle : AlertTriangle;
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-1.5 text-[11px] leading-snug rounded-md px-2 py-1.5 border",
              isError
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400",
            )}
          >
            <Icon className="h-3 w-3 mt-0.5 shrink-0" />
            <span>
              <span className="font-medium">{iss.field}</span>
              <span className="opacity-80"> · {iss.message}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

const BlockPreview = ({ meta, onExpand }: { meta: BlockMeta; onExpand: () => void }) => {
  const style = themeStyleVars(PREVIEW_THEME);
  const previewBlock = {
    id: `preview-${meta.type}`,
    profile_id: "preview",
    type: meta.type,
    position: 0,
    config: meta.previewConfig,
    is_visible: true,
  };
  const previewIssues = validateBlockConfig(meta.type, meta.previewConfig);
  const defaultIssues = validateBlockConfig(meta.type, meta.defaultConfig);

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

      {/* Click the inline preview to open full-screen view. */}
      <button
        type="button"
        onClick={onExpand}
        className="relative w-full rounded-2xl p-4 overflow-hidden border border-border/40 group hover:border-primary/40 transition-colors text-left"
        style={{
          ...style,
          background: BACKGROUNDS[PREVIEW_THEME.background].css,
          fontFamily: FONTS[PREVIEW_THEME.font].family,
        }}
        aria-label="Open full-screen preview"
      >
        <div className="text-foreground pointer-events-none">
          <BlockRenderer block={previewBlock} theme={PREVIEW_THEME} />
        </div>
        <div className="absolute top-2 right-2 h-6 px-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-medium text-foreground">
          <Maximize2 className="h-3 w-3" />
          Full preview
        </div>
      </button>

      {/* Issues with the live preview content (rare — sample data should be valid). */}
      {previewIssues.length > 0 && (
        <IssueList issues={previewIssues} title="Sample preview issues" />
      )}

      {/* Issues with what will actually be inserted when adding the block. */}
      <IssueList
        issues={defaultIssues}
        title={defaultIssues.length === 0 ? "Ready to add — no required fields missing" : "You'll need to fill in after adding"}
      />

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
  const fit = showFitScore ? Math.min(100, Math.round(scoreBlock(meta, prefs) / 2)) : null;
  const defaultIssues = validateBlockConfig(meta.type, meta.defaultConfig);
  const { errors, warnings } = summarizeIssues(defaultIssues);
  const [fullOpen, setFullOpen] = useState(false);

  const handleAdd = () => {
    onAdd(meta);
  };

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          onClick={handleAdd}
          className="w-full glass rounded-xl p-3 text-left group hover:border-primary/50 hover:bg-card/80 transition-all flex items-start gap-3"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center shrink-0 group-hover:bg-primary/20 transition-colors relative">
            <meta.icon className="h-3.5 w-3.5 text-primary" />
            {errors > 0 && (
              <span
                className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold grid place-items-center"
                aria-label={`${errors} required field${errors > 1 ? "s" : ""} missing`}
              >
                {errors}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
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
              {errors === 0 && warnings > 0 && (
                <span className="text-[8px] px-1 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium shrink-0 inline-flex items-center gap-0.5">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {warnings}
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
        <BlockPreview meta={meta} onExpand={() => setFullOpen(true)} />
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <button
            onClick={handleAdd}
            className="h-9 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {errors > 0 ? "Add — needs setup" : "Add to profile"}
          </button>
          <button
            onClick={() => setFullOpen(true)}
            className="h-9 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
            aria-label="Open full preview"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Full
          </button>
        </div>
      </HoverCardContent>
      <FullPreviewDialog
        meta={meta}
        open={fullOpen}
        onOpenChange={setFullOpen}
        onAdd={onAdd}
      />
    </HoverCard>
  );
};

type Badge = NonNullable<BlockMeta["badge"]>;
type CategoryFilter = BlockMeta["category"] | "all";

const ALL_BADGES: Badge[] = ["Essential", "Popular", "Web3", "Pro"];

export const BlockLibrary = ({ onAdd, prefs, onPrefsChange }: Props) => {
  const showFit = prefs.sortMode === "recommended";
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [badgeFilter, setBadgeFilter] = useState<Set<Badge>>(new Set());

  const toggleBadge = (b: Badge) => {
    setBadgeFilter((cur) => {
      const next = new Set(cur);
      next.has(b) ? next.delete(b) : next.add(b);
      return next;
    });
  };

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setBadgeFilter(new Set());
  };

  const hasFilters = query.trim() !== "" || categoryFilter !== "all" || badgeFilter.size > 0;

  // Apply search + filters before sorting/grouping.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOCK_LIBRARY.filter((b) => {
      if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
      if (badgeFilter.size > 0 && (!b.badge || !badgeFilter.has(b.badge))) return false;
      if (!q) return true;
      const haystack = `${b.label} ${b.description} ${b.useCase} ${b.type}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, categoryFilter, badgeFilter]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blocks…"
          className="h-9 pl-8 pr-8 text-xs"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1">
        {(["all", ...Object.keys(CATEGORY_LABELS)] as CategoryFilter[]).map((cat) => {
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full border transition-colors font-medium",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
              )}
            >
              {cat === "all" ? "All" : CATEGORY_LABELS[cat as BlockMeta["category"]]}
            </button>
          );
        })}
      </div>

      {/* Badge filter chips */}
      <div className="flex flex-wrap gap-1 items-center">
        {ALL_BADGES.map((b) => {
          const active = badgeFilter.has(b);
          return (
            <button
              key={b}
              onClick={() => toggleBadge(b)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full border transition-all font-medium",
                active ? BADGE_STYLES[b] + " ring-1 ring-current" : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
              )}
            >
              {b}
            </button>
          );
        })}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Persona + Sort controls (collapsed when actively searching) */}
      <details className="group" open={!query}>
        <summary className="cursor-pointer text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1 select-none">
          <ArrowUpDown className="h-3 w-3" />
          Profile type & sort
        </summary>
        <div className="space-y-2.5 mt-2.5">
          <Select value={prefs.persona} onValueChange={(v) => onPrefsChange({ persona: v as Persona })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERSONAS.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  <span className="mr-1.5">{p.emoji}</span>{p.label}
                  <span className="ml-2 text-muted-foreground">· {p.hint}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={prefs.sortMode} onValueChange={(v) => onPrefsChange({ sortMode: v as SortMode })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortMode[]).map((m) => (
                <SelectItem key={m} value={m} className="text-xs">{SORT_LABELS[m]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </details>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 px-4">
          <div className="text-xs text-muted-foreground mb-2">No blocks match your filters.</div>
          <button onClick={clearFilters} className="text-xs text-primary hover:underline">
            Clear filters
          </button>
        </div>
      ) : prefs.sortMode === "category" && !hasFilters ? (
        // Group by category only when no filters are active.
        <div className="space-y-5">
          {(Object.keys(CATEGORY_LABELS) as BlockMeta["category"][]).map((cat) => {
            const items = filtered.filter((b) => b.category === cat);
            if (items.length === 0) return null;
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
              {hasFilters ? `${filtered.length} result${filtered.length === 1 ? "" : "s"}` : SORT_LABELS[prefs.sortMode]}
            </div>
            {showFit && !hasFilters && (
              <div className="text-[9px] text-muted-foreground/70">
                Tuned for {PERSONAS.find((p) => p.id === prefs.persona)?.label}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {sortLibrary(filtered, prefs).map((b) => (
              <BlockRow key={b.type} meta={b} onAdd={onAdd} showFitScore={showFit && !hasFilters} prefs={prefs} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
