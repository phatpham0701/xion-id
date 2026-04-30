import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockRenderer } from "./BlockRenderer";
import type { Block } from "@/lib/blocks";
import type { ProfileTheme } from "@/lib/theme";

type Props = {
  block: Block;
  theme: ProfileTheme;
  selected: boolean;
  onSelect: () => void;
};

export const SortableBlock = ({ block, theme, selected, onSelect }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      onClick={onSelect}
      className={cn(
        "relative group rounded-2xl transition-all cursor-pointer",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        !block.is_visible && "opacity-50",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute -left-7 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md grid place-items-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted transition-all cursor-grab active:cursor-grabbing"
        aria-label="Drag handle"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {!block.is_visible && (
        <div className="absolute -right-7 top-1/2 -translate-y-1/2 text-muted-foreground">
          <EyeOff className="h-3.5 w-3.5" />
        </div>
      )}
      <BlockRenderer block={block} theme={theme} />
    </div>
  );
};
