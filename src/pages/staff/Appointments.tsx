import { useState } from "react";
import {
  useListAppointments, useConfirmAppointment, useCancelAppointment, useCompleteAppointment,
  getListAppointmentsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, XCircle, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmed", cls: "bg-teal-100 text-teal-800" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-700" },
};

const filters = ["all", "pending", "confirmed", "cancelled", "completed"] as const;

export default function StaffAppointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const params = filter === "all" ? {} : { status: filter as any };
  const { data: appointments, isLoading } = useListAppointments(params);
  const confirmM = useConfirmAppointment();
  const cancelM = useCancelAppointment();
  const completeM = useCompleteAppointment();

  const apts = Array.isArray(appointments) ? appointments : [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });

  const handleConfirm = async (id: number) => { await confirmM.mutateAsync({ id }); await invalidate(); toast({ title: "Confirmed" }); };
  const handleCancel = async (id: number) => { await cancelM.mutateAsync({ id, data: { reason: "Cancelled by staff" } }); await invalidate(); toast({ title: "Cancelled" }); };
  const handleComplete = async (id: number) => { await completeM.mutateAsync({ id }); await invalidate(); toast({ title: "Marked as completed" }); };

  return (
    <Layout>
      <div className="p-6 max-w-5xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage all appointments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all",
                filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"
              )}>
              {f}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : apts.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No appointments found</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {apts.map((apt: any) => {
              const cfg = statusConfig[apt.status as keyof typeof statusConfig];
              return (
                <Card key={apt.id} className={cn("border-l-4", apt.status === "confirmed" ? "border-l-teal-500" : apt.status === "pending" ? "border-l-amber-500" : apt.status === "cancelled" ? "border-l-red-400" : "border-l-gray-300")}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{apt.patientName}</p>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", cfg.cls)}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{apt.doctorName} · {apt.specialtyName}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(apt.scheduledAt), "EEE, MMM d yyyy")}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(apt.scheduledAt), "h:mm a")}</span>
                        </div>
                        {apt.notes && <p className="text-xs text-muted-foreground italic">"{apt.notes}"</p>}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {apt.status === "pending" && (
                          <>
                            <Button size="sm" className="gap-1 h-7 text-xs" onClick={() => handleConfirm(apt.id)} disabled={confirmM.isPending}><CheckCircle className="w-3 h-3" />Confirm</Button>
                            <Button size="sm" variant="outline" className="gap-1 h-7 text-xs text-red-500 border-red-200" onClick={() => handleCancel(apt.id)} disabled={cancelM.isPending}><XCircle className="w-3 h-3" />Reject</Button>
                          </>
                        )}
                        {apt.status === "confirmed" && (
                          <>
                            <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => handleComplete(apt.id)} disabled={completeM.isPending}><CheckSquare className="w-3 h-3" />Complete</Button>
                            <Button size="sm" variant="outline" className="gap-1 h-7 text-xs text-red-500 border-red-200" onClick={() => handleCancel(apt.id)} disabled={cancelM.isPending}><XCircle className="w-3 h-3" />Cancel</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
