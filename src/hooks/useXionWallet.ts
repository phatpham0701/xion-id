import { useEffect, useRef } from "react";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getXionConfigError } from "@/lib/xion";

/**
 * Unified XION wallet hook.
 * - Wraps Abstraxion's useAbstraxionAccount.
 * - Handles `?granted=true` redirect-back from the Auth app.
 * - Syncs the connected address onto the signed-in user's profile.
 */
export const useXionWallet = () => {
  const { user } = useAuth();
  const account = useAbstraxionAccount() as {
    data?: { bech32Address?: string };
    isConnected?: boolean;
    isConnecting?: boolean;
    isLoading?: boolean;
    login: () => Promise<void> | void;
    logout: () => Promise<void> | void;
  };

  const { data, login, logout } = account;
  const address = data?.bech32Address;
  const isConnecting = Boolean(account.isConnecting ?? account.isLoading);
  const isConnected = Boolean((account.isConnected ?? Boolean(address)) && address);

  const lastSyncedRef = useRef<string | null>(null);

  // Handle redirect back from XION Auth app: ?granted=true
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("granted") === "true" && !data?.bech32Address) {
      void login();
    }
  }, [login, data?.bech32Address]);

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
        if (error.code === "23505") {
          toast.error("Account already linked", {
            description: "This XION address is connected to another XionID account.",
          });
        } else {
          toast.error("Couldn't save account", { description: error.message });
        }
        lastSyncedRef.current = null;
      } else {
        toast.success("Account connected ⚡", {
          description: "Your XION address is now on your profile.",
        });
      }
    })();
  }, [address, user]);

  const connect = async () => {
    const cfgError = getXionConfigError();
    if (cfgError) {
      toast.error("XION not configured", { description: cfgError });
      return;
    }
    if (typeof window !== "undefined" && window.top !== window.self) {
      toast.error("Open in a new tab to connect", {
        description:
          "Sign-in popups are blocked inside the preview iframe. Open the preview in its own tab and try again.",
      });
      return;
    }
    try {
      await login();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Connect failed", { description: msg || "Try again" });
    }
  };

  const disconnect = async () => {
    try {
      await logout();
      lastSyncedRef.current = null;
      toast.success("Account disconnected");
    } catch (err) {
      toast.error("Disconnect failed", {
        description: err instanceof Error ? err.message : "Try again",
      });
    }
  };

  return {
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect,
  };
};
