import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  Sparkles, ArrowLeft, Eye, ExternalLink, Loader2, Save, Plus, LayoutTemplate,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockLibrary } from "@/components/editor/BlockLibrary";
import { SortableBlock } from "@/components/editor/SortableBlock";
import { Inspector } from "@/components/editor/Inspector";
import { ThemeStudio } from "@/components/editor/ThemeStudio";
import type { Block, BlockMeta } from "@/lib/blocks";
import { DEFAULT_THEME, themeFromJson, themeStyleVars, type ProfileTheme } from "@/lib/theme";
import {
  DEFAULT_PREFS, prefsFromJson, loadLocalPrefs, persistPrefs, recordBlockAdd,
  type BlockPrefs,
} from "@/lib/blockRanking";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
};

const Editor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ProfileTheme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, username, display_name, theme")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!p) { setLoading(false); return; }
      if (!p.username) { navigate("/dashboard"); return; }
      setProfile(p as Profile);
      setTheme(themeFromJson(p.theme));

      const { data: b } = await supabase
        .from("blocks")
        .select("*")
        .eq("profile_id", p.id)
        .order("position", { ascending: true });
      setBlocks((b || []) as Block[]);
      setLoading(false);
    })();
  }, [user, navigate]);

  const selected = useMemo(
    () => blocks.find((b) => b.id === selectedId) || null,
    [blocks, selectedId],
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    const next = arrayMove(blocks, oldIdx, newIdx).map((b, i) => ({ ...b, position: i }));
    setBlocks(next);
  };

  const addBlock = async (meta: BlockMeta) => {
    if (!profile) return;
    const position = blocks.length;
    const { data, error } = await supabase
      .from("blocks")
      .insert([{
        profile_id: profile.id,
        type: meta.type,
        position,
        config: meta.defaultConfig as never,
        is_visible: true,
      }])
      .select()
      .single();
    if (error) return toast.error("Couldn't add block", { description: error.message });
    const newBlock = data as Block;
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const deleteBlock = async (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId(null);
    const { error } = await supabase.from("blocks").delete().eq("id", id);
    if (error) toast.error("Couldn't delete", { description: error.message });
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const blockUpdates = blocks.map((b) =>
        supabase
          .from("blocks")
          .update({ position: b.position, config: b.config as never, is_visible: b.is_visible })
          .eq("id", b.id),
      );
      const themeUpdate = supabase
        .from("profiles")
        .update({ theme: theme as never })
        .eq("id", profile.id);
      const results = await Promise.all([...blockUpdates, themeUpdate]);
      const firstErr = results.find((r) => r.error);
      if (firstErr?.error) throw firstErr.error;
      toast.success("Saved");
    } catch (err) {
      toast.error("Couldn't save", { description: err instanceof Error ? err.message : "Try again" });
    } finally {
      setSaving(false);
    }
  };

  const styleVars = useMemo(() => themeStyleVars(theme), [theme]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="px-4 md:px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard</Link>
            </Button>
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-mono text-muted-foreground truncate">
                xionid.app/{profile.username}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/templates"><LayoutTemplate className="h-4 w-4 mr-1.5" />Templates</Link>
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
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" />Save</>}
            </Button>
          </div>
        </div>
      </header>

      {/* Studio: 3 columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-0 overflow-hidden">
        {/* Left — Library */}
        <aside className="border-r border-border/40 overflow-y-auto p-4 hidden lg:block">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Add blocks</div>
          <BlockLibrary onAdd={addBlock} />
        </aside>

        {/* Center — Canvas */}
        <main className="overflow-y-auto py-8 px-4 relative">
          <div className="aurora-orb h-[400px] w-[400px] -top-20 left-1/4 bg-secondary opacity-20 animate-aurora-drift pointer-events-none" />
          <div className="aurora-orb h-[400px] w-[400px] bottom-0 right-1/4 bg-primary opacity-20 animate-aurora-drift pointer-events-none" style={{ animationDelay: "-7s" }} />

          {/* Mobile frame */}
          <div className="mx-auto w-full max-w-[380px] relative">
            <div
              className="rounded-[2.5rem] p-4 min-h-[640px] shadow-elevated overflow-hidden"
              style={{ ...styleVars, background: "var(--theme-bg)", fontFamily: "var(--theme-font)" }}
            >
              <div className="text-center mb-4">
                <div className="text-xs text-muted-foreground">@{profile.username}</div>
              </div>

              {blocks.length === 0 ? (
                <div className="grid place-items-center h-[480px] text-center px-6">
                  <div>
                    <div className="mx-auto h-14 w-14 rounded-2xl glass grid place-items-center mb-4">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-display font-semibold mb-1">Start building</div>
                    <p className="text-sm text-muted-foreground">
                      Add blocks from the library to bring your profile to life.
                    </p>
                  </div>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 px-2">
                      {blocks.map((b) => (
                        <SortableBlock
                          key={b.id}
                          block={b}
                          theme={theme}
                          selected={selectedId === b.id}
                          onSelect={() => setSelectedId(b.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Mobile-only: blocks button */}
          <div className="lg:hidden mt-6 max-w-[380px] mx-auto">
            <details className="glass rounded-2xl p-4">
              <summary className="cursor-pointer text-sm font-medium">+ Add blocks</summary>
              <div className="mt-4"><BlockLibrary onAdd={addBlock} /></div>
            </details>
          </div>
        </main>

        {/* Right — Inspector */}
        <aside className="border-l border-border/40 overflow-y-auto p-5 hidden lg:block">
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
                  Select a block to edit its content.
                </div>
              )}
            </TabsContent>
            <TabsContent value="theme">
              <ThemeStudio
                theme={theme}
                onChange={(patch) => setTheme((t) => ({ ...t, ...patch }))}
              />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
