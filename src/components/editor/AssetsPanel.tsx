import { Image as ImageIcon, Link as LinkIcon, Smile, Type } from "lucide-react";

/**
 * Lightweight assets panel — quick reference + tips for now.
 * Image upload uses the existing avatar picker in the dashboard;
 * adding a media library here would require a storage migration.
 */
export const AssetsPanel = () => (
  <div className="space-y-3">
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
      <div className="text-xs font-semibold">Assets</div>
      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
        Quick reference for the assets you can drop into your blocks.
      </p>
    </div>

    <Tip icon={ImageIcon} title="Images" body="Paste any image URL into an Image block. 1200×800 or larger looks crisp on retina." />
    <Tip icon={LinkIcon}  title="Links"  body="Use a clear verb in the title — “Watch latest video” beats “YouTube”." />
    <Tip icon={Smile}     title="Emoji"  body="A single emoji in front of a Link button improves scanability and click rate." />
    <Tip icon={Type}      title="Copy"   body="Keep bios under 2 sentences. Visitors skim, not read." />
  </div>
);

const Tip = ({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) => (
  <div className="rounded-xl border border-border/40 bg-background/40 p-3 flex items-start gap-3">
    <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center shrink-0">
      <Icon className="h-3.5 w-3.5 text-primary" />
    </div>
    <div className="min-w-0">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-[11px] text-muted-foreground leading-relaxed">{body}</div>
    </div>
  </div>
);
