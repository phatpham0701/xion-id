import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  SPORT_INTERESTS,
  getSuggestedBadges,
  getTierFromProofs,
  saveSportLifestyleState,
  type SportBadgeDefinition,
  type SportInterest,
  type SportLifestyleState,
} from "@/lib/sportLifestyle";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: SportLifestyleState;
  onStateChange: (state: SportLifestyleState) => void;
};

const PROOF_TYPES = ["Manual activity entry", "Activity screenshot", "Event participation", "Gear in-use proof", "Recovery or wellness habit", "Demo simulation"];

export const VerifyLifestyleDialog = ({ open, onOpenChange, state, onStateChange }: Props) => {
  const [interest, setInterest] = useState<SportInterest>(state.selectedInterest);
  const suggested = useMemo(() => getSuggestedBadges(interest), [interest]);
  const [badgeId, setBadgeId] = useState(suggested[0]?.id ?? "");
  const [proofType, setProofType] = useState(PROOF_TYPES[5]);

  const selectedBadge: SportBadgeDefinition = suggested.find((badge) => badge.id === badgeId) ?? suggested[0];

  const handleInterest = (value: string) => {
    const nextInterest = value as SportInterest;
    const badges = getSuggestedBadges(nextInterest);
    setInterest(nextInterest);
    setBadgeId(badges[0]?.id ?? "");
  };

  const submitProof = (status: "Simulated" | "Submitted") => {
    if (!selectedBadge) return;
    const previous = state.earnedBadges[selectedBadge.id];
    const proofs = (previous?.proofs ?? 0) + 1;
    const progress = Math.min(100, proofs * 20);
    const next = {
      ...state,
      selectedInterest: interest,
      earnedBadges: {
        ...state.earnedBadges,
        [selectedBadge.id]: { tier: getTierFromProofs(proofs), progress, proofs },
      },
      proofs: [
        {
          id: `proof-${Date.now()}`,
          interest,
          badgeId: selectedBadge.id,
          proofType,
          status,
          createdAt: new Date().toISOString(),
        },
        ...state.proofs,
      ],
      challenges: state.challenges.map((challenge) => {
        if (challenge.sportType !== interest) return challenge;
        return { ...challenge, currentProgress: Math.min(challenge.target, challenge.currentProgress + 1) };
      }),
    };
    saveSportLifestyleState(next);
    onStateChange(next);
    toast.success(status === "Simulated" ? "Demo lifestyle proof simulated." : "Lifestyle proof submitted for review.", {
      description: `${selectedBadge.name} is now ${next.earnedBadges[selectedBadge.id].tier}. Manual proof is not marked fully verified.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Verify your lifestyle</DialogTitle>
          <DialogDescription>
            Submit or simulate sport lifestyle proof. Pilot proof is labeled as Simulated or Submitted until reviewed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sport interest</Label>
              <Select value={interest} onValueChange={handleInterest}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPORT_INTERESTS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Proof type</Label>
              <Select value={proofType} onValueChange={setProofType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROOF_TYPES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Badge target</Label>
              <Select value={badgeId || selectedBadge?.id} onValueChange={setBadgeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {suggested.map((badge) => <SelectItem key={badge.id} value={badge.id}>{badge.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedBadge && (
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary">Suggested badge</Badge>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold">{selectedBadge.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedBadge.description}</p>
              <div className="rounded-2xl bg-background/60 p-3 text-sm">
                <div className="font-medium">Proof hint</div>
                <div className="text-muted-foreground">{selectedBadge.proofHint}</div>
              </div>
              <Progress value={state.earnedBadges[selectedBadge.id]?.progress ?? 0} className="h-2" />
              <p className="text-xs text-muted-foreground">Progress can move from Bronze to Elite through repeated proof and completed challenges.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button className="bg-gradient-primary flex-1" onClick={() => submitProof("Simulated")}>
            <CheckCircle2 className="h-4 w-4" /> Simulate accepted proof
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => submitProof("Submitted")}>
            Submit for review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
