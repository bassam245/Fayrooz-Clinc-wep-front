import { useState } from "react";
import {
  useListAppointments, useCancelAppointment, useUpdateAppointment,
  getListAppointmentsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, XCircle, AlertCircle, CheckCircle2, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmed", cls: "bg-teal-100 text-teal-800 border-teal-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-800 border-red-200" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-700 border-gray-200" },
};

const filters = ["all", "pending", "confirmed", "cancelled", "completed"] as const;

export default function PatientAppointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [cancelReason, setCancelReason] = useState("");

  const params = filter === "all" ? {} : { status: filter as any };
  const { data: appointments, isLoading } = useListAppointments(params);
  const cancelMutation = useCancelAppointment();

  const apts = Array.isArray(appointments) ? appointments : [];

  const handleCancel = async () => {
    if (!cancelDialog.id) return;
    try {
      await cancelMutation.mutateAsync({ id: cancelDialog.id, data: { reason: cancelReason || null } });
      await queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      toast({ title: "Appointment cancelled" });
      setCancelDialog({ open: false, id: null });
      setCancelReason("");
    } catch {
      toast({ title: "Error", description: "Could not cancel appointment", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all your appointments</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all",
                filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : apts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No appointments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {apts.map((apt: any) => {
              const cfg = statusConfig[apt.status as keyof typeof statusConfig];
              const canCancel = ["pending", "confirmed"].includes(apt.status);
              return (
                <Card key={apt.id} className={cn("border-l-4", apt.status === "confirmed" ? "border-l-teal-500" : apt.status === "pending" ? "border-l-amber-500" : apt.status === "cancelled" ? "border-l-red-400" : "border-l-gray-300")}>
                  <CardContent className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{apt.doctorName}</p>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", cfg.cls)}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{apt.specialtyName}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(apt.scheduledAt), "EEE, MMM d yyyy")}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(apt.scheduledAt), "h:mm a")}</span>
                      </div>
                      {apt.notes && <p className="text-xs text-muted-foreground italic">"{apt.notes}"</p>}
                      {apt.cancellationReason && <p className="text-xs text-red-500">Reason: {apt.cancellationReason}</p>}
                    </div>
                    {canCancel && (
                      <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 shrink-0"
                        onClick={() => setCancelDialog({ open: true, id: apt.id })}>
                        Cancel
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={cancelDialog.open} onOpenChange={(o) => !o && setCancelDialog({ open: false, id: null })}>
          <DialogContent>
            <DialogHeader><DialogTitle>Cancel Appointment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Label>Reason (optional)</Label>
              <Textarea placeholder="Why are you cancelling?" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialog({ open: false, id: null })}>Keep appointment</Button>
              <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>Cancel appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
