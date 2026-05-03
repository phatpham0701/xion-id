import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TEMPLATES, TEMPLATE_CATEGORIES, FEATURED_TEMPLATES, FEATURED_TEMPLATE_IDS, type ProfileTemplate,
} from "@/lib/templates";
import { TemplatePreview } from "./TemplatePreview";

type Props = {
  profileId: string;
  replaceExisting?: boolean;
  onApplied?: () => void;
  ctaLabel?: string;
};

const MODULE_LABELS: Record<string, string> = {
  link: "Links", social: "Socials", nft: "Collectibles", wallet: "Identity",
  music_embed: "Music", video_embed: "Video", image: "Media",
  tip_jar: "Support", calendar: "Booking", contact_form: "Contact",
  token_balance: "Balance", avatar: "Header", text: "Bio", heading: "Sections",
};

const blockSummary = (tpl: ProfileTemplate): string[] => {
  const set = new Set<string>();
  tpl.blocks.forEach((b) => {
    const l = MODULE_LABELS[b.type];
    if (l) set.add(l);
  });
  return Array.from(set).slice(0, 4);
};

const PERSONAS: Record<string, { persona: string; outcome: string; name?: string }> =
  Object.fromEntries(FEATURED_TEMPLATES.map((t) => [t.id, { persona: t.persona, outcome: t.outcome, name: t.name }]));

const TemplateCard = ({
  tpl, active, onSelect,
}: { tpl: ProfileTemplate; active: boolean; onSelect: () => void }) => {
  const modules = useMemo(() => blockSummary(tpl), [tpl]);
  const meta = PERSONAS[tpl.id];
  return (
    <div
      className={cn(
        "group relative rounded-3xl overflow-hidden border bg-background/40 transition-all hover:-translate-y-0.5",
        active ? "border-primary ring-2 ring-primary/40 shadow-glow-primary" : "border-glass-border hover:border-primary/40",
      )}
    >
      <button onClick={onSelect} className="block w-full text-left">
        <div className="relative">
          <TemplatePreview template={tpl} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-brand opacity-90" />
          {active && (
            <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-glow-primary z-10">
              <Check className="h-4 w-4" strokeWidth={3} />
            </div>
          )}
        </div>
      </button>
      <div className="p-4 bg-card/60 backdrop-blur-md space-y-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{tpl.emoji}</span>
            <button onClick={onSelect} className="text-sm font-display font-semibold truncate text-left hover:text-primary transition-colors">
              {tpl.name}
            </button>
          </div>
          {meta && <div className="text-[10px] uppercase tracking-[0.18em] text-accent mt-1">{meta.persona}</div>}
        </div>
        <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2">
          {meta?.outcome ?? tpl.tagline}
        </p>
        <div className="flex flex-wrap gap-1">
          {modules.map((m) => (
            <span key={m} className="text-[10px] rounded-full border border-glass-border bg-background/40 px-1.5 py-0.5 text-muted-foreground">
              {m}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <button onClick={onSelect} className="text-xs font-medium text-primary hover:underline">
            {active ? "Selected" : "Use this template"}
          </button>
          <Link
            to={`/preview/template/${tpl.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            Live demo <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    </div>
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

      {/* Recommended for you */}
      {category === "all" && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Recommended for you</h2>
            <span className="text-[11px] text-muted-foreground">Based on your starter</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.filter((t) => ["essential-rewards", "creator-hub", "badge-first"].includes(t.id)).map((tpl) => (
              <TemplateCard
                key={`rec-${tpl.id}`}
                tpl={tpl}
                active={selectedId === tpl.id}
                onSelect={() => setSelectedId(tpl.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">All templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              active={selectedId === tpl.id}
              onSelect={() => setSelectedId(tpl.id)}
            />
          ))}
        </div>
      </div>

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
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" className="glass border-glass-border" asChild>
              <Link to={`/preview/template/${selectedId}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Live demo
              </Link>
            </Button>
            <Button
              onClick={apply}
              disabled={applying}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium"
            >
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : ctaLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
