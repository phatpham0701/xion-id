import { useMemo } from "react";
import type { Block } from "@/lib/blocks";
import { BlockRenderer } from "@/components/editor/BlockRenderer";
import { themeStyleVars, BACKGROUNDS, FONTS } from "@/lib/theme";
import type { ProfileTemplate } from "@/lib/templates";

/**
 * Renders a faithful, scaled-down preview of a template using the real
 * BlockRenderer + theme tokens. Used in template gallery cards.
 */
export const TemplatePreview = ({ template, scale = 0.42 }: { template: ProfileTemplate; scale?: number }) => {
  const style = useMemo(() => themeStyleVars(template.theme), [template.theme]);

  // Convert template blocks → Block[] with synthetic ids.
  const blocks: Block[] = template.blocks.slice(0, 6).map((b, i) => ({
    id: `tpl-${i}`,
    profile_id: "tpl",
    type: b.type,
    position: i,
    config: b.config,
    is_visible: true,
  }));

  return (
    <div
      className="relative w-full aspect-[9/14] overflow-hidden rounded-t-2xl"
      style={{ ...style, background: BACKGROUNDS[template.theme.background].css }}
    >
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `scale(${scale})`,
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
          fontFamily: FONTS[template.theme.font].family,
        }}
      >
        <div className="px-6 pt-8 pb-4 max-w-md mx-auto space-y-3 text-foreground">
          {blocks.map((b) => (
            <BlockRenderer key={b.id} block={b} theme={template.theme} />
          ))}
        </div>
      </div>
      {/* Soft fade at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  );
};
