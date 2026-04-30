import { useEffect, useRef } from "react";
import {
  useAbstraxionAccount,
  useModal,
} from "@burnt-labs/abstraxion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Unified XION wallet hook.
 * - Exposes connection state + connect/disconnect.
 * - Auto-syncs the wallet address to the signed-in user's profile.
 */
export const useXionWallet = () => {
  const { user } = useAuth();
  const { data, isConnected, isConnecting, logout } = useAbstraxionAccount();
  const [, setShowModal] = useModal();
  const lastSyncedRef = useRef<string | null>(null);

  const address: string | undefined = data?.bech32Address;

  // Sync to profile whenever a fresh address appears.
  useEffect(() => {
    if (!user || !address) return;
    if (lastSyncedRef.current === address) return;
    lastSyncedRef.current = address;

    (async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          xion_address: address,
          wallet_connected_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (error) {
        // Unique conflict = same address linked to another profile.
        if (error.code === "23505") {
          toast.error("Wallet already linked", {
            description: "This XION address is connected to another XionID account.",
          });
        } else {
          toast.error("Couldn't save wallet", { description: error.message });
        }
        lastSyncedRef.current = null;
      } else {
        toast.success("Wallet connected ⚡", {
          description: "Your XION address is now on your profile.",
        });
      }
    })();
  }, [address, user]);

  const connect = () => setShowModal(true);

  const disconnect = async () => {
    try {
      await logout?.();
      lastSyncedRef.current = null;
      toast.success("Wallet disconnected");
    } catch (err) {
      toast.error("Disconnect failed", {
        description: err instanceof Error ? err.message : "Try again",
      });
    }
  };

  return {
    address,
    isConnected: Boolean(isConnected && address),
    isConnecting: Boolean(isConnecting),
    connect,
    disconnect,
  };
};
