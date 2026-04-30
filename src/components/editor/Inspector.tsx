import { Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Block } from "@/lib/blocks";
import { getBlockMeta } from "@/lib/blocks";

type Props = {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
  onDelete: () => void;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export const Inspector = ({ block, onChange, onDelete }: Props) => {
  const meta = getBlockMeta(block.type);
  const c = block.config as Record<string, string>;
  const set = (k: string, v: unknown) => onChange({ config: { ...block.config, [k]: v } });

  const renderFields = () => {
    switch (block.type) {
      case "link":
        return (
          <>
            <Field label="Title"><Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="URL"><Input value={c.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://" /></Field>
            <Field label="Emoji"><Input value={c.emoji || ""} onChange={(e) => set("emoji", e.target.value)} maxLength={4} /></Field>
          </>
        );
      case "heading":
        return <Field label="Text"><Input value={c.text || ""} onChange={(e) => set("text", e.target.value)} /></Field>;
      case "text":
        return <Field label="Text"><Textarea rows={4} value={c.text || ""} onChange={(e) => set("text", e.target.value)} /></Field>;
      case "avatar":
        return (
          <>
            <Field label="Name"><Input value={c.name || ""} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Subtitle"><Input value={c.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
          </>
        );
      case "social": {
        const items = (block.config as { items?: { platform: string; url: string }[] }).items || [];
        return (
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{it.platform}</Label>
                <Input
                  value={it.url}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...it, url: e.target.value };
                    set("items", next);
                  }}
                  placeholder="https://"
                />
              </div>
            ))}
          </div>
        );
      }
      case "image":
        return (
          <>
            <Field label="Image URL"><Input value={c.url || ""} onChange={(e) => set("url", e.target.value)} /></Field>
            <Field label="Alt text"><Input value={c.alt || ""} onChange={(e) => set("alt", e.target.value)} /></Field>
          </>
        );
      case "video_embed":
      case "music_embed":
        return <Field label="Embed URL"><Input value={c.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="Paste URL" /></Field>;
      case "wallet":
        return (
          <>
            <Field label="Label"><Input value={c.label || ""} onChange={(e) => set("label", e.target.value)} /></Field>
            <Field label="Address"><Input value={c.address || ""} onChange={(e) => set("address", e.target.value)} className="font-mono text-xs" /></Field>
          </>
        );
      case "nft":
        return (
          <>
            <Field label="Title"><Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Contract"><Input value={c.contract || ""} onChange={(e) => set("contract", e.target.value)} /></Field>
            <Field label="Token ID"><Input value={c.tokenId || ""} onChange={(e) => set("tokenId", e.target.value)} /></Field>
          </>
        );
      case "token_balance":
        return (
          <>
            <Field label="Label"><Input value={c.label || ""} onChange={(e) => set("label", e.target.value)} /></Field>
            <Field label="Token"><Input value={c.token || ""} onChange={(e) => set("token", e.target.value)} /></Field>
          </>
        );
      case "tip_jar":
        return (
          <>
            <Field label="Title"><Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Currency"><Input value={c.currency || ""} onChange={(e) => set("currency", e.target.value)} /></Field>
          </>
        );
      case "contact_form":
        return <Field label="Title"><Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} /></Field>;
      case "calendar":
        return (
          <>
            <Field label="Title"><Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Booking URL"><Input value={c.url || ""} onChange={(e) => set("url", e.target.value)} /></Field>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Editing</div>
        <div className="font-display text-lg font-semibold flex items-center gap-2">
          <meta.icon className="h-4 w-4 text-primary" />
          {meta.label}
        </div>
      </div>
      <div className="space-y-4">{renderFields()}</div>
      <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ is_visible: !block.is_visible })}
        >
          {block.is_visible ? <Eye className="h-4 w-4 mr-1.5" /> : <EyeOff className="h-4 w-4 mr-1.5" />}
          {block.is_visible ? "Visible" : "Hidden"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete
        </Button>
      </div>
    </div>
  );
};
