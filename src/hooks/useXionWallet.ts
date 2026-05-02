import { useEffect, useRef } from "react";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
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
  const { data, isConnected, isConnecting, login, logout } = useAbstraxionAccount();
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

  const connect = async () => {
    // Abstraxion opens a popup that's blocked when running inside an iframe
    // (Lovable preview). Detect & guide instead of silently failing.
    if (typeof window !== "undefined" && window.top !== window.self) {
      toast.error("Open in a new tab to connect", {
        description:
          "Wallet popups are blocked inside the preview iframe. Open the preview in its own tab and try again.",
      });
      return;
    }
    try {
      await login();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isAppDetails =
        /application details|treasury|grant|contract/i.test(msg) ||
        /unable to load/i.test(msg);
      toast.error(isAppDetails ? "XION treasury not reachable" : "Connect failed", {
        description: isAppDetails
          ? "Check that VITE_XION_TREASURY points to a contract on xion-testnet-2 (create one at dashboard.burnt.com)."
          : msg || "Try again",
      });
    }
  };

  const disconnect = async () => {
    try {
      await logout();
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
