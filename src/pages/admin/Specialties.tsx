import { useState } from "react";
import { useListSpecialties, useCreateSpecialty, useUpdateSpecialty, useDeleteSpecialty, getListSpecialtiesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSpecialties() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: specialties } = useListSpecialties();
  const createM = useCreateSpecialty();
  const updateM = useUpdateSpecialty();
  const deleteM = useDeleteSpecialty();
  const [dialog, setDialog] = useState<{ open: boolean; mode: "create" | "edit"; item?: any }>({ open: false, mode: "create" });
  const [form, setForm] = useState({ name: "", description: "", color: "#0d9488" });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListSpecialtiesQueryKey() });

  const openCreate = () => { setForm({ name: "", description: "", color: "#0d9488" }); setDialog({ open: true, mode: "create" }); };
  const openEdit = (s: any) => { setForm({ name: s.name, description: s.description ?? "", color: s.color ?? "#0d9488" }); setDialog({ open: true, mode: "edit", item: s }); };

  const handleSubmit = async () => {
    try {
      if (dialog.mode === "create") {
        await createM.mutateAsync({ data: { name: form.name, description: form.description || null, color: form.color || null } });
        toast({ title: "Specialty created" });
      } else {
        await updateM.mutateAsync({ id: dialog.item.id, data: { name: form.name, description: form.description || null, color: form.color || null } });
        toast({ title: "Specialty updated" });
      }
      await invalidate();
      setDialog({ open: false, mode: "create" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this specialty?")) return;
    await deleteM.mutateAsync({ id });
    await invalidate();
    toast({ title: "Specialty deleted" });
  };

  const list = Array.isArray(specialties) ? specialties : [];

  return (
    <Layout>
      <div className="p-6 max-w-4xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Specialties</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure medical specialties</p>
          </div>
          <Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" />Add Specialty</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="py-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: (s.color ?? "#0d9488") + "22" }}>
                  <Stethoscope className="w-5 h-5" style={{ color: s.color ?? "#0d9488" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.doctorCount} doctor{s.doctorCount !== 1 ? "s" : ""}</p>
                  {s.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="w-7 h-7 p-0" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-red-500" onClick={() => handleDelete(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialog.open} onOpenChange={(o) => !o && setDialog({ open: false, mode: "create" })}>
          <DialogContent>
            <DialogHeader><DialogTitle>{dialog.mode === "create" ? "Add Specialty" : "Edit Specialty"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="space-y-1.5"><Label>Color</Label><div className="flex gap-2"><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-10 p-1" /><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div></div>
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
