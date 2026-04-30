import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, Layers, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockRenderer } from "./BlockRenderer";
import type { Block } from "@/lib/blocks";
import type { ProfileTheme } from "@/lib/theme";

type Props = {
  block: Block;
  theme: ProfileTheme;
  selected: boolean;
  onSelect: () => void;

  // Optional studio actions — Editor.tsx can pass these later.
  onDuplicate?: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

const formatBlockType = (type: string) =>
  type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const SortableBlock = ({
  block,
  theme,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: Props) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const blockTypeLabel = useMemo(() => formatBlockType(block.type), [block.type]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stop = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      onClick={onSelect}
      className={cn(
        "relative group/canvas-block cursor-pointer rounded-[1.4rem] transition-all duration-200",
        "border border-transparent",
        "hover:border-primary/30 hover:bg-background/20",
        selected && "border-primary/60 bg-primary/5 shadow-lg shadow-primary/10",
        selected && "ring-2 ring-primary/45 ring-offset-2 ring-offset-background",
        isDragging && "z-50 scale-[0.985] opacity-80 shadow-2xl shadow-primary/20",
        !block.is_visible && "opacity-55",
      )}
    >
      {/* Selected block label */}
      <div
        className={cn(
          "pointer-events-none absolute -top-3 left-4 z-20 hidden items-center gap-1.5 rounded-full",
          "border border-primary/30 bg-background/90 px-2.5 py-1 text-[10px] font-medium",
          "text-primary shadow-sm backdrop-blur-md",
          selected && "flex",
        )}
      >
        <Layers className="h-3 w-3" />
        {blockTypeLabel}
      </div>

      {/* Floating toolbar */}
      <div
        className={cn(
          "absolute -right-2 -top-3 z-30 hidden items-center gap-1 rounded-full",
          "border border-border/60 bg-background/90 p-1 shadow-xl backdrop-blur-md",
          "group-hover/canvas-block:flex",
          selected && "flex",
        )}
        onClick={stop}
      >
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground active:cursor-grabbing",
          )}
          aria-label="Drag block"
          title="Drag block"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        {onMoveUp && (
          <button
            type="button"
            onClick={(event) => {
              stop(event);
              if (canMoveUp) onMoveUp();
            }}
            disabled={!canMoveUp}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
            )}
            aria-label="Move block up"
            title="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            onClick={(event) => {
              stop(event);
              if (canMoveDown) onMoveDown();
            }}
            disabled={!canMoveDown}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
            )}
            aria-label="Move block down"
            title="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        )}

        {onDuplicate && (
          <button
            type="button"
            onClick={(event) => {
              stop(event);
              onDuplicate();
            }}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
            )}
            aria-label="Duplicate block"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}

        {onToggleVisibility && (
          <button
            type="button"
            onClick={(event) => {
              stop(event);
              onToggleVisibility();
            }}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
            )}
            aria-label={block.is_visible ? "Hide block" : "Show block"}
            title={block.is_visible ? "Hide" : "Show"}
          >
            {block.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(event) => {
              stop(event);
              onDelete();
            }}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors",
              "hover:bg-destructive/10 hover:text-destructive",
            )}
            aria-label="Delete block"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Hidden state badge */}
      {!block.is_visible && (
        <div
          className={cn(
            "absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full",
            "border border-border/60 bg-background/90 px-2.5 py-1 text-[10px]",
            "font-medium text-muted-foreground shadow-sm backdrop-blur-md",
          )}
        >
          <EyeOff className="h-3 w-3" />
          Hidden
        </div>
      )}

      {/* Selection glow background */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[1.4rem] opacity-0 transition-opacity",
          "bg-gradient-to-br from-primary/10 via-transparent to-secondary/10",
          selected && "opacity-100",
        )}
      />

      {/* Actual block preview */}
      <div className="relative z-10 rounded-[1.4rem] p-1">
        <BlockRenderer block={block} theme={theme} />
      </div>
    </div>
  );
};
