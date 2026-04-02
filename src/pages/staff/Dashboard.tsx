import { Link } from "wouter";
import { useListAppointments, useConfirmAppointment, useCancelAppointment, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function StaffDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: allApts } = useListAppointments({});
  const { data: pendingApts } = useListAppointments({ status: "pending" });
  const { data: confirmedApts } = useListAppointments({ status: "confirmed" });
  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();

  const all = Array.isArray(allApts) ? allApts : [];
  const pending = Array.isArray(pendingApts) ? pendingApts : [];
  const confirmed = Array.isArray(confirmedApts) ? confirmedApts : [];
  const todayApts = confirmed.filter((a: any) => isToday(new Date(a.scheduledAt)));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });

  const handleConfirm = async (id: number) => {
    await confirmMutation.mutateAsync({ id });
    await invalidate();
    toast({ title: "Appointment confirmed" });
  };

  const handleReject = async (id: number) => {
    await cancelMutation.mutateAsync({ id, data: { reason: "Rejected by staff" } });
    await invalidate();
    toast({ title: "Appointment rejected" });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: all.length, color: "text-foreground" },
            { label: "Pending Review", value: pending.length, color: "text-amber-600" },
            { label: "Confirmed", value: confirmed.length, color: "text-teal-600" },
            { label: "Today", value: todayApts.length, color: "text-blue-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending review */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                Pending Review
                {pending.length > 0 && <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">{pending.length}</span>}
              </h2>
              <Link href="/staff/appointments"><Button variant="ghost" size="sm" className="text-xs">View all</Button></Link>
            </div>
            {pending.length === 0 ? (
              <Card><CardContent className="py-8 text-center"><AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No pending requests</p></CardContent></Card>
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 5).map((apt: any) => (
                  <Card key={apt.id} className="border-l-4 border-l-amber-400">
                    <CardContent className="py-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{apt.patientName}</p>
                          <p className="text-xs text-muted-foreground">{apt.doctorName} · {apt.specialtyName}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(apt.scheduledAt), "MMM d, yyyy — h:mm a")}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1 h-7 text-xs" onClick={() => handleConfirm(apt.id)} disabled={confirmMutation.isPending}>
                          <CheckCircle className="w-3 h-3" /> Confirm
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 h-7 text-xs text-red-500 border-red-200" onClick={() => handleReject(apt.id)} disabled={cancelMutation.isPending}>
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Today's schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Today's Appointments</h2>
              <Link href="/staff/schedule"><Button variant="ghost" size="sm" className="text-xs">Schedule</Button></Link>
            </div>
            {todayApts.length === 0 ? (
              <Card><CardContent className="py-8 text-center"><Calendar className="w-6 h-6 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">Nothing scheduled for today</p></CardContent></Card>
            ) : (
              <div className="space-y-2">
                {todayApts.slice(0, 6).map((apt: any) => (
                  <Card key={apt.id} className="border-l-4 border-l-teal-500">
                    <CardContent className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{apt.patientName}</p>
                        <p className="text-xs text-muted-foreground">{apt.doctorName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">{format(new Date(apt.scheduledAt), "h:mm a")}</p>
                        <p className="text-xs text-muted-foreground">{apt.specialtyName}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
