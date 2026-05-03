import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, Copy, Sparkles } from "lucide-react";
import {
  CAMPAIGN_CATEGORIES,
  DEFAULT_CAMPAIGN_TIERS,
  createDemoCampaign,
  type CampaignCategory,
  type DemoCampaign,
} from "@/lib/demoMode";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  ownerHandle?: string;
  onCreated?: (c: DemoCampaign) => void;
};

const COVERS = ["📖","🎨","🤝","🎓","🎟️","🏃","🌍","🎤","💡","🚀","🌱","🍀"];

export const CreateCampaignWizard = ({ open, onOpenChange, ownerHandle, onCreated }: Props) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [story, setStory] = useState("");
  const [category, setCategory] = useState<CampaignCategory>("creator");
  const [coverEmoji, setCoverEmoji] = useState("📖");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [goalAmount, setGoalAmount] = useState(1000);
  const [created, setCreated] = useState<DemoCampaign | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(1); setTitle(""); setBlurb(""); setStory("");
        setCategory("creator"); setCoverEmoji("📖"); setVisibility("public");
        setGoalAmount(1000); setCreated(null);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Render QR on step 4 / 5.
  useEffect(() => {
    if ((step === 4 || step === 5) && canvasRef.current && created) {
      const url = `${window.location.origin}/c/${created.id}`;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200, margin: 2, errorCorrectionLevel: "H",
        color: { dark: "#0f172a", light: "#ffffff" },
      }).catch(() => {});
    }
  }, [step, created]);

  const submit = () => {
    const { campaign } = createDemoCampaign({
      title: title || "Untitled campaign",
      blurb: blurb || "Help me make this happen.",
      story,
      category,
      coverEmoji,
      visibility,
      goalAmount,
      tiers: DEFAULT_CAMPAIGN_TIERS,
      ownerHandle,
      endsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
    setCreated(campaign);
    setStep(4);
    onCreated?.(campaign);
  };

  const next = () => {
    if (step === 1 && !title.trim()) { toast.error("Add a title to continue"); return; }
    if (step === 3) { submit(); return; }
    setStep((s) => Math.min(5, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const url = created ? `${window.location.origin}/c/${created.id}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === 5 ? "Campaign published" : "Create a campaign"}
          </DialogTitle>
          <DialogDescription>Step {step} of 5</DialogDescription>
        </DialogHeader>
        <Progress value={(step / 5) * 100} className="h-1" />

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-3 mt-2">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Help me ship Volume II" maxLength={80} />
            </div>
            <div>
              <Label>Short description</Label>
              <Input value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="An illustrated zine, 80 pages." maxLength={120} />
            </div>
            <div>
              <Label>Category</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {CAMPAIGN_CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={`text-left rounded-xl border p-2.5 transition-colors ${
                      category === c.key ? "border-primary bg-primary/10" : "border-glass-border bg-background/30 hover:border-border"
                    }`}
                  >
                    <div className="text-lg">{c.emoji}</div>
                    <div className="text-xs font-semibold">{c.label}</div>
                    <div className="text-[10px] text-muted-foreground">{c.blurb}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Cover</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COVERS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setCoverEmoji(e)}
                    className={`h-9 w-9 rounded-lg grid place-items-center text-lg border ${
                      coverEmoji === e ? "border-primary bg-primary/10" : "border-glass-border bg-background/30"
                    }`}
                  >{e}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-3 mt-2">
            <div>
              <Label>Story</Label>
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Why this matters, who it's for, what supporters get."
                rows={6}
                maxLength={800}
              />
            </div>
            <div>
              <Label>Visibility</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {(["public","private"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={`rounded-xl border p-2.5 text-left ${
                      visibility === v ? "border-primary bg-primary/10" : "border-glass-border bg-background/30"
                    }`}
                  >
                    <div className="text-sm font-semibold capitalize">{v}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {v === "public" ? "Anyone with the link can support" : "Only people you invite"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-3 mt-2">
            <div>
              <Label>Goal</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input type="number" min={50} step={50} value={goalAmount} onChange={(e) => setGoalAmount(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div>
              <Label>Support tiers</Label>
              <ul className="space-y-1.5 mt-1.5">
                {DEFAULT_CAMPAIGN_TIERS.map((t) => (
                  <li key={t.key} className="rounded-xl border border-glass-border bg-background/30 p-2.5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-sm font-semibold">${t.amount}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{t.label}</div>
                      <div className="text-[11px] text-muted-foreground">{t.perks}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-muted-foreground mt-2">Tiers are pre-set for the demo. You can edit them after launch.</p>
            </div>
          </div>
        )}

        {/* Step 4 — preview + QR */}
        {step === 4 && created && (
          <div className="space-y-3 mt-2">
            <div className="rounded-2xl border border-glass-border bg-background/40 p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary grid place-items-center text-2xl">{created.coverEmoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold">{created.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{created.blurb}</div>
                </div>
              </div>
              <Progress value={((created.raised ?? 0) / (created.goalAmount ?? 1)) * 100} className="h-1.5 mt-3" />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>${created.raised ?? 0} raised</span>
                <span>Goal ${created.goalAmount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2"><canvas ref={canvasRef} className="block" /></div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="text-xs text-muted-foreground">Your campaign link</div>
                <div className="text-xs font-mono break-all">{url}</div>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied"); }}>
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — published */}
        {step === 5 && created && (
          <div className="space-y-3 mt-2 text-center">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-primary grid place-items-center shadow-glow-primary">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold">You're live</h3>
            <p className="text-xs text-muted-foreground">Share your link to start collecting support.</p>
            <div className="rounded-xl bg-white p-2 inline-block"><canvas ref={canvasRef} className="block" /></div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={back} disabled={step === 1 || step >= 4}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < 4 && (
            <Button onClick={next} className="bg-gradient-primary">
              {step === 3 ? "Launch demo" : "Next"} <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {step === 4 && (
            <Button onClick={() => setStep(5)} className="bg-gradient-primary">
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {step === 5 && created && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
              <Button asChild className="bg-gradient-primary">
                <a href={`/c/${created.id}`}><Check className="h-4 w-4" /> View campaign</a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
