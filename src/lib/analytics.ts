import { supabase } from "@/integrations/supabase/client";

type EventType = "profile_view" | "block_click" | "tip_sent" | "wallet_connect";

export const trackEvent = async (
  profileId: string,
  eventType: EventType,
  blockId?: string,
) => {
  try {
    await supabase.from("analytics_events").insert([{
      profile_id: profileId,
      event_type: eventType,
      block_id: blockId ?? null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    }]);
  } catch {
    // silent — analytics must never break user-facing flows
  }
};
