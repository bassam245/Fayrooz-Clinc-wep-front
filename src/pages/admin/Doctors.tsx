import { useState } from "react";
import {
  useListDoctors, useCreateDoctor, useUpdateDoctor,
  useListUsers, useListSpecialties,
  getListDoctorsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDoctors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: doctors } = useListDoctors({});
  const { data: users } = useListUsers({ role: "staff" });
  const { data: specialties } = useListSpecialties();
  const createM = useCreateDoctor();
  const updateM = useUpdateDoctor();
  const [dialog, setDialog] = useState<{ open: boolean; mode: "create" | "edit"; item?: any }>({ open: false, mode: "create" });
  const [form, setForm] = useState({ userId: "", specialtyId: "", bio: "", experience: "", appointmentDuration: "30" });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListDoctorsQueryKey() });

  const openCreate = () => { setForm({ userId: "", specialtyId: "", bio: "", experience: "", appointmentDuration: "30" }); setDialog({ open: true, mode: "create" }); };
  const openEdit = (d: any) => { setForm({ userId: String(d.userId), specialtyId: String(d.specialtyId), bio: d.bio ?? "", experience: String(d.experience ?? ""), appointmentDuration: String(d.appointmentDuration) }); setDialog({ open: true, mode: "edit", item: d }); };

  const handleSubmit = async () => {
    try {
      if (dialog.mode === "create") {
        await createM.mutateAsync({ data: { userId: parseInt(form.userId), specialtyId: parseInt(form.specialtyId), bio: form.bio || null, experience: form.experience ? parseInt(form.experience) : null, appointmentDuration: parseInt(form.appointmentDuration) } });
        toast({ title: "Doctor created" });
      } else {
        await updateM.mutateAsync({ id: dialog.item.id, data: { specialtyId: parseInt(form.specialtyId), bio: form.bio || null, experience: form.experience ? parseInt(form.experience) : null, appointmentDuration: parseInt(form.appointmentDuration) } });
        toast({ title: "Doctor updated" });
      }
      await invalidate();
      setDialog({ open: false, mode: "create" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const list = Array.isArray(doctors) ? doctors : [];
  const staffUsers = Array.isArray(users) ? users : [];
  const specialtyList = Array.isArray(specialties) ? specialties : [];

  return (
    <Layout>
      <div className="p-6 max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Doctors</h1>
            <p className="text-sm text-muted-foreground mt-1">{list.length} registered doctors</p>
          </div>
          <Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" />Add Doctor</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((d: any) => (
            <Card key={d.id}>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.specialtyName}</p>
                    <p className="text-xs text-muted-foreground">{d.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-7 h-7 p-0 shrink-0" onClick={() => openEdit(d)}><Pencil className="w-3.5 h-3.5" /></Button>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{d.appointmentDuration} min</span>
                  {d.experience && <span>{d.experience} yrs exp.</span>}
                </div>
                {d.bio && <p className="text-xs text-muted-foreground line-clamp-2">{d.bio}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialog.open} onOpenChange={(o) => !o && setDialog({ open: false, mode: "create" })}>
          <DialogContent>
            <DialogHeader><DialogTitle>{dialog.mode === "create" ? "Add Doctor" : "Edit Doctor"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {dialog.mode === "create" && (
                <div className="space-y-1.5">
                  <Label>Staff User</Label>
                  <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select staff user" /></SelectTrigger>
                    <SelectContent>{staffUsers.map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Specialty</Label>
                <Select value={form.specialtyId} onValueChange={(v) => setForm({ ...form, specialtyId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                  <SelectContent>{specialtyList.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Session Duration (min)</Label><Input type="number" value={form.appointmentDuration} onChange={(e) => setForm({ ...form, appointmentDuration: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Years of Experience</Label><Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialog({ open: false, mode: "create" })}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createM.isPending || updateM.isPending}>{dialog.mode === "create" ? "Create" : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
