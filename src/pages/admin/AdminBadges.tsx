import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin";
import { toast } from "@/hooks/use-toast";
import { BADGE_TIERS, SPORT_BADGES, SPORT_INTERESTS, type BadgeTier, type SportBadgeDefinition, type SportInterest } from "@/lib/sportLifestyle";
import { Award, Copy, Database, Edit3, Plus, Search, Sparkles, Trash2 } from "lucide-react";

type BadgeRow = {
  id: string;
  profile_id: string;
  xion_address: string;
  kind: string;
  tier: number;
  verified_at: string;
  metadata: any;
};
type ProfileLite = { id: string; username: string | null; display_name: string | null };

type CatalogBadge = SportBadgeDefinition & {
  source: "built-in" | "custom";
};

type CatalogDraft = {
  id?: string;
  name: string;
  interest: SportInterest;
  tierIntent: BadgeTier;
  proofHint: string;
  description: string;
};

const KINDS = [
  "og_2024",
  "og_2025",
  "nft_collector",
  "nft_minter",
  "tipper",
  "dapp_explorer",
  "campaign_participant",
  "contest_winner",
  "whale",
  "early_adopter",
];

const STORAGE_KEY = "xionid:admin-badge-catalog:v1";
const tierNumber: Record<BadgeTier, number> = { Bronze: 1, Silver: 2, Gold: 3, Diamond: 4, Elite: 5 };
const numberTier = (value: number): BadgeTier => (value >= 5 ? "Elite" : value >= 4 ? "Diamond" : value >= 3 ? "Gold" : value >= 2 ? "Silver" : "Bronze");
const safeSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "custom-badge";
const defaultDraft = (): CatalogDraft => ({
  name: "Custom Lifestyle Badge",
  interest: "Running",
  tierIntent: "Bronze",
  proofHint: "Describe the proof an admin expects to review",
  description: "Explain why this badge matters for the user lifestyle signal.",
});

const loadCustomCatalog = (): CatalogBadge[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item?.id && item?.name && SPORT_INTERESTS.includes(item?.interest) && BADGE_TIERS.includes(item?.tierIntent))
      .map((item) => ({
        id: String(item.id),
        name: String(item.name),
        interest: item.interest,
        tierIntent: item.tierIntent,
        proofHint: String(item.proofHint || "Demo proof requirement"),
        description: String(item.description || "Custom demo badge."),
        source: "custom" as const,
      }));
  } catch {
    return [];
  }
};

const saveCustomCatalog = (badges: CatalogBadge[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(badges.filter((badge) => badge.source === "custom")));
};

const AdminBadges = () => {
  const [rows, setRows] = useState<BadgeRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [allProfiles, setAllProfiles] = useState<ProfileLite[]>([]);
  const [q, setQ] = useState("");
  const [catalogQ, setCatalogQ] = useState("");
  const [profileFilter, setProfileFilter] = useState<string>("all");
  const [catalogInterest, setCatalogInterest] = useState<string>("all");
  const [catalogTier, setCatalogTier] = useState<string>("all");
  const [selectedIssueProfile, setSelectedIssueProfile] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [customCatalog, setCustomCatalog] = useState<CatalogBadge[]>(() => loadCustomCatalog());
  const [catalogDraft, setCatalogDraft] = useState<CatalogDraft>(() => defaultDraft());
  const [draft, setDraft] = useState({ profile_id: "", kind: "og_2024", tier: 1, xion_address: "" });

  const builtInCatalog: CatalogBadge[] = useMemo(() => SPORT_BADGES.map((badge) => ({ ...badge, source: "built-in" as const })), []);
  const catalog = useMemo(() => [...builtInCatalog, ...customCatalog], [builtInCatalog, customCatalog]);

  const load = async () => {
    const { data } = await supabase
      .from("wallet_badges")
      .select("id, profile_id, xion_address, kind, tier, verified_at, metadata")
      .order("verified_at", { ascending: false })
      .limit(500);
    setRows((data as BadgeRow[]) ?? []);
    const ids = Array.from(new Set((data ?? []).map((b: any) => b.profile_id)));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, username, display_name").in("id", ids);
      const map: Record<string, ProfileLite> = {};
      (ps as ProfileLite[] | null)?.forEach((p) => (map[p.id] = p));
      setProfiles(map);
    } else {
      setProfiles({});
    }

    const { data: recentProfiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .order("updated_at", { ascending: false })
      .limit(200);
    const recent = (recentProfiles as ProfileLite[] | null) ?? [];
    setAllProfiles(recent);
    if (!selectedIssueProfile && recent[0]?.id) setSelectedIssueProfile(recent[0].id);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const byProfile = profileFilter === "all" ? rows : rows.filter((r) => r.profile_id === profileFilter);
    if (!s) return byProfile;
    return byProfile.filter((r) => {
      const metaName = String(r.metadata?.catalog_badge?.name ?? "").toLowerCase();
      return r.kind.includes(s) || metaName.includes(s) || (profiles[r.profile_id]?.username ?? "").toLowerCase().includes(s);
    });
  }, [rows, q, profiles, profileFilter]);

  const filteredCatalog = useMemo(() => {
    const s = catalogQ.trim().toLowerCase();
    return catalog.filter((badge) => {
      const matchesText = !s || [badge.name, badge.description, badge.proofHint, badge.interest, badge.tierIntent].some((value) => value.toLowerCase().includes(s));
      const matchesInterest = catalogInterest === "all" || badge.interest === catalogInterest;
      const matchesTier = catalogTier === "all" || badge.tierIntent === catalogTier;
      return matchesText && matchesInterest && matchesTier;
    });
  }, [catalog, catalogInterest, catalogQ, catalogTier]);

  const openCreateCatalog = () => {
    setEditingCustomId(null);
    setCatalogDraft(defaultDraft());
    setCatalogOpen(true);
  };

  const openEditCatalog = (badge: CatalogBadge) => {
    setEditingCustomId(badge.source === "custom" ? badge.id : null);
    setCatalogDraft({
      id: badge.source === "custom" ? badge.id : undefined,
      name: badge.source === "built-in" ? `${badge.name} Copy` : badge.name,
      interest: badge.interest,
      tierIntent: badge.tierIntent,
      proofHint: badge.proofHint,
      description: badge.description,
    });
    setCatalogOpen(true);
  };

  const saveCatalogBadge = () => {
    if (!catalogDraft.name.trim()) {
      toast({ title: "Badge name required", variant: "destructive" });
      return;
    }
    const nextBadge: CatalogBadge = {
      id: editingCustomId ?? `custom-${safeSlug(catalogDraft.name)}-${Date.now()}`,
      name: catalogDraft.name.trim(),
      interest: catalogDraft.interest,
      tierIntent: catalogDraft.tierIntent,
      proofHint: catalogDraft.proofHint.trim() || "Demo proof requirement",
      description: catalogDraft.description.trim() || "Custom demo badge.",
      source: "custom",
    };
    const next = editingCustomId
      ? customCatalog.map((badge) => (badge.id === editingCustomId ? nextBadge : badge))
      : [nextBadge, ...customCatalog];
    setCustomCatalog(next);
    saveCustomCatalog(next);
    toast({ title: editingCustomId ? "Custom badge updated" : "Custom demo badge created" });
    setCatalogOpen(false);
  };

  const deleteCustomBadge = (badgeId: string) => {
    const next = customCatalog.filter((badge) => badge.id !== badgeId);
    setCustomCatalog(next);
    saveCustomCatalog(next);
    toast({ title: "Custom badge removed" });
  };

  const issuePayload = (badge: CatalogBadge, profileId: string) => {
    const ownerProfile = allProfiles.find((p) => p.id === profileId);
    return {
      profile_id: profileId,
      kind: "early_adopter" as never,
      tier: tierNumber[badge.tierIntent],
      xion_address: ownerProfile?.username || "demo",
      metadata: {
        issued_by: "admin",
        source: "admin_badge_catalog",
        catalog_badge: {
          id: badge.id,
          name: badge.name,
          interest: badge.interest,
          tierIntent: badge.tierIntent,
          proofHint: badge.proofHint,
          description: badge.description,
          source: badge.source,
        },
      } as never,
    };
  };

  const issueCatalogBadge = async (badge: CatalogBadge) => {
    if (!selectedIssueProfile) {
      toast({ title: "Select a profile first", variant: "destructive" });
      return;
    }
    const payload = issuePayload(badge, selectedIssueProfile);
    const { data, error } = await supabase.from("wallet_badges").insert(payload).select("id").maybeSingle();
    if (error) {
      toast({ title: "Failed to issue badge", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction({ action: "badge.issue", targetType: "badge", targetId: data?.id, details: payload as never });
    toast({ title: "Catalog badge issued", description: `${badge.name} was issued to the selected profile.` });
    load();
  };

  const issue = async () => {
    if (!draft.profile_id) {
      toast({ title: "Profile id required", variant: "destructive" });
      return;
    }
    const ownerProfile = allProfiles.find((p) => p.id === draft.profile_id);
    const { data, error } = await supabase
      .from("wallet_badges")
      .insert({
        profile_id: draft.profile_id,
        kind: draft.kind as never,
        tier: draft.tier,
        xion_address: draft.xion_address || ownerProfile?.username || "demo",
        metadata: { issued_by: "admin" } as never,
      })
      .select("id")
      .maybeSingle();
    if (error) {
      console.warn("[admin/badges] issue failed:", error.message);
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction({ action: "badge.issue", targetType: "badge", targetId: data?.id, details: draft as never });
    toast({ title: "Badge issued" });
    setOpen(false);
    load();
  };

  const remove = async (r: BadgeRow) => {
    const { error } = await supabase.from("wallet_badges").delete().eq("id", r.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction({ action: "badge.remove", targetType: "badge", targetId: r.id, details: { kind: r.kind, catalog_badge: r.metadata?.catalog_badge } });
    load();
  };

  return (
    <AdminLayout title="Badges" description="Manage the Sport Lifestyle badge catalog and issued profile badges.">
      <Tabs defaultValue="catalog" className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="catalog">Badge Catalog</TabsTrigger>
            <TabsTrigger value="issued">Issued Badges</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{catalog.length} catalog badges</Badge>
            <Badge variant="secondary">{builtInCatalog.length} built-in</Badge>
            <Badge variant="outline">{customCatalog.length} custom demo</Badge>
            <Badge variant="outline">{rows.length} issued</Badge>
          </div>
        </div>

        <TabsContent value="catalog" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold">Sport Lifestyle Badge Catalog</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse the 50 built-in sport badges, create demo custom badges, then issue any selected badge to a profile.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-[220px_160px_160px_220px_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={catalogQ} onChange={(e) => setCatalogQ(e.target.value)} placeholder="Search catalog" className="pl-9" />
                </div>
                <Select value={catalogInterest} onValueChange={setCatalogInterest}>
                  <SelectTrigger><SelectValue placeholder="Sport" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sports</SelectItem>
                    {SPORT_INTERESTS.map((interest) => <SelectItem key={interest} value={interest}>{interest}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={catalogTier} onValueChange={setCatalogTier}>
                  <SelectTrigger><SelectValue placeholder="Tier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tiers</SelectItem>
                    {BADGE_TIERS.map((tier) => <SelectItem key={tier} value={tier}>{tier}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedIssueProfile || "none"} onValueChange={(value) => setSelectedIssueProfile(value === "none" ? "" : value)}>
                  <SelectTrigger><SelectValue placeholder="Issue to profile" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select profile…</SelectItem>
                    {allProfiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.display_name ?? "Unnamed"} {p.username ? `(@${p.username})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateCatalog}><Plus className="mr-1 h-4 w-4" /> New badge</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader><DialogTitle>{editingCustomId ? "Edit custom demo badge" : "Create custom demo badge"}</DialogTitle></DialogHeader>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Name</Label>
                        <Input value={catalogDraft.name} onChange={(e) => setCatalogDraft({ ...catalogDraft, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Sport interest</Label>
                        <Select value={catalogDraft.interest} onValueChange={(value) => setCatalogDraft({ ...catalogDraft, interest: value as SportInterest })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{SPORT_INTERESTS.map((interest) => <SelectItem key={interest} value={interest}>{interest}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tier intent</Label>
                        <Select value={catalogDraft.tierIntent} onValueChange={(value) => setCatalogDraft({ ...catalogDraft, tierIntent: value as BadgeTier })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{BADGE_TIERS.map((tier) => <SelectItem key={tier} value={tier}>{tier}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Proof hint</Label>
                        <Input value={catalogDraft.proofHint} onChange={(e) => setCatalogDraft({ ...catalogDraft, proofHint: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea value={catalogDraft.description} onChange={(e) => setCatalogDraft({ ...catalogDraft, description: e.target.value })} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setCatalogOpen(false)}>Cancel</Button>
                      <Button onClick={saveCatalogBadge}>Save custom badge</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredCatalog.map((badge) => (
              <Card key={`${badge.source}-${badge.id}`} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={badge.source === "built-in" ? "secondary" : "outline"}>{badge.source === "built-in" ? "Built-in" : "Custom demo"}</Badge>
                      <Badge variant="outline">{badge.interest}</Badge>
                      <Badge>{badge.tierIntent}</Badge>
                    </div>
                    <h3 className="mt-3 truncate text-base font-semibold">{badge.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Award className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Proof:</span> {badge.proofHint}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => issueCatalogBadge(badge)} disabled={!selectedIssueProfile}>
                    <Sparkles className="mr-1 h-3.5 w-3.5" /> Issue
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditCatalog(badge)}>
                    {badge.source === "built-in" ? <Copy className="mr-1 h-3.5 w-3.5" /> : <Edit3 className="mr-1 h-3.5 w-3.5" />}
                    {badge.source === "built-in" ? "Clone" : "Edit"}
                  </Button>
                  {badge.source === "custom" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline"><Trash2 className="mr-1 h-3.5 w-3.5" /> Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete custom badge?</AlertDialogTitle>
                          <AlertDialogDescription>This only removes the local admin demo catalog badge. Already issued badges are not deleted.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCustomBadge(badge.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </Card>
            ))}
            {filteredCatalog.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">No catalog badges match this filter.</Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="issued">
          <Card className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by kind, catalog name, or @username" className="pl-9" />
              </div>
              <div className="w-full max-w-sm">
                <Select value={profileFilter} onValueChange={setProfileFilter}>
                  <SelectTrigger><SelectValue placeholder="Filter by profile" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All profiles</SelectItem>
                    {allProfiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.display_name ?? "Unnamed"} {p.username ? `(@${p.username})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Issue legacy badge</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Issue legacy badge</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Profile</Label>
                      <Select
                        value={draft.profile_id || "manual"}
                        onValueChange={(value) =>
                          setDraft({ ...draft, profile_id: value === "manual" ? "" : value })
                        }
                      >
                        <SelectTrigger><SelectValue placeholder="Select profile" /></SelectTrigger>
                        <SelectContent>
                          {allProfiles.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.display_name ?? "Unnamed"} {p.username ? `(@${p.username})` : ""}
                            </SelectItem>
                          ))}
                          <SelectItem value="manual">Manual profile ID…</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={draft.profile_id}
                        onChange={(e) => setDraft({ ...draft, profile_id: e.target.value })}
                        placeholder="profiles.id (uuid) fallback"
                      />
                    </div>
                    <div>
                      <Label>Kind</Label>
                      <Select value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Tier</Label>
                        <Input type="number" min={1} max={5} value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: Number(e.target.value) || 1 })} />
                      </div>
                      <div>
                        <Label>XION address (optional)</Label>
                        <Input value={draft.xion_address} onChange={(e) => setDraft({ ...draft, xion_address: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={issue}>Issue</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-3 py-2">Owner</th>
                    <th className="px-3 py-2">Badge</th>
                    <th className="px-3 py-2">Kind</th>
                    <th className="px-3 py-2">Tier</th>
                    <th className="px-3 py-2">Verified</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const p = profiles[r.profile_id];
                    const catalogBadge = r.metadata?.catalog_badge;
                    return (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <div className="font-medium">{p?.display_name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{p?.username ? `@${p.username}` : r.profile_id.slice(0, 8)}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium">{catalogBadge?.name ?? "Legacy badge"}</div>
                          <div className="text-xs text-muted-foreground">{catalogBadge?.interest ?? "Admin-issued"}</div>
                        </td>
                        <td className="px-3 py-2"><Badge variant="outline">{r.kind}</Badge></td>
                        <td className="px-3 py-2">{catalogBadge?.tierIntent ?? numberTier(r.tier)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(r.verified_at).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove badge?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove the badge from this profile.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => remove(r)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">No badges.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminBadges;
