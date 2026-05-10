import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_AVATARS, getOnboardingAvatarById } from "@/lib/onboardingAvatars";

type AvatarPickerProps = {
  value: string;
  onChange: (id: string) => void;
};

export const AvatarPicker = ({ value, onChange }: AvatarPickerProps) => {
  const selectedAvatar = getOnboardingAvatarById(value);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/12 via-background/50 to-secondary/10 p-[1px] shadow-glow-primary/40">
        <div className="flex items-center gap-4 rounded-3xl bg-background/70 p-4 backdrop-blur-xl">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/25 to-secondary/25">
            <img
              src={selectedAvatar.src}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.28em] text-primary">Selected signal</div>
            <div className="mt-1 font-display text-xl font-semibold">{selectedAvatar.ui_label}</div>
            <div className="text-sm text-muted-foreground">{selectedAvatar.ui_subtitle}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ONBOARDING_AVATARS.map((avatar) => {
          const selected = avatar.avatar_id === selectedAvatar.avatar_id;

          return (
            <button
              key={avatar.avatar_id}
              type="button"
              onClick={() => onChange(avatar.avatar_id)}
              aria-label={`Select ${avatar.ui_label} ${avatar.gender_variant} avatar, ${avatar.ui_subtitle}`}
              aria-pressed={selected}
              className={cn(
                "group relative overflow-hidden rounded-3xl border p-[1px] text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                selected
                  ? "border-primary/80 bg-gradient-to-br from-primary via-secondary to-primary shadow-glow-primary"
                  : "border-glass-border bg-white/5 hover:border-primary/40 hover:bg-primary/10",
              )}
            >
              <div className="h-full rounded-3xl bg-background/70 p-2.5 backdrop-blur-xl">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/10 to-background">
                  <img
                    src={avatar.src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                  {selected ? (
                    <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 min-w-0">
                  <div className="truncate text-sm font-semibold">{avatar.ui_label}</div>
                  <div className="truncate text-xs text-muted-foreground">{avatar.ui_subtitle}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
