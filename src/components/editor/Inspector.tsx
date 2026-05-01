import type { ReactNode } from "react";
import { Trash2, Eye, EyeOff, Palette, Settings2, Info, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/blocks";
import { getBlockMeta } from "@/lib/blocks";
import { validateBlockConfig, summarizeIssues } from "@/lib/blockValidation";

type Props = {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
  onDelete: () => void;
};

type BlockStyle = {
  alignment: "left" | "center" | "right";
  width: "full" | "compact";
  padding: "compact" | "normal" | "spacious";
  backgroundStyle: "none" | "glass" | "solid" | "gradient";
  radius: "soft" | "rounded" | "pill" | "square";
  shadow: "none" | "soft" | "glow";
  accent: "default" | "primary" | "secondary";
};

const DEFAULT_BLOCK_STYLE: BlockStyle = {
  alignment: "center",
  width: "full",
  padding: "normal",
  backgroundStyle: "none",
  radius: "rounded",
  shadow: "none",
  accent: "default",
};

const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    {children}
    {hint ? <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p> : null}
  </div>
);

const Section = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
    <div className="mb-4">
      <div className="text-sm font-semibold">{title}</div>
      {description ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const OptionGroup = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xl border px-3 py-2 text-left text-xs transition-all",
              active
                ? "border-primary/60 bg-primary/10 text-primary shadow-sm"
                : "border-border/50 bg-background/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

const getConfigRecord = (block: Block) => (block.config || {}) as Record<string, unknown>;

export const Inspector = ({ block, onChange, onDelete }: Props) => {
  const meta = getBlockMeta(block.type);
  const config = getConfigRecord(block);
  const c = config as Record<string, string>;
  const style = {
    ...DEFAULT_BLOCK_STYLE,
    ...((config.__style || {}) as Partial<BlockStyle>),
  };

  const issues = validateBlockConfig(block.type, block.config);
  const issueSummary = summarizeIssues(issues);
  const firstError = issues.find((issue) => issue.severity === "error");
  const firstWarning = issues.find((issue) => issue.severity === "warning");

  const setConfig = (next: Record<string, unknown>) => {
    onChange({ config: next as Block["config"] });
  };

  const set = (key: string, value: unknown) => {
    setConfig({ ...config, [key]: value });
  };

  const setStyle = <K extends keyof BlockStyle>(key: K, value: BlockStyle[K]) => {
    set("__style", {
      ...style,
      [key]: value,
    });
  };

  const copyBlockId = async () => {
    try {
      await navigator.clipboard.writeText(block.id);
      toast.success("Block ID copied");
    } catch {
      toast.error("Couldn't copy block ID");
    }
  };

  const renderContentFields = () => {
    switch (block.type) {
      case "link":
        return (
          <>
            <Field label="Title">
              <Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="URL">
              <Input value={c.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://" />
            </Field>
            <Field label="Emoji">
              <Input value={c.emoji || ""} onChange={(e) => set("emoji", e.target.value)} maxLength={4} />
            </Field>
          </>
        );

      case "heading":
        return (
          <Field label="Text">
            <Input value={c.text || ""} onChange={(e) => set("text", e.target.value)} />
          </Field>
        );

      case "text":
        return (
          <Field label="Text">
            <Textarea rows={5} value={c.text || ""} onChange={(e) => set("text", e.target.value)} />
          </Field>
        );

      case "avatar":
        return (
          <>
            <Field label="Name">
              <Input value={c.name || ""} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <Input value={c.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} />
            </Field>
          </>
        );

      case "social": {
        const items = (block.config as { items?: { platform: string; url: string }[] }).items || [];

        return (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={`${item.platform}-${index}`} className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{item.platform}</Label>
                <Input
                  value={item.url}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = { ...item, url: e.target.value };
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
            <Field label="Image URL">
              <Input value={c.url || ""} onChange={(e) => set("url", e.target.value)} />
            </Field>
            <Field label="Alt text">
              <Input value={c.alt || ""} onChange={(e) => set("alt", e.target.value)} />
            </Field>
          </>
        );

      case "video_embed":
      case "music_embed":
        return (
          <Field label="Embed URL">
            <Input value={c.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="Paste URL" />
          </Field>
        );

      case "wallet":
        return (
          <>
            <Field label="Label">
              <Input value={c.label || ""} onChange={(e) => set("label", e.target.value)} />
            </Field>
            <Field label="Address" hint="Later, this should be connected to XION Meta Account visibility settings.">
              <Input
                value={c.address || ""}
                onChange={(e) => set("address", e.target.value)}
                className="font-mono text-xs"
              />
            </Field>
          </>
        );

      case "nft":
        return (
          <>
            <Field label="Title">
              <Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Contract">
              <Input value={c.contract || ""} onChange={(e) => set("contract", e.target.value)} />
            </Field>
            <Field label="Token ID">
              <Input value={c.tokenId || ""} onChange={(e) => set("tokenId", e.target.value)} />
            </Field>
          </>
        );

      case "token_balance":
        return (
          <>
            <Field label="Label">
              <Input value={c.label || ""} onChange={(e) => set("label", e.target.value)} />
            </Field>
            <Field label="Token">
              <Input value={c.token || ""} onChange={(e) => set("token", e.target.value)} />
            </Field>
          </>
        );

      case "tip_jar": {
        const amounts = Array.isArray(c.suggestedAmounts) ? (c.suggestedAmounts as unknown[]) : [0.1, 0.5, 1];
        const a0 = String(amounts[0] ?? "");
        const a1 = String(amounts[1] ?? "");
        const a2 = String(amounts[2] ?? "");
        const setAmount = (idx: number, val: string) => {
          const next = [a0, a1, a2];
          next[idx] = val;
          set(
            "suggestedAmounts",
            next.map((v) => parseFloat(v)).filter((n) => Number.isFinite(n) && n > 0),
          );
        };
        return (
          <>
            <Field label="Title">
              <Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Currency">
              <Input value={c.currency || "XION"} onChange={(e) => set("currency", e.target.value)} />
            </Field>
            <Field label="CTA copy">
              <Input
                value={c.cta || "Tip on XION"}
                onChange={(e) => set("cta", e.target.value)}
                placeholder="Tip on XION"
              />
            </Field>
            <Field label="Support note">
              <Textarea
                rows={3}
                value={c.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Support my work with a quick XION tip."
              />
            </Field>
            <Field label="Suggested amounts" hint="Up to 3 quick-pick amounts shown to tippers.">
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" min="0" step="0.01" value={a0} onChange={(e) => setAmount(0, e.target.value)} placeholder="0.1" />
                <Input type="number" min="0" step="0.01" value={a1} onChange={(e) => setAmount(1, e.target.value)} placeholder="0.5" />
                <Input type="number" min="0" step="0.01" value={a2} onChange={(e) => setAmount(2, e.target.value)} placeholder="1" />
              </div>
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-3 py-2.5">
              <div>
                <div className="text-sm font-medium">Allow custom amount</div>
                <p className="text-[11px] text-muted-foreground">Tippers can type any amount.</p>
              </div>
              <Switch
                checked={c.allowCustom !== false}
                onCheckedChange={(v) => set("allowCustom", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-3 py-2.5">
              <div>
                <div className="text-sm font-medium">Allow message</div>
                <p className="text-[11px] text-muted-foreground">Add a 280-char note to each tip.</p>
              </div>
              <Switch
                checked={c.allowMessage !== false}
                onCheckedChange={(v) => set("allowMessage", v)}
              />
            </div>
          </>
        );
      }

      case "contact_form":
        return (
          <Field label="Title">
            <Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} />
          </Field>
        );

      case "calendar":
        return (
          <>
            <Field label="Title">
              <Input value={c.title || ""} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Booking URL">
              <Input value={c.url || ""} onChange={(e) => set("url", e.target.value)} />
            </Field>
          </>
        );

      default:
        return <p className="text-sm text-muted-foreground">This block does not have editable content fields yet.</p>;
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

        <div className="mt-3 flex items-center gap-2">
          {issueSummary.errors > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[11px] text-destructive">
              <AlertTriangle className="h-3 w-3" />
              Needs setup
            </span>
          ) : issueSummary.warnings > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              Check details
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
              <CheckCircle2 className="h-3 w-3" />
              Ready
            </span>
          )}
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="content" className="text-xs">
            Content
          </TabsTrigger>
          <TabsTrigger value="design" className="text-xs">
            Design
          </TabsTrigger>
          <TabsTrigger value="visibility" className="text-xs">
            Visibility
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Section title="Content" description="Edit the text, URL, media, and creator support details for this block.">
            {renderContentFields()}
          </Section>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <Section
            title="Block style"
            description="These style settings are saved into this block. The next renderer upgrade will make all of them visible in the preview."
          >
            <OptionGroup
              label="Alignment"
              value={style.alignment}
              options={[
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
              ]}
              onChange={(value) => setStyle("alignment", value)}
            />

            <OptionGroup
              label="Width"
              value={style.width}
              options={[
                { label: "Full", value: "full" },
                { label: "Compact", value: "compact" },
              ]}
              onChange={(value) => setStyle("width", value)}
            />

            <OptionGroup
              label="Padding"
              value={style.padding}
              options={[
                { label: "Compact", value: "compact" },
                { label: "Normal", value: "normal" },
                { label: "Spacious", value: "spacious" },
              ]}
              onChange={(value) => setStyle("padding", value)}
            />

            <OptionGroup
              label="Background"
              value={style.backgroundStyle}
              options={[
                { label: "None", value: "none" },
                { label: "Glass", value: "glass" },
                { label: "Solid", value: "solid" },
                { label: "Gradient", value: "gradient" },
              ]}
              onChange={(value) => setStyle("backgroundStyle", value)}
            />

            <OptionGroup
              label="Radius"
              value={style.radius}
              options={[
                { label: "Soft", value: "soft" },
                { label: "Rounded", value: "rounded" },
                { label: "Pill", value: "pill" },
                { label: "Square", value: "square" },
              ]}
              onChange={(value) => setStyle("radius", value)}
            />

            <OptionGroup
              label="Shadow"
              value={style.shadow}
              options={[
                { label: "None", value: "none" },
                { label: "Soft", value: "soft" },
                { label: "Glow", value: "glow" },
              ]}
              onChange={(value) => setStyle("shadow", value)}
            />

            <OptionGroup
              label="Accent"
              value={style.accent}
              options={[
                { label: "Default", value: "default" },
                { label: "Primary", value: "primary" },
                { label: "Secondary", value: "secondary" },
              ]}
              onChange={(value) => setStyle("accent", value)}
            />
          </Section>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-4">
          <Section title="Visibility" description="Control whether this block appears on your public XIONID profile.">
            <button
              type="button"
              onClick={() => onChange({ is_visible: !block.is_visible })}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                block.is_visible ? "border-primary/40 bg-primary/10" : "border-border/60 bg-background/40",
              )}
            >
              <div>
                <div className="text-sm font-medium">
                  {block.is_visible ? "Visible on public profile" : "Hidden from public profile"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {block.is_visible ? "Visitors can see this block." : "Only you can see this block inside the editor."}
                </p>
              </div>

              {block.is_visible ? (
                <Eye className="h-5 w-5 text-primary" />
              ) : (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </Section>

          <Section
            title="Privacy note"
            description="For wallet, badge, and tip-history blocks, XIONID should always default toward proof without overexposure."
          >
            <p className="text-xs leading-relaxed text-muted-foreground">
              Later, wallet address, badge visibility, and supporter history should have separate user-controlled
              visibility settings.
            </p>
          </Section>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Section title="Block metadata" description="Developer and debugging details for this block.">
            <Field label="Block type">
              <Input value={block.type} readOnly className="font-mono text-xs" />
            </Field>

            <Field label="Block ID">
              <div className="flex gap-2">
                <Input value={block.id} readOnly className="font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copyBlockId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </Field>

            <Field label="Position">
              <Input value={String(block.position)} readOnly className="font-mono text-xs" />
            </Field>
          </Section>

          <Section title="Validation" description="This helps prevent incomplete public blocks.">
            {issueSummary.errors === 0 && issueSummary.warnings === 0 ? (
              <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" />
                This block is ready.
              </div>
            ) : (
              <div className="space-y-2">
                {firstError ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <div className="font-medium">Error</div>
                    <p className="mt-1 text-xs leading-relaxed">{firstError.message}</p>
                  </div>
                ) : null}

                {firstWarning ? (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600">
                    <div className="font-medium">Warning</div>
                    <p className="mt-1 text-xs leading-relaxed">{firstWarning.message}</p>
                  </div>
                ) : null}
              </div>
            )}
          </Section>

          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="w-full justify-center text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete block
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
