import { useState } from "react";
import {
  useListUsers, useCreateUser, useUpdateUser, useDeleteUser,
  getListUsersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const roleBadge: Record<string, string> = {
  admin: "bg-violet-100 text-violet-800",
  staff: "bg-teal-100 text-teal-800",
  patient: "bg-blue-100 text-blue-800",
};

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [dialog, setDialog] = useState<{ open: boolean; mode: "create" | "edit"; user?: any }>({ open: false, mode: "create" });
  const [form, setForm] = useState({ name: "", email: "", role: "patient", phone: "", password: "" });

  const params: any = {};
  if (search) params.search = search;
  if (roleFilter !== "all") params.role = roleFilter;

  const { data: users, isLoading } = useListUsers(params);
  const createM = useCreateUser();
  const updateM = useUpdateUser();
  const deleteM = useDeleteUser();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });

  const openCreate = () => {
    setForm({ name: "", email: "", role: "patient", phone: "", password: "password123" });
    setDialog({ open: true, mode: "create" });
  };

  const openEdit = (u: any) => {
    setForm({ name: u.name, email: u.email, role: u.role, phone: u.phone ?? "", password: "" });
    setDialog({ open: true, mode: "edit", user: u });
  };

  const handleSubmit = async () => {
    try {
      if (dialog.mode === "create") {
        await createM.mutateAsync({ data: { name: form.name, email: form.email, role: form.role as any, phone: form.phone || null, password: form.password } });
        toast({ title: "User created" });
      } else {
        await updateM.mutateAsync({ id: dialog.user.id, data: { name: form.name, phone: form.phone || null } });
        toast({ title: "User updated" });
      }
      await invalidate();
      setDialog({ open: false, mode: "create" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.error || "Something went wrong", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    await deleteM.mutateAsync({ id });
    await invalidate();
    toast({ title: "User deleted" });
  };

  const handleToggle = async (u: any) => {
    await updateM.mutateAsync({ id: u.id, data: { isActive: !u.isActive } });
    await invalidate();
    toast({ title: u.isActive ? "User deactivated" : "User activated" });
  };

  const userList = Array.isArray(users) ? users : [];

  return (
    <Layout>
      <div className="p-6 max-w-6xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">{userList.length} users</p>
          </div>
          <Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" />Add User</Button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-2">
            {userList.map((u: any) => (
              <Card key={u.id} className={cn(!u.isActive && "opacity-60")}>
                <CardContent className="py-3 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{u.name}</p>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", roleBadge[u.role])}>{u.role}</span>
                      {!u.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Inactive</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground hidden md:block">{format(new Date(u.createdAt), "MMM d, yyyy")}</p>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => handleToggle(u)}>
                      {u.isActive ? <ToggleRight className="w-4 h-4 text-teal-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => openEdit(u)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(u.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {userList.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No users found</p>}
          </div>
        )}

        <Dialog open={dialog.open} onOpenChange={(o) => !o && setDialog({ open: false, mode: "create" })}>
          <DialogContent>
            <DialogHeader><DialogTitle>{dialog.mode === "create" ? "Add User" : "Edit User"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              {dialog.mode === "create" && (
                <>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                </>
              )}
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialog({ open: false, mode: "create" })}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createM.isPending || updateM.isPending}>
                {dialog.mode === "create" ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
