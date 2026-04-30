import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  BACKGROUNDS, BUTTON_SHAPES, BUTTON_STYLES, FONTS,
  type ProfileTheme,
} from "@/lib/theme";

type Props = {
  theme: ProfileTheme;
  onChange: (patch: Partial<ProfileTheme>) => void;
};

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export const ThemeStudio = ({ theme, onChange }: Props) => {
  return (
    <div className="space-y-6">
      <Section label="Background">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(BACKGROUNDS) as ProfileTheme["background"][]).map((key) => {
            const bg = BACKGROUNDS[key];
            const active = theme.background === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ background: key })}
                className={cn(
                  "group rounded-xl overflow-hidden border transition-all hover:scale-[1.03]",
                  active ? "border-primary ring-2 ring-primary/40" : "border-border/40",
                )}
              >
                <div className="h-14" style={{ background: bg.css }} />
                <div className="text-[10px] py-1.5 text-center">{bg.emoji} {bg.label}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section label={`Accent hue · ${theme.accentHue}°`}>
        <Slider
          value={[theme.accentHue]}
          min={0}
          max={360}
          step={1}
          onValueChange={([v]) => onChange({ accentHue: v })}
        />
        <div
          className="h-2 w-full rounded-full mt-2"
          style={{
            background: `linear-gradient(to right,
              hsl(0 76% 57%), hsl(60 76% 57%), hsl(120 76% 57%),
              hsl(180 76% 57%), hsl(240 76% 57%), hsl(300 76% 57%), hsl(360 76% 57%))`,
          }}
        />
      </Section>

      <Section label="Font">
        <div className="space-y-1.5">
          {(Object.keys(FONTS) as ProfileTheme["font"][]).map((key) => {
            const f = FONTS[key];
            const active = theme.font === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ font: key })}
                className={cn(
                  "w-full glass rounded-xl px-3 py-2.5 text-left transition-all hover:border-primary/50",
                  active && "border-primary/70 ring-1 ring-primary/40",
                )}
                style={{ fontFamily: f.family }}
              >
                <div className="text-sm font-semibold">{f.label}</div>
                <div className="text-[11px] text-muted-foreground">The quick brown fox</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section label="Button shape">
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(BUTTON_SHAPES) as ProfileTheme["buttonShape"][]).map((key) => {
            const s = BUTTON_SHAPES[key];
            const active = theme.buttonShape === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ buttonShape: key })}
                className={cn(
                  "p-2 transition-all",
                  active && "scale-105",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-full mb-1 transition-all",
                    active ? "bg-gradient-primary" : "bg-muted",
                  )}
                  style={{ borderRadius: s.radius }}
                />
                <div className="text-[10px] text-center text-muted-foreground">{s.label}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section label="Button style">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(BUTTON_STYLES) as ProfileTheme["buttonStyle"][]).map((key) => {
            const active = theme.buttonStyle === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ buttonStyle: key })}
                className={cn(
                  "glass rounded-xl py-2 text-xs font-medium transition-all",
                  active && "border-primary/70 ring-1 ring-primary/40",
                )}
              >
                {BUTTON_STYLES[key].label}
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
};
