import { useMemo, useState } from "react";
import {
  Plus,
  Sparkles,
  Search,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Heart,
  BadgeCheck,
  Link2,
  Youtube,
  Wallet,
  Grid2X2,
  Layers3,
  Wand2,
} from "lucide-react";
import { FullPreviewDialog } from "./FullPreviewDialog";
import { validateBlockConfig, summarizeIssues, type ValidationIssue } from "@/lib/blockValidation";
import { BLOCK_LIBRARY, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, type Block, type BlockMeta } from "@/lib/blocks";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BlockRenderer } from "./BlockRenderer";
import { DEFAULT_THEME, themeStyleVars, BACKGROUNDS, FONTS } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
  PERSONAS,
  SORT_LABELS,
  sortLibrary,
  scoreBlock,
  type BlockPrefs,
  type Persona,
  type SortMode,
} from "@/lib/blockRanking";

type Props = {
  onAdd: (meta: BlockMeta) => void;
  prefs: BlockPrefs;
  onPrefsChange: (patch: Partial<BlockPrefs>) => void;
};

type Badge = NonNullable<BlockMeta["badge"]>;
type BlockType = BlockMeta["type"];
type CategoryFilter = BlockMeta["category"] | "all";

type KitDefinition = {
  title: string;
  description: string;
  icon: typeof Heart;
  accent: string;
  blockTypes: readonly BlockType[];
};

const PREVIEW_THEME = DEFAULT_THEME;

const BADGE_STYLES: Partial<Record<Badge, string>> = {
  Popular: "bg-primary/15 text-primary border-primary/30",
  Essential: "bg-secondary/15 text-secondary border-secondary/30",
  Web3: "bg-accent/15 text-accent border-accent/30",
  Pro: "bg-muted text-foreground border-border",
};

const ALL_BADGES: Badge[] = ["Essential", "Popular", "Web3", "Pro"];

const CREATOR_RECOMMENDED_TYPES = [
  "avatar",
  "social",
  "link",
  "video_embed",
  "tip_jar",
  "wallet",
] as const satisfies readonly BlockType[];

const KIT_DEFINITIONS: KitDefinition[] = [
  {
    title: "Creator Starter Kit",
    description: "Hero, socials, links, and a XION tip card for creators.",
    icon: Heart,
    accent: "from-primary/20 to-secondary/20",
    blockTypes: ["avatar", "social", "link", "tip_jar"] as const satisfies readonly BlockType[],
  },
  {
    title: "YouTube Creator Kit",
    description: "Video, social links, and creator support blocks.",
    icon: Youtube,
    accent: "from-red-500/15 to-primary/20",
    blockTypes: ["avatar", "video_embed", "social", "tip_jar"] as const satisfies readonly BlockType[],
  },
  {
    title: "XION Passport Kit",
    description: "Wallet, token, NFT, and on-chain identity blocks.",
    icon: BadgeCheck,
    accent: "from-primary/20 to-cyan-500/15",
    blockTypes: ["avatar", "wallet", "token_balance", "nft"] as const satisfies readonly BlockType[],
  },
  {
    title: "Link Hub Kit",
    description: "A clean link-in-bio setup for fast publishing.",
    icon: Link2,
    accent: "from-secondary/15 to-primary/15",
    blockTypes: ["avatar", "heading", "text", "link", "social"] as const satisfies readonly BlockType[],
  },
];

const getBadgeClass = (badge?: BlockMeta["badge"]) => {
  if (!badge) return "";
  return BADGE_STYLES[badge] || "bg-muted text-foreground border-border";
};

const makePreviewBlock = (meta: BlockMeta): Block =>
  ({
    id: `preview-${meta.type}`,
    profile_id: "preview",
    type: meta.type,
    position: 0,
    config: meta.previewConfig,
    is_visible: true,
  }) as Block;

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
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{title}</div>

      {issues.map((issue, index) => {
        const isError = issue.severity === "error";
        const Icon = isError ? AlertCircle : AlertTriangle;

        return (
          <div
            key={`${issue.field}-${index}`}
            className={cn(
              "flex items-start gap-1.5 text-[11px] leading-snug rounded-md px-2 py-1.5 border",
              isError
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400",
            )}
          >
            <Icon className="h-3 w-3 mt-0.5 shrink-0" />
            <span>
              <span className="font-medium">{issue.field}</span>
              <span className="opacity-80"> · {issue.message}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

const BlockPreview = ({ meta, onExpand }: { meta: BlockMeta; onExpand: () => void }) => {
  const style = themeStyleVars(PREVIEW_THEME);
  const previewBlock = makePreviewBlock(meta);
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

            {meta.badge ? (
              <span
                className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full border font-medium uppercase tracking-wider",
                  getBadgeClass(meta.badge),
                )}
              >
                {meta.badge}
              </span>
            ) : null}
          </div>

          <div className="text-[11px] text-muted-foreground leading-snug">{meta.description}</div>
        </div>
      </div>

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

      {previewIssues.length > 0 ? <IssueList issues={previewIssues} title="Sample preview issues" /> : null}

      <IssueList
        issues={defaultIssues}
        title={
          defaultIssues.length === 0
            ? "Ready to add — no required fields missing"
            : "You'll need to fill in after adding"
        }
      />

      <div className="space-y-1.5">
        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-snug">
          <span className="text-primary mt-0.5">●</span>
          <span>
            <span className="font-medium text-foreground/90">When to use: </span>
            {meta.useCase}
          </span>
        </div>

        {meta.tip ? (
          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-snug">
            <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
            <span>{meta.tip}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const BlockRow = ({
  meta,
  onAdd,
  showFitScore,
  prefs,
  compact = false,
}: {
  meta: BlockMeta;
  onAdd: (meta: BlockMeta) => void;
  showFitScore: boolean;
  prefs: BlockPrefs;
  compact?: boolean;
}) => {
  const fit = showFitScore ? Math.min(100, Math.round(scoreBlock(meta, prefs) / 2)) : null;
  const defaultIssues = validateBlockConfig(meta.type, meta.defaultConfig);
  const { errors, warnings } = summarizeIssues(defaultIssues);
  const [fullOpen, setFullOpen] = useState(false);

  const handleAdd = () => onAdd(meta);

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={handleAdd}
          className={cn(
            "w-full rounded-xl text-left group transition-all flex items-start gap-3",
            compact
              ? "border border-border/40 bg-background/40 p-2.5 hover:border-primary/40 hover:bg-card/70"
              : "glass p-3 hover:border-primary/50 hover:bg-card/80",
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center shrink-0 group-hover:bg-primary/20 transition-colors relative">
            <meta.icon className="h-3.5 w-3.5 text-primary" />

            {errors > 0 ? (
              <span
                className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold grid place-items-center"
                aria-label={`${errors} required field${errors > 1 ? "s" : ""} missing`}
              >
                {errors}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="text-sm font-medium leading-tight truncate">{meta.label}</div>

              {meta.badge ? (
                <span
                  className={cn(
                    "text-[8px] px-1 py-0.5 rounded-full border font-medium uppercase tracking-wider shrink-0",
                    getBadgeClass(meta.badge),
                  )}
                >
                  {meta.badge}
                </span>
              ) : null}

              {fit !== null && fit >= 70 ? (
                <span className="text-[8px] px-1 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                  {fit}% fit
                </span>
              ) : null}

              {errors === 0 && warnings > 0 ? (
                <span className="text-[8px] px-1 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium shrink-0 inline-flex items-center gap-0.5">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {warnings}
                </span>
              ) : null}
            </div>

            <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">
              {meta.description}
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
        <BlockPreview meta={meta} onExpand={() => setFullOpen(true)} />

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="h-9 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {errors > 0 ? "Add — needs setup" : "Add to profile"}
          </button>

          <button
            type="button"
            onClick={() => setFullOpen(true)}
            className="h-9 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
            aria-label="Open full preview"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Full
          </button>
        </div>
      </HoverCardContent>

      <FullPreviewDialog meta={meta} open={fullOpen} onOpenChange={setFullOpen} onAdd={onAdd} />
    </HoverCard>
  );
};

const KitCard = ({
  kit,
  blockMap,
  onAdd,
}: {
  kit: KitDefinition;
  blockMap: Map<BlockType, BlockMeta>;
  onAdd: (meta: BlockMeta) => void;
}) => {
  const Icon = kit.icon;
  const items = kit.blockTypes.map((type) => blockMap.get(type)).filter((item): item is BlockMeta => Boolean(item));

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/40">
      <div className={cn("bg-gradient-to-br p-4", kit.accent)}>
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-background/50 backdrop-blur">
            <Icon className="h-5 w-5 text-primary" />
          </div>

          <div>
            <div className="text-sm font-semibold">{kit.title}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{kit.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-3">
        {items.map((meta) => (
          <button
            key={`${kit.title}-${meta.type}`}
            type="button"
            onClick={() => onAdd(meta)}
            className="flex w-full items-center gap-2 rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-left text-xs transition-all hover:border-primary/40 hover:bg-card/70"
          >
            <meta.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">{meta.label}</span>
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export const BlockLibrary = ({ onAdd, prefs, onPrefsChange }: Props) => {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [badgeFilter, setBadgeFilter] = useState<Set<Badge>>(new Set());

  const showFit = prefs.sortMode === "recommended";

  const blockMap = useMemo(() => new Map<BlockType, BlockMeta>(BLOCK_LIBRARY.map((block) => [block.type, block])), []);

  const recommendedBlocks = useMemo(
    () =>
      CREATOR_RECOMMENDED_TYPES.map((type) => blockMap.get(type)).filter((item): item is BlockMeta => Boolean(item)),
    [blockMap],
  );

  const toggleBadge = (badge: Badge) => {
    setBadgeFilter((current) => {
      const next = new Set(current);
      if (next.has(badge)) {
        next.delete(badge);
      } else {
        next.add(badge);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setBadgeFilter(new Set());
  };

  const hasFilters = query.trim() !== "" || categoryFilter !== "all" || badgeFilter.size > 0;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return BLOCK_LIBRARY.filter((block) => {
      if (categoryFilter !== "all" && block.category !== categoryFilter) return false;
      if (badgeFilter.size > 0 && (!block.badge || !badgeFilter.has(block.badge))) return false;

      if (!normalizedQuery) return true;

      const haystack = `${block.label} ${block.description} ${block.useCase} ${block.type}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, categoryFilter, badgeFilter]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="blocks" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="blocks" className="text-xs">
            Blocks
          </TabsTrigger>
          <TabsTrigger value="kits" className="text-xs">
            Creator Kits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />

            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search blocks…"
              className="h-9 pl-8 pr-8 text-xs"
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>

          {!hasFilters ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-xs font-semibold">Recommended for creators</div>
                  <div className="text-[11px] text-muted-foreground">
                    Build a profile, add support tools, and show XION identity.
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {recommendedBlocks.map((block) => (
                  <BlockRow
                    key={`recommended-${block.type}`}
                    meta={block}
                    onAdd={onAdd}
                    showFitScore={showFit}
                    prefs={prefs}
                    compact
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {(["all", ...Object.keys(CATEGORY_LABELS)] as CategoryFilter[]).map((category) => {
                const active = categoryFilter === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full border transition-colors font-medium",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
                    )}
                  >
                    {category === "all" ? "All" : CATEGORY_LABELS[category as BlockMeta["category"]]}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ALL_BADGES.map((badge) => {
                const active = badgeFilter.has(badge);

                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => toggleBadge(badge)}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full border transition-all font-medium",
                      active
                        ? `${getBadgeClass(badge)} ring-1 ring-current`
                        : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
                    )}
                  >
                    {badge}
                  </button>
                );
              })}

              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          {!query ? (
            <div className="rounded-2xl border border-border/50 bg-background/40 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-3.5 w-3.5 text-primary" />
                <div className="text-xs font-medium">Profile type & sort</div>
              </div>

              <Select value={prefs.persona} onValueChange={(value) => onPrefsChange({ persona: value as Persona })}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PERSONAS.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.emoji} {persona.label} · {persona.hint}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={prefs.sortMode} onValueChange={(value) => onPrefsChange({ sortMode: value as SortMode })}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {SORT_LABELS[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-background/40 p-6 text-center">
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-muted">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium">No blocks match your filters.</div>
              <button type="button" onClick={clearFilters} className="mt-3 text-xs text-primary hover:underline">
                Clear filters
              </button>
            </div>
          ) : prefs.sortMode === "category" && !hasFilters ? (
            <div className="space-y-5">
              {(Object.keys(CATEGORY_LABELS) as BlockMeta["category"][]).map((category) => {
                const items = filtered.filter((block) => block.category === category);
                if (items.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <Grid2X2 className="h-3.5 w-3.5 text-primary" />
                        {CATEGORY_LABELS[category]}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {CATEGORY_DESCRIPTIONS[category]}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {items.map((block) => (
                        <BlockRow key={block.type} meta={block} onAdd={onAdd} showFitScore={showFit} prefs={prefs} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold">
                  {hasFilters
                    ? `${filtered.length} result${filtered.length === 1 ? "" : "s"}`
                    : SORT_LABELS[prefs.sortMode]}
                </div>

                {showFit && !hasFilters ? (
                  <div className="text-[11px] text-muted-foreground">
                    Tuned for {PERSONAS.find((persona) => persona.id === prefs.persona)?.label}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                {sortLibrary(filtered, prefs).map((block) => (
                  <BlockRow key={block.type} meta={block} onAdd={onAdd} showFitScore={showFit} prefs={prefs} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="kits" className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15">
                <Layers3 className="h-5 w-5 text-primary" />
              </div>

              <div>
                <div className="text-sm font-semibold">Starter kits</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Add blocks from curated creator kits. This keeps profiles beautiful, mobile-first, and easy to
                  publish.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {KIT_DEFINITIONS.map((kit) => (
              <KitCard key={kit.title} kit={kit} blockMap={blockMap} onAdd={onAdd} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
