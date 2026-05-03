import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2, Sparkles, Globe } from "lucide-react";
import { checkIdAvailability, suggestIds, reserveDemoId } from "@/lib/demoMode";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: string;
  onReserved?: (handle: string) => void;
};

export const ClaimIdDialog = ({ open, onOpenChange, initial = "", onReserved }: Props) => {
  const [value, setValue] = useState(initial);
  const [checking, setChecking] = useState(false);
  const [reserved, setReserved] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => { setValue(initial); setReserved(null); }, 200);
      return () => clearTimeout(t);
    }
  }, [open, initial]);

  // Debounced checking animation.
  useEffect(() => {
    if (!value) return;
    setChecking(true);
    const t = setTimeout(() => setChecking(false), 350);
    return () => clearTimeout(t);
  }, [value]);

  const result = useMemo(() => checkIdAvailability(value), [value]);
  const suggestions = useMemo(() => suggestIds(value || "you").slice(0, 4), [value]);
  const previewUrl = `xionid.com/${result.handle || "you"}`;

  const reserve = () => {
    if (!result.available) return;
    reserveDemoId(result.handle);
    setReserved(result.handle);
    toast.success(`@${result.handle} is yours`, { description: "Your public ID is reserved." });
    onReserved?.(result.handle);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {reserved ? "You're claimed" : "Claim your ID"}
          </DialogTitle>
          <DialogDescription>
            {reserved
              ? "Your public ID is locked in for the demo."
              : "Pick a name. We'll reserve it instantly."}
          </DialogDescription>
        </DialogHeader>

        {!reserved && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-xl border border-glass-border bg-background/40 px-3 py-2">
                <span className="text-sm text-muted-foreground shrink-0">xionid.com/</span>
                <Input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="paulus"
                  className="border-0 bg-transparent focus-visible:ring-0 px-0 h-8"
                  maxLength={24}
                />
                <div className="shrink-0">
                  {!value ? null : checking ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : result.available ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              <div className="text-[11px] flex items-center gap-1.5 min-h-[16px]">
                {value && !checking && (
                  result.available ? (
                    <span className="text-primary">Available</span>
                  ) : (
                    <span className="text-muted-foreground">{result.reason ?? "Unavailable"}</span>
                  )
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-glass-border bg-background/40 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-semibold">
                {(result.handle || "y").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">@{result.handle || "yourname"}</div>
                <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Globe className="h-3 w-3" /> {previewUrl}</div>
              </div>
            </div>

            {/* Suggestions */}
            {value && !result.available && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Try one of these</div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => setValue(sug)}
                      className="text-xs px-2.5 py-1 rounded-full border border-glass-border bg-background/30 hover:border-primary/40"
                    >
                      @{sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={reserve} disabled={!result.available} className="bg-gradient-primary">
                <Sparkles className="h-4 w-4" /> Reserve instantly
              </Button>
            </div>
          </>
        )}

        {reserved && (
          <div className="space-y-3 text-center">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-primary grid place-items-center shadow-glow-primary">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="font-display text-xl font-semibold">@{reserved}</div>
            <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Globe className="h-3 w-3" /> xionid.com/{reserved}</div>
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button asChild className="bg-gradient-primary">
                <a href={`/${reserved}`} target="_blank" rel="noreferrer">View public page</a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
