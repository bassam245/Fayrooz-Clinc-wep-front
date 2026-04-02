import { useState } from "react";
import { useListAuditLog, getListAuditLogQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const actionColors: Record<string, string> = {
  LOGIN: "bg-blue-100 text-blue-700",
  LOGOUT: "bg-gray-100 text-gray-600",
  CREATE_APPOINTMENT: "bg-teal-100 text-teal-700",
  CONFIRM_APPOINTMENT: "bg-green-100 text-green-700",
  CANCEL_APPOINTMENT: "bg-red-100 text-red-700",
  COMPLETE_APPOINTMENT: "bg-purple-100 text-purple-700",
  UPDATE_APPOINTMENT: "bg-amber-100 text-amber-700",
  CREATE_USER: "bg-indigo-100 text-indigo-700",
  UPDATE_USER: "bg-amber-100 text-amber-700",
  DELETE_USER: "bg-red-100 text-red-700",
};

export default function AdminAuditLog() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const params: any = { limit, offset: page * limit };
  if (search) params.action = search.toUpperCase();

  const { data: auditData, isLoading } = useListAuditLog(params);
  const data = auditData as any;
  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;

  return (
    <Layout>
      <div className="p-6 max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" />Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total entries — all system activity</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Filter by action..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No audit log entries</p></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {entries.map((e: any) => (
              <Card key={e.id}>
                <CardContent className="py-3 flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", actionColors[e.action] ?? "bg-gray-100 text-gray-600")}>{e.action}</span>
                      <span className="text-xs text-muted-foreground">{e.entity}{e.entityId ? ` #${e.entityId}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {e.userName && <span className="font-medium text-foreground">{e.userName}</span>}
                      {e.userRole && <span className="capitalize">({e.userRole})</span>}
                      {e.details && <span>— {e.details}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">{format(new Date(e.createdAt), "MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(e.createdAt), "h:mm:ss a")}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
