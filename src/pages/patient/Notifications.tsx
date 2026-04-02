import {
  useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead,
  getListNotificationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const typeColors: Record<string, string> = {
  appointment_confirmed: "border-l-teal-500",
  appointment_cancelled: "border-l-red-400",
  appointment_pending: "border-l-amber-400",
  appointment_completed: "border-l-gray-400",
  system: "border-l-blue-400",
};

export default function PatientNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: notifications } = useListNotifications({});
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const notifs = Array.isArray(notifications) ? notifications : [];
  const hasUnread = notifs.some((n: any) => !n.isRead);

  const handleMarkAll = async () => {
    await markAll.mutateAsync();
    await queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey({}) });
    toast({ title: "All marked as read" });
  };

  const handleMarkRead = async (id: number) => {
    await markRead.mutateAsync({ id });
    await queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey({}) });
  };

  return (
    <Layout>
      <div className="p-6 max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">{notifs.length} total notifications</p>
          </div>
          {hasUnread && (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAll} disabled={markAll.isPending}>
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </Button>
          )}
        </div>

        {notifs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BellOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifs.map((n: any) => (
              <Card
                key={n.id}
                className={cn(
                  "border-l-4 transition-all cursor-pointer hover:shadow-sm",
                  typeColors[n.type] ?? "border-l-gray-300",
                  !n.isRead && "bg-accent/30"
                )}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
              >
                <CardContent className="py-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Bell className={cn("w-4 h-4 mt-0.5 shrink-0", n.isRead ? "text-muted-foreground" : "text-primary")} />
                    <div className="min-w-0">
                      <p className={cn("text-sm", !n.isRead && "font-semibold")}>{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.createdAt), "MMM d, yyyy — h:mm a")}</p>
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
