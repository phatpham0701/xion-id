import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  created_at: string;
};

const AdminAudit = () => {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, []);

  return (
    <AdminLayout title="Audit log" description="Most recent admin actions, newest first.">
      <Card className="p-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b align-top last:border-0">
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{r.actor_email ?? "—"}</td>
                  <td className="px-3 py-2"><Badge variant="outline">{r.action}</Badge></td>
                  <td className="px-3 py-2 text-xs">
                    {r.target_type ?? "—"}
                    {r.target_id ? <div className="text-muted-foreground">{r.target_id.slice(0, 12)}…</div> : null}
                  </td>
                  <td className="px-3 py-2">
                    <pre className="max-w-md overflow-hidden text-ellipsis whitespace-pre-wrap break-words text-xs text-muted-foreground">
                      {JSON.stringify(r.details ?? {}, null, 0)}
                    </pre>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">No actions logged.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default AdminAudit;
