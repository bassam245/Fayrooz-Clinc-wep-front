import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useListAppointments, useListNotifications, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Bell, CheckCircle2, XCircle, AlertCircle, Plus } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800", icon: AlertCircle },
  confirmed: { label: "Confirmed", color: "bg-teal-100 text-teal-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-700", icon: CheckCircle2 },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data: appointments } = useListAppointments({ status: undefined });
  const { data: notifications } = useListNotifications({ unreadOnly: true });

  const apts = Array.isArray(appointments) ? appointments : [];
  const upcoming = apts.filter((a) => ["pending", "confirmed"].includes(a.status)).slice(0, 3);
  const unread = Array.isArray(notifications) ? notifications.length : 0;

  const counts = {
    total: apts.length,
    confirmed: apts.filter((a) => a.status === "confirmed").length,
    pending: apts.filter((a) => a.status === "pending").length,
    cancelled: apts.filter((a) => a.status === "cancelled").length,
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good morning, {user?.name?.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
          <Link href="/patient/book">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Book Appointment</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: counts.total, color: "text-foreground" },
            { label: "Confirmed", value: counts.confirmed, color: "text-teal-600" },
            { label: "Pending", value: counts.pending, color: "text-amber-600" },
            { label: "Cancelled", value: counts.cancelled, color: "text-red-500" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming appointments */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Upcoming Appointments</h2>
              <Link href="/patient/appointments">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <Link href="/patient/book">
                    <Button size="sm" className="mt-4">Book your first appointment</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : upcoming.map((apt) => {
              const cfg = statusConfig[apt.status as keyof typeof statusConfig];
              return (
                <Card key={apt.id} className="border-l-4 border-l-primary">
                  <CardContent className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{apt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{apt.specialtyName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(apt.scheduledAt), "MMM d, yyyy")}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(apt.scheduledAt), "h:mm a")}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${cfg.color}`}>{cfg.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                Notifications
                {unread > 0 && <Badge variant="destructive" className="h-4 px-1 text-[10px]">{unread}</Badge>}
              </h2>
              <Link href="/patient/notifications">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </div>
            {unread === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Bell className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No new notifications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {(Array.isArray(notifications) ? notifications : []).slice(0, 5).map((n: any) => (
                  <Card key={n.id} className="border-l-4 border-l-amber-400">
                    <CardContent className="py-3">
                      <p className="text-xs font-semibold">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.createdAt), "MMM d, h:mm a")}</p>
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
