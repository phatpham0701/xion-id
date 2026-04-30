import { useMemo, useState } from "react";
import { Loader2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TEMPLATES, TEMPLATE_CATEGORIES, type ProfileTemplate,
} from "@/lib/templates";
import { themeStyleVars } from "@/lib/theme";

type Props = {
  profileId: string;
  /** When true, existing blocks are deleted before applying */
  replaceExisting?: boolean;
  onApplied?: () => void;
  /** Hide the action button (used when caller wraps it) */
  ctaLabel?: string;
};

const TemplateCard = ({
  tpl, active, onSelect,
}: { tpl: ProfileTemplate; active: boolean; onSelect: () => void }) => {
  const style = useMemo(() => themeStyleVars(tpl.theme), [tpl.theme]);
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative text-left rounded-2xl overflow-hidden border transition-all hover:scale-[1.015]",
        active ? "border-primary ring-2 ring-primary/40" : "border-border/40 hover:border-primary/40",
      )}
    >
      {/* Preview window */}
      <div
        className="aspect-[9/14] p-3 relative"
        style={{ ...style, background: "var(--theme-bg)", fontFamily: "var(--theme-font)" }}
      >
        <div className="text-center mt-2 mb-3">
          <div className="mx-auto h-10 w-10 rounded-full bg-white/15 backdrop-blur-md grid place-items-center text-white/90 text-sm font-semibold">
            {tpl.emoji}
          </div>
          <div className="text-[10px] text-white/70 mt-1.5">@yourhandle</div>
        </div>
        <div className="space-y-1.5 px-1">
          {tpl.blocks.slice(0, 5).map((b, i) => (
            <div
              key={i}
              className="h-6 bg-white/12 backdrop-blur-md border border-white/15"
              style={{ borderRadius: "var(--theme-radius)" }}
            />
          ))}
        </div>
        {active && (
          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-glow-primary">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </div>
        )}
      </div>
      {/* Meta */}
      <div className="p-3 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-base">{tpl.emoji}</span>
          <div className="text-sm font-semibold truncate">{tpl.name}</div>
        </div>
        <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
          {tpl.tagline}
        </div>
      </div>
    </button>
  );
};

export const TemplateGallery = ({
  profileId, replaceExisting = false, onApplied, ctaLabel = "Use this template",
}: Props) => {
  const [category, setCategory] = useState<typeof TEMPLATE_CATEGORIES[number]["id"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const filtered = category === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === category);

  const apply = async () => {
    const tpl = TEMPLATES.find((t) => t.id === selectedId);
    if (!tpl) return;
    setApplying(true);
    try {
      if (replaceExisting) {
        const { error: delErr } = await supabase.from("blocks").delete().eq("profile_id", profileId);
        if (delErr) throw delErr;
      }
      // Append after any existing blocks
      const { count } = await supabase
        .from("blocks").select("id", { count: "exact", head: true }).eq("profile_id", profileId);
      const startPos = count ?? 0;

      const rows = tpl.blocks.map((b, i) => ({
        profile_id: profileId,
        type: b.type,
        position: startPos + i,
        config: b.config as never,
        is_visible: b.is_visible ?? true,
      }));
      const { error: insErr } = await supabase.from("blocks").insert(rows);
      if (insErr) throw insErr;

      const { error: themeErr } = await supabase
        .from("profiles").update({ theme: tpl.theme as never }).eq("id", profileId);
      if (themeErr) throw themeErr;

      toast.success(`Applied “${tpl.name}”`, {
        description: replaceExisting ? "Your profile was reset." : "Blocks added to the bottom.",
      });
      onApplied?.();
    } catch (err) {
      toast.error("Couldn't apply template", {
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              category === c.id
                ? "bg-gradient-primary text-primary-foreground shadow-glow-primary"
                : "glass border border-glass-border text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            active={selectedId === tpl.id}
            onSelect={() => setSelectedId(tpl.id)}
          />
        ))}
      </div>

      {/* Apply bar */}
      {selectedId && (
        <div className="sticky bottom-4 z-30 glass-strong rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {TEMPLATES.find((t) => t.id === selectedId)?.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {replaceExisting
                  ? "Will replace your current blocks."
                  : "Will add blocks to your profile."}
              </div>
            </div>
          </div>
          <Button
            onClick={apply}
            disabled={applying}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium shrink-0"
          >
            {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
