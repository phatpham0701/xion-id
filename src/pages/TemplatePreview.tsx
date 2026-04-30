import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/editor/BlockRenderer";
import { themeStyleVars, BACKGROUNDS, FONTS } from "@/lib/theme";
import { getTemplate } from "@/lib/templates";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Block } from "@/lib/blocks";

const TemplatePreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tpl = id ? getTemplate(id) : undefined;
  const [applying, setApplying] = useState(false);

  const style = useMemo(() => (tpl ? themeStyleVars(tpl.theme) : {}), [tpl]);

  useEffect(() => {
    if (tpl) document.title = `${tpl.name} template · XionID`;
  }, [tpl]);

  if (!tpl) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-3">Template not found.</p>
          <Button asChild><Link to="/templates">Browse templates</Link></Button>
        </div>
      </div>
    );
  }

  const blocks: Block[] = tpl.blocks.map((b, i) => ({
    id: `tpl-${i}`,
    profile_id: "tpl",
    type: b.type,
    position: i,
    config: b.config,
    is_visible: true,
  }));

  const useThis = async () => {
    if (!user) { navigate("/auth"); return; }
    setApplying(true);
    try {
      const { data: p } = await supabase
        .from("profiles").select("id, username").eq("user_id", user.id).maybeSingle();
      if (!p?.username) { navigate("/dashboard"); return; }

      const { count } = await supabase
        .from("blocks").select("id", { count: "exact", head: true }).eq("profile_id", p.id);
      const startPos = count ?? 0;
      const rows = tpl.blocks.map((b, i) => ({
        profile_id: p.id,
        type: b.type,
        position: startPos + i,
        config: b.config as never,
        is_visible: b.is_visible ?? true,
      }));
      const { error: insErr } = await supabase.from("blocks").insert(rows);
      if (insErr) throw insErr;
      const { error: thErr } = await supabase
        .from("profiles").update({ theme: tpl.theme as never }).eq("id", p.id);
      if (thErr) throw thErr;
      toast.success(`Applied “${tpl.name}”`);
      navigate("/editor");
    } catch (err) {
      toast.error("Couldn't apply", { description: err instanceof Error ? err.message : "Try again" });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ ...style, background: BACKGROUNDS[tpl.theme.background].css, fontFamily: FONTS[tpl.theme.font].family }}>
      {/* Floating top bar */}
      <header className="fixed top-3 inset-x-3 z-50 glass-strong rounded-2xl px-3 py-2 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/templates"><ArrowLeft className="h-4 w-4 mr-1.5" />Templates</Link>
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{tpl.emoji}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{tpl.name}</div>
            <div className="text-[10px] text-muted-foreground truncate hidden sm:block">{tpl.tagline}</div>
          </div>
        </div>
        <Button
          onClick={useThis}
          disabled={applying}
          size="sm"
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium shrink-0"
        >
          {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Use this</>}
        </Button>
      </header>

      <main className="pt-20 pb-16">
        <div className="max-w-md mx-auto px-5 space-y-3 text-foreground">
          {blocks.map((b) => (
            <BlockRenderer key={b.id} block={b} theme={tpl.theme} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default TemplatePreviewPage;
