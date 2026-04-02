import { useState } from "react";
import { useGetWeeklySchedule, useListDoctors, getGetWeeklyScheduleQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { cn } from "@/lib/utils";

const slotColors = {
  free: "bg-teal-50 border-teal-200 text-teal-700",
  pending: "bg-amber-50 border-amber-300 text-amber-800 font-semibold",
  booked: "bg-slate-700 border-slate-800 text-white font-semibold",
  completed: "bg-green-50 border-green-200 text-green-700",
  cancelled: "bg-red-50 border-red-200 text-red-600 line-through",
};

export default function StaffSchedule() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [doctorId, setDoctorId] = useState<string>("all");

  const { data: doctors } = useListDoctors({});
  const params: any = { weekStart: format(weekStart, "yyyy-MM-dd") };
  if (doctorId !== "all") params.doctorId = parseInt(doctorId);

  const { data: schedule, isLoading } = useGetWeeklySchedule(params, {
    query: { queryKey: getGetWeeklyScheduleQueryKey(params) }
  });

  const days = Array.isArray(schedule) ? schedule : [];
  const weekEnd = addWeeks(weekStart, 1);

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Weekly Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">View all appointment slots for the week</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {format(weekStart, "MMM d")} — {format(addWeeks(weekStart, 1), "MMM d, yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All doctors</SelectItem>
              {(Array.isArray(doctors) ? doctors : []).map((d: any) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Today</Button>
        </div>

        {/* Legend */}
        <div className="flex gap-3 flex-wrap text-xs">
          {Object.entries(slotColors).map(([status, cls]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded border", cls)} />
              <span className="capitalize text-muted-foreground">{status}</span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading schedule...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2 min-w-0">
            {days.map((day: any) => {
              const date = new Date(day.date);
              const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <div key={day.date} className="space-y-2">
                  <div className={cn("text-center py-2 rounded-lg", isToday ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <p className="text-[10px] font-medium">{format(date, "EEE")}</p>
                    <p className="text-sm font-bold">{format(date, "d")}</p>
                  </div>
                  <div className="space-y-1">
                    {day.slots.length === 0 ? (
                      <p className="text-[10px] text-center text-muted-foreground py-2">Off</p>
                    ) : (
                      day.slots.map((slot: any, i: number) => (
                        <div
                          key={i}
                          className={cn("rounded border px-1.5 py-1 text-[10px] cursor-pointer transition-all hover:opacity-80", slotColors[slot.status as keyof typeof slotColors] ?? "bg-gray-50 border-gray-200")}
                          title={slot.patientName ? `${slot.patientName} — ${slot.status}` : slot.status}
                        >
                          <p className="font-medium">{format(new Date(slot.startTime), "h:mm")}</p>
                          {slot.patientName && <p className="truncate opacity-80">{slot.patientName}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
