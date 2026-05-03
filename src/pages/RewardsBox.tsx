import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Gift, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RewardsLocker } from "@/components/dashboard/RewardsLocker";
import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type RewardsProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  settings?: unknown;
};

const getSettingsObject = (settings: unknown): Record<string, unknown> => {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return {};
  }

  return settings as Record<string, unknown>;
};

const getNestedObject = (object: Record<string, unknown>, key: string): Record<string, unknown> => {
  const value = object[key];

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

const getShowOfferBox = (settings: unknown): boolean => {
  const settingsObject = getSettingsObject(settings);
  const publicProfileSettings = getNestedObject(settingsObject, "xionidPublicProfile");

  return publicProfileSettings.showOfferBox !== false;
};

const buildUpdatedSettings = (settings: unknown, showOfferBox: boolean): Record<string, unknown> => {
  const root = getSettingsObject(settings);
  const publicProfileSettings = getNestedObject(root, "xionidPublicProfile");

  return {
    ...root,
    xionidPublicProfile: {
      ...publicProfileSettings,
      showOfferBox,
    },
  };
};

const OfferBoxVisibilityCard = ({
  profile,
  onProfileChange,
}: {
  profile: RewardsProfile;
  onProfileChange: (profile: RewardsProfile) => void;
}) => {
  const [saving, setSaving] = useState(false);
  const showOfferBox = getShowOfferBox(profile.settings);

  const updateVisibility = async (next: boolean) => {
    const previousProfile = profile;
    const nextSettings = buildUpdatedSettings(profile.settings, next);

    onProfileChange({
      ...profile,
      settings: nextSettings,
    });

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          settings: nextSettings as any,
        })
        .eq("id", profile.id)
        .select("id, username, display_name, settings")
        .single();

      if (error) throw error;

      onProfileChange(data as RewardsProfile);

      toast.success("Offer Box visibility updated", {
        description: next
          ? "Offer Box is now visible on your public profile."
          : "Offer Box is now hidden from your public profile.",
      });
    } catch (error) {
      onProfileChange(previousProfile);

      toast.error("Could not update Offer Box visibility", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-glass-border bg-card/55 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Gift className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-foreground">Offer Box visibility</h2>

              <span className="rounded-full border border-glass-border bg-background/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                Public profile
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Choose whether your matched rewards appear on your public XIONID profile. This only controls public
              visibility — it does not delete or archive rewards.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-glass-border bg-background/35 px-4 py-3 md:min-w-[290px]">
          <div className="flex items-center gap-3">
            {showOfferBox ? (
              <Eye className="h-4 w-4 text-emerald-300" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}

            <Label htmlFor="offer-box-visibility" className="cursor-pointer text-sm font-medium">
              {showOfferBox ? "Shown on profile" : "Hidden from profile"}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}

            <Switch
              id="offer-box-visibility"
              checked={showOfferBox}
              disabled={saving}
              onCheckedChange={updateVisibility}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50/80">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          <p>Privacy-first rule: visitors only see your Offer Box when you choose to show it.</p>
        </div>
      </div>
    </section>
  );
};

const RewardsBox = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<RewardsProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    let cancelled = false;

    setLoadingProfile(true);

    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, settings")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        toast.error("Could not load Offer Box settings", {
          description: error.message,
        });
      }

      setProfile((data as RewardsProfile | null) ?? null);
      setLoadingProfile(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Dashboard
            </Link>
          </Button>

          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size={28} />
            <span className="text-sm font-semibold">
              <Wordmark /> · Offer Box
            </span>
          </Link>

          <div className="w-[120px]" />
        </div>
      </header>

      <main className="container py-8 md:py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Your <span className="text-gradient-brand">Offer Box</span>
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Rewards matched to your verified signals. Claim, save or archive.
          </p>
        </div>

        {loadingProfile ? (
          <section className="rounded-3xl border border-glass-border bg-card/55 p-5 shadow-soft backdrop-blur-xl">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading Offer Box visibility...
            </div>
          </section>
        ) : profile ? (
          <OfferBoxVisibilityCard profile={profile} onProfileChange={setProfile} />
        ) : null}

        <RewardsLocker />
      </main>
    </div>
  );
};

export default RewardsBox;
