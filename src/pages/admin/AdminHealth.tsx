import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/lib/admin";
import { getDemoState } from "@/lib/demoMode";
import { supabase } from "@/integrations/supabase/client";

type Check = { key: string; label: string; ok: boolean; detail?: string };

const StatusCard = ({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) => (
  <Card className={`p-4 border ${ok ? "border-emerald-500/50" : "border-red-500/50"}`}>
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {detail && <div className="text-xs text-muted-foreground mt-1 break-all">{detail}</div>}
      </div>
      <Badge variant={ok ? "default" : "destructive"}>{ok ? "OK" : "FAIL"}</Badge>
    </div>
  </Card>
);

const AdminHealth = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [checks, setChecks] = useState<Check[]>([]);

  useEffect(() => {
    (async () => {
      const profilesRes = await supabase.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
      const rolesRes = await supabase.from("user_roles").select("user_id", { head: true, count: "exact" }).limit(1);
      const auditInsert = await supabase
        .from("admin_audit_logs")
        .insert({
          action: "health.check",
          actor_id: user?.id ?? null,
          actor_email: user?.email ?? null,
          target_type: "system",
          target_id: `health-${Date.now()}`,
          details: { source: "admin.health" } as never,
        } as never)
        .select("id")
        .maybeSingle();

      const demoState = getDemoState();

      setChecks([
        { key: "profiles", label: "profiles table readable", ok: !profilesRes.error, detail: profilesRes.error?.message },
        { key: "roles", label: "user_roles table readable", ok: !rolesRes.error, detail: rolesRes.error?.message },
        { key: "audit", label: "admin_audit_logs writable", ok: !auditInsert.error, detail: auditInsert.error?.message },
        { key: "demo", label: "demo state available", ok: !!demoState?.version, detail: `version=${demoState?.version ?? "n/a"}` },
      ]);
    })();
  }, [user?.email, user?.id]);

  return (
    <AdminLayout title="Health" description="Quick checks for admin access, data access, and local demo capabilities.">
      <div className="grid gap-3 md:grid-cols-2">
        <StatusCard label="current signed-in email" ok={!!user?.email} detail={user?.email ?? "No signed-in email"} />
        <StatusCard label="current user id" ok={!!user?.id} detail={user?.id ?? "No user id"} />
        <StatusCard label="isAdmin result" ok={isAdmin} detail={isAdmin ? "User is admin" : "User is not admin"} />
        {checks.map((c) => (
          <StatusCard key={c.key} label={c.label} ok={c.ok} detail={c.detail} />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Note: the writable audit check intentionally creates one health-check audit row each time this page runs.
      </p>
    </AdminLayout>
  );
};

export default AdminHealth;
