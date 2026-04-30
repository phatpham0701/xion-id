import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Check, Copy, ExternalLink, Eye, Globe, Loader2, Pencil, Save, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type EditableProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_published: boolean;
};

type Props = {
  profile: EditableProfile;
  onChange: (p: EditableProfile) => void;
  onShare: () => void;
};

const MAX_BIO = 200;

export const ProfileEditorCard = ({ profile, onChange, onShare }: Props) => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    display_name: profile.display_name ?? "",
    bio: profile.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setDraft({ display_name: profile.display_name ?? "", bio: profile.bio ?? "" });
  }, [profile.display_name, profile.bio]);

  const profileUrl = `${window.location.origin}/${profile.username ?? ""}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied");
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: draft.display_name.trim() || null,
          bio: draft.bio.trim() || null,
        })
        .eq("id", profile.id)
        .select("id, username, display_name, avatar_url, bio, is_published")
        .single();
      if (error) throw error;
      onChange(data as EditableProfile);
      setEditing(false);
      toast.success("Profile saved");
    } catch (err) {
      toast.error("Couldn't save", { description: err instanceof Error ? err.message : "Try again" });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (next: boolean) => {
    // optimistic
    onChange({ ...profile, is_published: next });
    const { error } = await supabase
      .from("profiles").update({ is_published: next }).eq("id", profile.id);
    if (error) {
      onChange({ ...profile, is_published: !next });
      toast.error("Couldn't update", { description: error.message });
    } else {
      toast.success(next ? "Profile is public" : "Profile hidden");
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Max 4MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars").upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const { data, error } = await supabase
        .from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", profile.id)
        .select("id, username, display_name, avatar_url, bio, is_published").single();
      if (error) throw error;
      onChange(data as EditableProfile);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error("Upload failed", { description: err instanceof Error ? err.message : "Try again" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const initial = (profile.display_name || profile.username || "X").slice(0, 1).toUpperCase();

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      {/* Top row */}
      <div className="flex items-start gap-5 mb-6">
        <div className="relative shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? profile.username ?? "Avatar"}
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-display text-2xl font-semibold">
              {initial}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full bg-card border border-border grid place-items-center hover:bg-accent transition-colors disabled:opacity-50"
            aria-label="Change avatar"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <Input
                value={draft.display_name}
                onChange={(e) => setDraft({ ...draft, display_name: e.target.value })}
                placeholder="Display name"
                maxLength={60}
                className="font-display text-lg h-10"
              />
              <Textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value.slice(0, MAX_BIO) })}
                placeholder="A short bio that shows up on your public profile…"
                rows={2}
                className="resize-none text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{draft.bio.length}/{MAX_BIO}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft({ display_name: profile.display_name ?? "", bio: profile.bio ?? "" }); }}>Cancel</Button>
                  <Button size="sm" onClick={save} disabled={saving} className="bg-gradient-primary text-primary-foreground">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5 mr-1.5" />Save</>}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="group">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-display text-xl font-semibold truncate">
                  {profile.display_name || profile.username}
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              </div>
              <div className="text-sm text-muted-foreground">@{profile.username}</div>
              {profile.bio ? (
                <p className="text-sm text-foreground/80 mt-2 leading-relaxed line-clamp-3">{profile.bio}</p>
              ) : (
                <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground italic mt-2 hover:text-foreground">
                  + Add a short bio
                </button>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1.5 text-xs glass rounded-full px-2.5 py-1">
          <span className={`h-1.5 w-1.5 rounded-full ${profile.is_published ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
          <span className={profile.is_published ? "text-primary" : "text-muted-foreground"}>
            {profile.is_published ? "Live" : "Hidden"}
          </span>
        </div>
      </div>

      {/* URL row */}
      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 mb-4">
        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-mono truncate flex-1">{profileUrl}</span>
        <Button size="sm" variant="ghost" onClick={copyLink} className="h-8 px-2" aria-label="Copy link">
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" asChild className="h-8 px-2" aria-label="Open profile">
          <a href={`/${profile.username}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>

      {/* Publish + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Switch
            id="publish"
            checked={profile.is_published}
            onCheckedChange={togglePublish}
          />
          <Label htmlFor="publish" className="text-sm cursor-pointer">
            {profile.is_published ? "Visible to everyone" : "Hidden from public"}
          </Label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-medium">
            <Link to="/editor">
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit blocks
            </Link>
          </Button>
          <Button variant="outline" className="glass border-glass-border" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-1.5" />
            Share
          </Button>
          <Button variant="outline" className="glass border-glass-border" asChild>
            <a href={`/${profile.username}`} target="_blank" rel="noreferrer">
              <Eye className="h-4 w-4 mr-1.5" />
              Preview
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
