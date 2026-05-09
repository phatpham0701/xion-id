import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, IdCard, Award, Gift, Megaphone, ScrollText, ArrowRight } from "lucide-react";

type Stats = {
  users: number;
  profiles: number;
  badges: number;
  rewardsClaimed: number;
  campaigns: number;
};

type AuditRow = {
  id: string;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
};

const Stat = ({ label, value, icon: Icon, to }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; to: string }) => (
  <Link to={to} className="group">
    <Card className="p-5 transition hover:shadow-md hover:border-primary/40">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  </Link>
);

const AdminHome = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<AuditRow[]>([]);

  useEffect(() => {
    (async () => {
      const [profiles, badges, tipsClaim, audit] = await Promise.all([
        supabase.from("profiles").select("id, is_published", { count: "exact", head: false }),
        supabase.from("wallet_badges").select("id", { count: "exact", head: true }),
        supabase.from("tips").select("id", { count: "exact", head: true }),
        supabase
          .from("admin_audit_logs")
          .select("id, actor_email, action, target_type, target_id, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      setStats({
        users: profiles.count ?? 0,
        profiles: profiles.data?.filter((p: { is_published?: boolean | null }) => p.is_published).length ?? 0,
        badges: badges.count ?? 0,
        rewardsClaimed: tipsClaim.count ?? 0,
        campaigns: 0,
      });
      setRecent((audit.data as AuditRow[]) ?? []);
    })();
  }, []);

  return (
    <AdminLayout title="Overview" description="A calm command center for XIONID operations.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Stat label="Total accounts" value={stats?.users ?? "…"} icon={Users} to="/admin/users" />
        <Stat label="Published profiles" value={stats?.profiles ?? "…"} icon={IdCard} to="/admin/profiles" />
        <Stat label="Badges issued" value={stats?.badges ?? "…"} icon={Award} to="/admin/badges" />
        <Stat label="Rewards / tips" value={stats?.rewardsClaimed ?? "…"} icon={Gift} to="/admin/rewards" />
        <Stat label="Campaigns" value={stats?.campaigns ?? "…"} icon={Megaphone} to="/admin/campaigns" />
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-3 flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Recent admin activity</h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admin activity yet.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <div className="font-medium">{r.action}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.actor_email ?? "unknown"} · {r.target_type ?? "—"} {r.target_id ? `· ${r.target_id.slice(0, 8)}` : ""}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminLayout>
  );
};

export default AdminHome;
