import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListSpecialties, useListDoctors, useGetDoctorAvailableSlots, useCreateAppointment,
  getGetDoctorAvailableSlotsQueryKey, getListAppointmentsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Calendar, Clock, Stethoscope, User } from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const steps = ["Select Specialty", "Select Doctor", "Choose Slot", "Confirm"];

export default function BookAppointment() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const { data: specialties } = useListSpecialties();
  const { data: doctors } = useListDoctors({ specialtyId: selectedSpecialty?.id });
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { data: slots } = useGetDoctorAvailableSlots(
    selectedDoctor?.id ?? 0,
    { date: dateStr },
    { query: { enabled: !!selectedDoctor, queryKey: getGetDoctorAvailableSlotsQueryKey(selectedDoctor?.id ?? 0, { date: dateStr }) } }
  );
  const createAppointment = useCreateAppointment();

  const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

  const handleBook = async () => {
    if (!selectedSlot || !selectedDoctor) return;
    try {
      await createAppointment.mutateAsync({ data: { doctorId: selectedDoctor.id, scheduledAt: selectedSlot.startTime, notes: notes || null } });
      await queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      toast({ title: "Appointment booked!", description: "Your appointment is pending confirmation." });
      navigate("/patient/appointments");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err?.data?.error || "Try a different time slot", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Book Appointment</h1>
          <p className="text-sm text-muted-foreground mt-1">Follow the steps to schedule your visit</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                i < step ? "bg-primary border-primary text-primary-foreground" :
                i === step ? "border-primary text-primary" : "border-muted text-muted-foreground"
              )}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
              {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 0: Specialty */}
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Choose a Specialty</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Array.isArray(specialties) ? specialties : []).map((s: any) => (
                <Card
                  key={s.id}
                  className={cn("cursor-pointer transition-all border-2 hover:border-primary", selectedSpecialty?.id === s.id && "border-primary bg-primary/5")}
                  onClick={() => { setSelectedSpecialty(s); setSelectedDoctor(null); }}
                >
                  <CardContent className="py-4 text-center space-y-1">
                    <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center" style={{ background: s.color + "22" }}>
                      <Stethoscope className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.doctorCount} doctor{s.doctorCount !== 1 ? "s" : ""}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button disabled={!selectedSpecialty} onClick={() => setStep(1)}>Continue</Button>
          </div>
        )}

        {/* Step 1: Doctor */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(0)}>Back</Button>
              <h2 className="font-semibold">Choose a Doctor</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Array.isArray(doctors) ? doctors : []).map((d: any) => (
                <Card
                  key={d.id}
                  className={cn("cursor-pointer transition-all border-2 hover:border-primary", selectedDoctor?.id === d.id && "border-primary bg-primary/5")}
                  onClick={() => setSelectedDoctor(d)}
                >
                  <CardContent className="py-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.specialtyName}</p>
                      {d.experience && <p className="text-xs text-muted-foreground">{d.experience} yrs exp.</p>}
                      <p className="text-xs text-muted-foreground">{d.appointmentDuration} min sessions</p>
                      {d.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.bio}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(Array.isArray(doctors) ? doctors : []).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No doctors available for this specialty.</p>
              )}
            </div>
            <Button disabled={!selectedDoctor} onClick={() => setStep(2)}>Continue</Button>
          </div>
        )}

        {/* Step 2: Date & Slot */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Button>
              <h2 className="font-semibold">Choose Date & Time</h2>
            </div>

            {/* Date picker */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d.toISOString()}
                  onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                  className={cn(
                    "flex flex-col items-center px-3 py-2 rounded-xl border-2 shrink-0 transition-all",
                    format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  )}
                >
                  <span className="text-[10px] font-medium">{format(d, "EEE")}</span>
                  <span className="text-lg font-bold">{format(d, "d")}</span>
                  <span className="text-[10px]">{format(d, "MMM")}</span>
                </button>
              ))}
            </div>

            {/* Slots */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(Array.isArray(slots) ? slots : []).map((slot: any, i: number) => (
                <button
                  key={i}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all",
                    !slot.available ? "opacity-40 cursor-not-allowed border-border text-muted-foreground" :
                    selectedSlot === slot
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary"
                  )}
                >
                  {format(new Date(slot.startTime), "h:mm a")}
                </button>
              ))}
              {(Array.isArray(slots) ? slots : []).length === 0 && (
                <p className="col-span-4 text-sm text-muted-foreground text-center py-6">No slots available on this day.</p>
              )}
            </div>

            <Button disabled={!selectedSlot} onClick={() => setStep(3)}>Continue</Button>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedDoctor && selectedSlot && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Back</Button>
              <h2 className="font-semibold">Confirm Appointment</h2>
            </div>

            <Card>
              <CardContent className="py-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedDoctor.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDoctor.specialtyName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(selectedSlot.startTime), "EEEE, MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(selectedSlot.startTime), "h:mm a")} — {format(new Date(selectedSlot.endTime), "h:mm a")}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe your symptoms or reason for visit..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={handleBook} disabled={createAppointment.isPending}>
              {createAppointment.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
