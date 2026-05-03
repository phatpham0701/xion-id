import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Link, useNavigate } from "react-router-dom";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowLeft,
  Eye,
  ExternalLink,
  Loader2,
  Save,
  Plus,
  LayoutTemplate,
  Wand2,
  Smartphone,
  ShieldCheck,
  Share2,
  Globe,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockLibrary } from "@/components/editor/BlockLibrary";
import { SortableBlock } from "@/components/editor/SortableBlock";
import { Inspector } from "@/components/editor/Inspector";
import { ThemeStudio } from "@/components/editor/ThemeStudio";
import { SectionsPanel } from "@/components/editor/SectionsPanel";
import { AssetsPanel } from "@/components/editor/AssetsPanel";
import { TemplatesPanel } from "@/components/editor/TemplatesPanel";
import type { Block, BlockMeta } from "@/lib/blocks";
import type { SectionPreset } from "@/lib/sectionPresets";
import { useStudioMode } from "@/lib/studioMode";
import { DEFAULT_THEME, themeFromJson, themeStyleVars, type ProfileTheme } from "@/lib/theme";
import {
  DEFAULT_PREFS,
  prefsFromJson,
  loadLocalPrefs,
  persistPrefs,
  recordBlockAdd,
  type BlockPrefs,
} from "@/lib/blockRanking";
import { validateBlockConfig, summarizeIssues } from "@/lib/blockValidation";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  is_published: boolean;
};

const STARTER_SUGGESTIONS = ["Profile Hero", "Support Module", "Badge Wall", "Reward Preview"];

const Editor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ProfileTheme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<BlockPrefs>(DEFAULT_PREFS);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, username, display_name, theme, settings, is_published")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!p) {
        setLoading(false);
        return;
      }

      if (!p.username) {
        navigate("/dashboard");
        return;
      }

      setProfile(p as Profile);
      setTheme(themeFromJson(p.theme));

      const local = loadLocalPrefs(p.id);
      if (local) setPrefs(local);

      const dbPrefs = prefsFromJson(p.settings);
      setPrefs(dbPrefs);

      const { data: b } = await supabase
        .from("blocks")
        .select("*")
        .eq("profile_id", p.id)
        .order("position", { ascending: true });

      setBlocks((b || []) as Block[]);
      setLoading(false);
    })();
  }, [user, navigate]);

  const updatePrefs = (patch: Partial<BlockPrefs>) => {
    setPrefs((cur) => {
      const next = { ...cur, ...patch };
      if (profile) void persistPrefs(profile.id, next);
      return next;
    });
  };

  const selected = useMemo(() => blocks.find((b) => b.id === selectedId) || null, [blocks, selectedId]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);

    const next = arrayMove(blocks, oldIdx, newIdx).map((b, i) => ({
      ...b,
      position: i,
    }));

    setBlocks(next);
  };

  const addBlock = async (meta: BlockMeta) => {
    if (!profile) return;

    const position = blocks.length;
    const { data, error } = await supabase
      .from("blocks")
      .insert([
        {
          profile_id: profile.id,
          type: meta.type,
          position,
          config: meta.defaultConfig as never,
          is_visible: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return toast.error("Couldn't add block", { description: error.message });
    }

    const newBlock = data as Block;
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);
    updatePrefs(recordBlockAdd(prefs, meta.type));

    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-block-id="${newBlock.id}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-flash");
      window.setTimeout(() => el.classList.remove("ring-flash"), 1600);
    });

    const issues = validateBlockConfig(meta.type, meta.defaultConfig);
    const { errors } = summarizeIssues(issues);
    const description =
      errors > 0
        ? `Needs setup: ${issues.find((i) => i.severity === "error")?.message}`
        : "Tap the block to edit, or undo to remove.";

    toast.success(`${meta.label} added`, {
      description,
      action: {
        label: "Undo",
        onClick: () => {
          void deleteBlock(newBlock.id);
        },
      },
    });
  };

  const addBlocks = async (metas: BlockMeta[], label = "Starter kit") => {
    if (!profile || metas.length === 0) return;

    const startPosition = blocks.length;

    const rows = metas.map((meta, index) => ({
      profile_id: profile.id,
      type: meta.type,
      position: startPosition + index,
      config: meta.defaultConfig as never,
      is_visible: true,
    }));

    const { data, error } = await supabase.from("blocks").insert(rows).select();

    if (error) {
      toast.error("Couldn't add kit", { description: error.message });
      return;
    }

    const newBlocks = (data || []) as Block[];

    const orderedNewBlocks = [...newBlocks].sort((a, b) => a.position - b.position);

    setBlocks((prev) => {
      const next = [...prev, ...orderedNewBlocks].map((block, index) => ({
        ...block,
        position: index,
      }));
      return next;
    });

    const firstNewBlock = orderedNewBlocks[0];
    if (firstNewBlock) {
      setSelectedId(firstNewBlock.id);

      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(`[data-block-id="${firstNewBlock.id}"]`);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-flash");
        window.setTimeout(() => el.classList.remove("ring-flash"), 1600);
      });
    }

    const nextPrefs = metas.reduce((current, meta) => recordBlockAdd(current, meta.type), prefs);
    updatePrefs(nextPrefs);

    toast.success(`${label} added`, {
      description: `${metas.length} blocks were added to your profile. Remember to save after adjusting the order.`,
    });
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const duplicateBlock = async (id: string) => {
    if (!profile) return;

    const source = blocks.find((b) => b.id === id);
    if (!source) return;

    const sourceIndex = blocks.findIndex((b) => b.id === id);
    const insertPosition = sourceIndex + 1;

    const normalizedBlocks = blocks.map((b, index) => ({
      ...b,
      position: index >= insertPosition ? index + 1 : index,
    }));

    const { data, error } = await supabase
      .from("blocks")
      .insert([
        {
          profile_id: profile.id,
          type: source.type,
          position: insertPosition,
          config: source.config as never,
          is_visible: source.is_visible,
        },
      ])
      .select()
      .single();

    if (error) {
      toast.error("Couldn't duplicate block", { description: error.message });
      return;
    }

    const duplicate = data as Block;
    const next = [
      ...normalizedBlocks.slice(0, insertPosition),
      duplicate,
      ...normalizedBlocks.slice(insertPosition),
    ].map((b, index) => ({ ...b, position: index }));

    setBlocks(next);
    setSelectedId(duplicate.id);

    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-block-id="${duplicate.id}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-flash");
      window.setTimeout(() => el.classList.remove("ring-flash"), 1600);
    });

    toast.success("Block duplicated", {
      description: "Remember to save your profile to keep the new order.",
    });
  };

  const toggleBlockVisibility = (id: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, is_visible: !b.is_visible } : b)));
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const currentIndex = blocks.findIndex((b) => b.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const next = arrayMove(blocks, currentIndex, targetIndex).map((b, index) => ({
      ...b,
      position: index,
    }));

    setBlocks(next);
  };

  const deleteBlock = async (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId((current) => (current === id ? null : current));

    const { error } = await supabase.from("blocks").delete().eq("id", id);
    if (error) toast.error("Couldn't delete", { description: error.message });
  };

  const deleteBlockWithConfirm = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    toast("Delete this block?", {
      description: "This will remove the block from your profile.",
      action: {
        label: "Delete",
        onClick: () => {
          void deleteBlock(id);
        },
      },
    });
  };

  const save = async () => {
    if (!profile) return;

    setSaving(true);

    try {
      const blockUpdates = blocks.map((b) =>
        supabase
          .from("blocks")
          .update({
            position: b.position,
            config: b.config as never,
            is_visible: b.is_visible,
          })
          .eq("id", b.id),
      );

      const themeUpdate = supabase
        .from("profiles")
        .update({ theme: theme as never })
        .eq("id", profile.id);

      const results = await Promise.all([...blockUpdates, themeUpdate]);
      const firstErr = results.find((r) => r.error);

      if (firstErr?.error) throw firstErr.error;

      toast.success("Profile saved");
    } catch (err) {
      toast.error("Couldn't save", {
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSaving(false);
    }
  };

  const styleVars = useMemo(() => themeStyleVars(theme), [theme]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="glass rounded-2xl px-5 py-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading Profile Studio...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 glass sticky top-0 z-40 backdrop-blur-xl">
        <div className="px-4 md:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Dashboard
              </Link>
            </Button>

            <div className="hidden md:flex items-center gap-3 min-w-0 border-l border-border/50 pl-4">
              <BrandLogo size={36} className="shrink-0" />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold leading-none">XIONID Profile Studio</span>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Live editor
                  </span>
                </div>
                <div className="mt-1 text-xs font-mono text-muted-foreground truncate">
                  xionid.com/{profile.username}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/templates">
                <LayoutTemplate className="h-4 w-4 mr-1.5" />
                Templates
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <a href={`/${profile.username}`} target="_blank" rel="noreferrer">
                <Eye className="h-4 w-4 mr-1.5" />
                Preview
                <ExternalLink className="h-3 w-3 ml-1.5 opacity-60" />
              </a>
            </Button>

            <Button
              size="sm"
              onClick={save}
              disabled={saving}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium shadow-glow"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] gap-0 overflow-hidden">
        <aside className="border-r border-border/40 overflow-y-auto hidden lg:block bg-background/60">
          <div className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Wand2 className="h-4 w-4 text-primary" />
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Blocks & Sections</div>
            </div>
            <h2 className="font-display text-base font-semibold">Build your page</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Add links, creator support tools, media, and XION identity blocks.
            </p>
          </div>

          <div className="p-4">
            <BlockLibrary onAdd={addBlock} onAddMany={addBlocks} prefs={prefs} onPrefsChange={updatePrefs} />
          </div>
        </aside>

        <main className="overflow-y-auto py-8 px-4 relative">
          <div className="aurora-orb h-[420px] w-[420px] -top-24 left-1/4 bg-secondary opacity-20 animate-aurora-drift pointer-events-none" />
          <div
            className="aurora-orb h-[420px] w-[420px] bottom-0 right-1/4 bg-primary opacity-20 animate-aurora-drift pointer-events-none"
            style={{ animationDelay: "-7s" }}
          />

          <div className="mx-auto w-full max-w-[430px] relative">
            <div className="mb-4 flex items-center justify-between px-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Live mobile preview
                </div>
                <p className="text-xs text-muted-foreground">Drag blocks to reorder. Select a block to customize.</p>
              </div>

              <div className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                {blocks.length} block{blocks.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="rounded-[3rem] border border-white/10 bg-zinc-950/80 p-2 shadow-2xl shadow-primary/10">
              <div className="rounded-[2.65rem] border border-white/10 bg-black p-2">
                <div
                  className="relative min-h-[680px] overflow-hidden rounded-[2.25rem] p-4"
                  style={{
                    ...styleVars,
                    background: "var(--theme-bg)",
                    fontFamily: "var(--theme-font)",
                  }}
                >
                  <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 bg-background/10 px-4 pt-3 backdrop-blur-sm">
                    <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-white/20" />
                    <div className="flex items-center justify-center gap-2 pb-3">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      <div className="text-xs font-mono text-muted-foreground">@{profile.username}</div>
                    </div>
                  </div>

                  {blocks.length === 0 ? (
                    <div className="grid place-items-center h-[520px] text-center px-6">
                      <div>
                        <div className="mx-auto h-16 w-16 rounded-3xl glass grid place-items-center mb-5 shadow-glow">
                          <Plus className="h-6 w-6 text-primary" />
                        </div>

                        <div className="font-display text-lg font-semibold mb-2">Start with your identity</div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Add a creator hero, links, tip jar, or XION badge blocks to build your public profile.
                        </p>

                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                          {STARTER_SUGGESTIONS.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-border/50 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground"
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        <p className="mt-5 text-[11px] text-muted-foreground/80">
                          Use the left panel to add your first block.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3 px-1 pb-8">
                          {blocks.map((b, index) => (
                            <SortableBlock
                              key={b.id}
                              block={b}
                              theme={theme}
                              selected={selectedId === b.id}
                              onSelect={() => setSelectedId(b.id)}
                              onDuplicate={() => void duplicateBlock(b.id)}
                              onDelete={() => deleteBlockWithConfirm(b.id)}
                              onToggleVisibility={() => toggleBlockVisibility(b.id)}
                              onMoveUp={() => moveBlock(b.id, "up")}
                              onMoveDown={() => moveBlock(b.id, "down")}
                              canMoveUp={index > 0}
                              canMoveDown={index < blocks.length - 1}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden mt-6 max-w-[430px] mx-auto">
            <details className="glass rounded-2xl p-4">
              <summary className="cursor-pointer text-sm font-medium">+ Add blocks</summary>
              <div className="mt-4">
                <BlockLibrary onAdd={addBlock} onAddMany={addBlocks} prefs={prefs} onPrefsChange={updatePrefs} />
              </div>
            </details>
          </div>
        </main>

        <aside className="border-l border-border/40 overflow-y-auto hidden lg:block bg-background/60">
          <div className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Customize</div>
            </div>
            <h2 className="font-display text-base font-semibold">
              {selected ? "Edit selected block" : "No block selected"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Select a block to edit content, visibility, and design.
            </p>
          </div>

          <div className="p-5">
            <Tabs defaultValue="block">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="block">Block</TabsTrigger>
                <TabsTrigger value="theme">Theme</TabsTrigger>
              </TabsList>

              <TabsContent value="block">
                {selected ? (
                  <Inspector
                    block={selected}
                    onChange={(patch) => updateBlock(selected.id, patch)}
                    onDelete={() => deleteBlock(selected.id)}
                  />
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl glass">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    Select a block on the mobile preview to customize it.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="theme">
                <ThemeStudio theme={theme} onChange={(patch) => setTheme((t) => ({ ...t, ...patch }))} />
              </TabsContent>
            </Tabs>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
