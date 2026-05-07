import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPORT_INTERESTS, getSuggestedBadges, saveSportLifestyleState, type SportInterest, type SportLifestyleState } from "@/lib/sportLifestyle";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: SportLifestyleState;
  onStateChange: (state: SportLifestyleState) => void;
};

const defaultDeadline = () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export const ChallengeCreatorDialog = ({ open, onOpenChange, state, onStateChange }: Props) => {
  const [title, setTitle] = useState("Build a 2-week consistency streak");
  const [sportType, setSportType] = useState<SportInterest>(state.selectedInterest);
  const [targetMetric, setTargetMetric] = useState("accepted proofs");
  const [target, setTarget] = useState(6);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [deadline, setDeadline] = useState(defaultDeadline());
  const badges = useMemo(() => getSuggestedBadges(sportType), [sportType]);
  const [linkedBadgeId, setLinkedBadgeId] = useState(badges[0]?.id ?? "running-1");

  const handleSportType = (value: string) => {
    const nextSport = value as SportInterest;
    const nextBadges = getSuggestedBadges(nextSport);
    setSportType(nextSport);
    setLinkedBadgeId(nextBadges[0]?.id ?? "");
  };

  const createChallenge = () => {
    if (!title.trim() || target <= 0 || !deadline || !linkedBadgeId) {
      toast.error("Add a title, target, deadline, and linked badge.");
      return;
    }

    const next = {
      ...state,
      selectedInterest: sportType,
      challenges: [
        {
          id: `challenge-${Date.now()}`,
          title: title.trim(),
          sportType,
          targetMetric: targetMetric.trim() || "accepted proofs",
          target,
          currentProgress: Math.min(currentProgress, target),
          deadline,
          linkedBadgeId,
        },
        ...state.challenges,
      ],
    };
    saveSportLifestyleState(next);
    onStateChange(next);
    toast.success("Personal challenge created.", { description: "It now appears on your Dashboard with a countdown." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Create personal challenge</DialogTitle>
          <DialogDescription>Set a sport target, deadline, countdown, and linked badge impact preview.</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Sport type</Label>
            <Select value={sportType} onValueChange={handleSportType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SPORT_INTERESTS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Linked badge</Label>
            <Select value={linkedBadgeId} onValueChange={setLinkedBadgeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{badges.map((badge) => <SelectItem key={badge.id} value={badge.id}>{badge.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Target metric</Label>
            <Input value={targetMetric} onChange={(event) => setTargetMetric(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Target count</Label>
            <Input type="number" value={target} min={1} onChange={(event) => setTarget(Number(event.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Current progress</Label>
            <Input type="number" value={currentProgress} min={0} onChange={(event) => setCurrentProgress(Number(event.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          </div>
        </div>

        <Button className="bg-gradient-primary" onClick={createChallenge}>
          <Target className="h-4 w-4" /> Create challenge
        </Button>
      </DialogContent>
    </Dialog>
  );
};
