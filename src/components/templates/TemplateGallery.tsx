import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TEMPLATES, TEMPLATE_CATEGORIES, type ProfileTemplate,
} from "@/lib/templates";
import { TemplatePreview } from "./TemplatePreview";

type Props = {
  profileId: string;
  replaceExisting?: boolean;
  onApplied?: () => void;
  ctaLabel?: string;
};

const blockSummary = (tpl: ProfileTemplate): string => {
  const counts = new Map<string, number>();
  tpl.blocks.forEach((b) => counts.set(b.type, (counts.get(b.type) ?? 0) + 1));
  const labels: Record<string, string> = {
    link: "link", social: "socials", nft: "NFT", wallet: "wallet",
    music_embed: "music", video_embed: "video", image: "image",
    tip_jar: "tip jar", calendar: "booking", contact_form: "form",
    token_balance: "balance", avatar: "header", text: "bio", heading: "heading",
  };
  const order = ["link", "social", "image", "video_embed", "music_embed", "nft", "wallet", "token_balance", "tip_jar", "calendar", "contact_form"];
  const parts: string[] = [];
  order.forEach((k) => {
    const n = counts.get(k);
    if (n) parts.push(`${n} ${labels[k] ?? k}${n > 1 && k === "link" ? "s" : ""}`);
  });
  return parts.slice(0, 3).join(" · ");
};

const TemplateCard = ({
  tpl, active, onSelect,
}: { tpl: ProfileTemplate; active: boolean; onSelect: () => void }) => {
  const summary = useMemo(() => blockSummary(tpl), [tpl]);
  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden border transition-all hover:scale-[1.015]",
        active ? "border-primary ring-2 ring-primary/40" : "border-border/40 hover:border-primary/40",
      )}
    >
      <button onClick={onSelect} className="block w-full text-left">
        <TemplatePreview template={tpl} />
        {active && (
          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-glow-primary z-10">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </div>
        )}
      </button>
      <div className="p-3 bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-base">{tpl.emoji}</span>
          <button onClick={onSelect} className="text-sm font-semibold truncate text-left hover:text-primary transition-colors">
            {tpl.name}
          </button>
        </div>
        <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug mb-2">
          {tpl.tagline}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground/80 truncate">{summary}</span>
          <Link
            to={`/preview/template/${tpl.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5 shrink-0"
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
