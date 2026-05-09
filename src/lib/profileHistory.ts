import { supabase } from "@/integrations/supabase/client";

export type ProfileHistoryEvent =
  | "insert"
  | "update"
  | "delete"
  | "restore"
  | "demo_seed";

export type ProfileHistoryRow = {
  id: string;
  profile_id: string;
  actor_id: string | null;
  actor_email: string | null;
  event: ProfileHistoryEvent | string;
  source: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  changed_keys: string[];
  created_at: string;
};

export type DiffEntry = {
  key: string;
  before: unknown;
  after: unknown;
};

// Fields we never want to restore (managed by DB / immutable).
const NON_RESTORABLE = new Set(["id", "user_id", "created_at", "updated_at"]);

export const fetchProfileHistory = async (
  profileId: string,
): Promise<ProfileHistoryRow[]> => {
  const { data, error } = await supabase
    .from("profile_history" as never)
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as unknown as ProfileHistoryRow[]) ?? [];
};

export const computeDiff = (
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  changedKeys?: string[],
): DiffEntry[] => {
  const keys = new Set<string>(changedKeys ?? []);
  if (!keys.size) {
    for (const k of Object.keys(before ?? {})) keys.add(k);
    for (const k of Object.keys(after ?? {})) keys.add(k);
  }
  const out: DiffEntry[] = [];
  for (const k of Array.from(keys).sort()) {
    const a = before?.[k];
    const b = after?.[k];
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    out.push({ key: k, before: a, after: b });
  }
  return out;
};

/** Restore a snapshot of a profile row. Returns the new row. */
export const restoreProfileSnapshot = async (
  profileId: string,
  snapshot: Record<string, unknown>,
) => {
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(snapshot)) {
    if (NON_RESTORABLE.has(k)) continue;
    payload[k] = v;
  }
  const { data, error } = await supabase
    .from("profiles")
    .update(payload as never)
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  return data;
};
