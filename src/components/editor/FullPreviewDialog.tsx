import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Smartphone, Monitor, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockRenderer } from "@/components/editor/BlockRenderer";
import { DEFAULT_THEME, BACKGROUNDS, FONTS, themeStyleVars, type ProfileTheme } from "@/lib/theme";
import type { BlockMeta } from "@/lib/blocks";
import { validateBlockConfig } from "@/lib/blockValidation";

type Props = {
  meta: BlockMeta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (meta: BlockMeta) => void;
  /** Optional theme override — defaults to DEFAULT_THEME so users see neutral output. */
  theme?: ProfileTheme;
};

type Viewport = "mobile" | "desktop";

export const FullPreviewDialog = ({
  meta, open, onOpenChange, onAdd, theme = DEFAULT_THEME,
}: Props) => {
  const [viewport, setViewport] = useState<Viewport>("mobile");
  if (!meta) return null;

  const previewBlock = {
    id: `preview-${meta.type}`,
    profile_id: "preview",
    type: meta.type,
    position: 0,
    config: meta.previewConfig,
    is_visible: true,
  };
  const issues = validateBlockConfig(meta.type, meta.previewConfig);
  const styleVars = themeStyleVars(theme);

  const frameClasses =
    viewport === "mobile"
      ? "w-[380px] h-[720px] rounded-[2.5rem]"
      : "w-full max-w-[920px] h-[680px] rounded-2xl";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-border/40 flex-row items-center justify-between space-y-0">
          <div className="min-w-0">
            <DialogTitle className="text-base flex items-center gap-2">
              <meta.icon className="h-4 w-4 text-primary" />
              {meta.label} preview
            </DialogTitle>
            <DialogDescription className="text-xs">
              How this block renders on your live profile.
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-lg border border-border p-0.5">
              <button
                onClick={() => setViewport("mobile")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors",
                  viewport === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Mobile preview"
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile
              </button>
              <button
                onClick={() => setViewport("desktop")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors",
                  viewport === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Desktop preview"
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
            </div>
            {onAdd && (
              <button
                onClick={() => { onAdd(meta); onOpenChange(false); }}
                className="h-8 px-3 rounded-md bg-gradient-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add to profile
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="bg-muted/30 p-6 overflow-auto max-h-[80vh] grid place-items-center">
          <div
            className={cn("shadow-elevated overflow-hidden border border-border/40", frameClasses)}
            style={{
              ...styleVars,
              background: BACKGROUNDS[theme.background].css,
              fontFamily: FONTS[theme.font].family,
            }}
          >
            {/* Mimic the public profile container so spacing matches reality. */}
            <div className={cn(
              "h-full overflow-y-auto px-5 py-10",
              viewport === "mobile" ? "max-w-md mx-auto" : "max-w-md mx-auto",
            )}>
              <div className="text-center mb-6">
                <div className="text-xs text-muted-foreground">Preview · sample content</div>
              </div>
              <div className="space-y-3">
                <BlockRenderer block={previewBlock} theme={theme} />
              </div>
            </div>
          </div>
        </div>

        {issues.length > 0 && (
          <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
              Notes about this preview
            </div>
            <ul className="space-y-1">
              {issues.map((iss, i) => (
                <li key={i} className="text-[11px] text-muted-foreground">
                  <span className={cn(
                    "font-medium",
                    iss.severity === "error" ? "text-destructive" : "text-amber-600 dark:text-amber-400",
                  )}>
                    {iss.field}
                  </span>{" "}· {iss.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
