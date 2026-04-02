import { useGetAnalyticsSummary, useGetAppointmentsBySpecialty, useGetAppointmentsOverTime } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { Users, Calendar, CheckCircle2, XCircle, AlertCircle, Stethoscope, BookOpen, Clock } from "lucide-react";

const COLORS = ["#0d9488", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981"];

export default function AdminDashboard() {
  const { data: summary } = useGetAnalyticsSummary();
  const { data: bySpecialty } = useGetAppointmentsBySpecialty({ period: "month" });
  const { data: overTime } = useGetAppointmentsOverTime({ period: "month" });

  const stats = summary as any;
  const specialtyData = Array.isArray(bySpecialty) ? bySpecialty : [];
  const timeData = Array.isArray(overTime) ? overTime : [];

  const metricCards = stats ? [
    { label: "Total Appointments", value: stats.totalAppointments, icon: Calendar, color: "text-blue-600" },
    { label: "Pending", value: stats.pendingAppointments, icon: AlertCircle, color: "text-amber-600" },
    { label: "Confirmed", value: stats.confirmedAppointments, icon: CheckCircle2, color: "text-teal-600" },
    { label: "Cancelled", value: stats.cancelledAppointments, icon: XCircle, color: "text-red-500" },
    { label: "Completed", value: stats.completedAppointments, icon: CheckCircle2, color: "text-green-600" },
    { label: "Total Patients", value: stats.totalPatients, icon: Users, color: "text-purple-600" },
    { label: "Total Doctors", value: stats.totalDoctors, icon: Stethoscope, color: "text-indigo-600" },
    { label: "Today", value: stats.todayAppointments, icon: Clock, color: "text-orange-600" },
  ] : [];

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Full system overview and analytics</p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metricCards.map((m) => (
            <Card key={m.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
                <p className={`text-2xl font-bold ${m.color}`}>{m.value ?? "—"}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments over time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Appointments Over Time (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              {timeData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="confirmed" stackId="1" stroke="#0d9488" fill="#ccfbf1" name="Confirmed" />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#fef9c3" name="Pending" />
                    <Area type="monotone" dataKey="cancelled" stackId="1" stroke="#ef4444" fill="#fee2e2" name="Cancelled" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* By specialty */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Appointments by Specialty</CardTitle>
            </CardHeader>
            <CardContent>
              {specialtyData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={specialtyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="specialtyName" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" name="Appointments" radius={[0, 4, 4, 0]}>
                      {specialtyData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color ?? COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
