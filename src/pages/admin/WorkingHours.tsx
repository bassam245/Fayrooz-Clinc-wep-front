import { useState, useEffect } from "react";
import { useGetWorkingHours, useUpdateWorkingHours, getGetWorkingHoursQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminWorkingHours() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: workingHours } = useGetWorkingHours();
  const updateM = useUpdateWorkingHours();
  const [hours, setHours] = useState<any[]>([]);

  useEffect(() => {
    if (Array.isArray(workingHours)) {
      setHours([...workingHours].sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek));
    }
  }, [workingHours]);

  const updateDay = (idx: number, field: string, value: any) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    try {
      await updateM.mutateAsync({ data: { hours: hours.map((h) => ({ dayOfWeek: h.dayOfWeek, startTime: h.startTime, endTime: h.endTime, isActive: h.isActive })) } });
      await queryClient.invalidateQueries({ queryKey: getGetWorkingHoursQueryKey() });
      toast({ title: "Working hours updated" });
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Working Hours</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure clinic operating hours per day</p>
          </div>
          <Button className="gap-2" onClick={handleSave} disabled={updateM.isPending}><Save className="w-4 h-4" />Save Changes</Button>
        </div>

        <div className="space-y-3">
          {hours.map((h, idx) => (
            <Card key={h.dayOfWeek} className={!h.isActive ? "opacity-60" : ""}>
              <CardContent className="py-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 w-36">
                  <Switch checked={h.isActive} onCheckedChange={(v) => updateDay(idx, "isActive", v)} />
                  <Label className="font-medium text-sm">{dayNames[h.dayOfWeek]}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="time"
                    value={h.startTime}
                    onChange={(e) => updateDay(idx, "startTime", e.target.value)}
                    className="w-32"
                    disabled={!h.isActive}
                  />
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="time"
                    value={h.endTime}
                    onChange={(e) => updateDay(idx, "endTime", e.target.value)}
                    className="w-32"
                    disabled={!h.isActive}
                  />
                </div>
                {!h.isActive && <span className="text-xs text-muted-foreground">Closed</span>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
