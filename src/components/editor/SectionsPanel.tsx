import { Plus } from "lucide-react";
import { SECTION_PRESETS, SECTION_PRESET_GROUPS, type SectionPreset } from "@/lib/sectionPresets";
import type { BlockMeta } from "@/lib/blocks";
import { BLOCK_LIBRARY } from "@/lib/blocks";
import { cn } from "@/lib/utils";
import type { StudioMode } from "@/lib/studioMode";

type Props = {
  mode: StudioMode;
  onAddSection: (preset: SectionPreset) => void;
};

const metaByType = new Map<string, BlockMeta>(BLOCK_LIBRARY.map((b) => [b.type, b]));

export const SectionsPanel = ({ mode, onAddSection }: Props) => {
  const presets = mode === "standard"
    ? SECTION_PRESETS.filter((p) => p.audience.includes("standard"))
    : SECTION_PRESETS;

  const groups = SECTION_PRESET_GROUPS
    .map((g) => ({ ...g, items: g.keys.map((k) => presets.find((p) => p.key === k)).filter((x): x is SectionPreset => Boolean(x)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
        <div className="text-xs font-semibold">Add a ready-made section</div>
        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
          Each section drops one or more blocks onto your page. You can edit anything after.
        </p>
      </div>

      {groups.map((g) => (
        <div key={g.label} className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <g.icon className="h-3.5 w-3.5 text-primary" />
            {g.label}
          </div>
          <div className="space-y-2">
            {g.items.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => onAddSection(p)}
                className={cn(
                  "w-full rounded-xl text-left group transition-all flex items-start gap-3",
                  "border border-border/40 bg-background/40 p-3 hover:border-primary/40 hover:bg-card/70",
                )}
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <p.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="text-sm font-medium leading-tight">{p.label}</div>
                    {p.audience.includes("advanced") && !p.audience.includes("standard") && (
                      <span className="text-[8px] px-1 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 uppercase tracking-wider">
                        Advanced
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{p.description}</div>
                  <div className="mt-1.5 text-[10px] text-muted-foreground/80">
                    {p.blocks.length} block{p.blocks.length === 1 ? "" : "s"}: {p.blocks.map((b) => metaByType.get(b.type)?.label ?? b.type).join(" · ")}
                  </div>
                </div>
                <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
