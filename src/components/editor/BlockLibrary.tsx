import { Plus } from "lucide-react";
import { BLOCK_LIBRARY, CATEGORY_LABELS, type BlockMeta } from "@/lib/blocks";

type Props = { onAdd: (meta: BlockMeta) => void };

export const BlockLibrary = ({ onAdd }: Props) => {
  const grouped = (Object.keys(CATEGORY_LABELS) as BlockMeta["category"][]).map((cat) => ({
    cat,
    items: BLOCK_LIBRARY.filter((b) => b.category === cat),
  }));

  return (
    <div className="space-y-6">
      {grouped.map(({ cat, items }) => (
        <div key={cat}>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {CATEGORY_LABELS[cat]}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {items.map((b) => (
              <button
                key={b.type}
                onClick={() => onAdd(b)}
                className="glass rounded-xl p-3 text-left group hover:border-primary/50 hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <b.icon className="h-4 w-4 text-primary" />
                  <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </div>
                <div className="text-sm font-medium leading-tight">{b.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">
                  {b.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
