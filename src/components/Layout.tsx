import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useListNotifications } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import {
  Calendar, Bell, Users, LayoutDashboard, Clock, ClipboardList,
  Stethoscope, Shield, ChevronLeft, ChevronRight, LogOut, User,
  Building2, BookOpen, ActivitySquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const patientNav = [
  { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patient/book", label: "Book Appointment", icon: Calendar },
  { href: "/patient/appointments", label: "My Appointments", icon: ClipboardList },
  { href: "/patient/notifications", label: "Notifications", icon: Bell },
];

const staffNav = [
  { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/appointments", label: "Appointments", icon: ClipboardList },
  { href: "/staff/schedule", label: "Weekly Schedule", icon: Calendar },
];

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/specialties", label: "Specialties", icon: BookOpen },
  { href: "/admin/working-hours", label: "Working Hours", icon: Clock },
  { href: "/admin/audit-log", label: "Audit Log", icon: Shield },
];

interface LayoutProps { children: ReactNode }

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { data: notifications } = useListNotifications({ unreadOnly: true });
  const unreadCount = Array.isArray(notifications) ? notifications.length : 0;

  const nav = user?.role === "patient" ? patientNav : user?.role === "staff" ? staffNav : adminNav;

  const roleColor = user?.role === "admin" ? "bg-violet-600" : user?.role === "staff" ? "bg-teal-600" : "bg-blue-600";
  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "staff" ? "Staff" : "Patient";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-semibold text-sm text-sidebar-foreground">ClinicCare</p>
              <p className="text-xs text-muted-foreground">Medical System</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="truncate">
                      {item.label}
                      {item.href.includes("notifications") && unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 h-4 px-1 text-[10px]">{unreadCount}</Badge>
                      )}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className={cn("text-white text-xs", roleColor)}>
                  {user?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && "Sign out"}
          </Button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-full top-1/2 -translate-y-1/2 w-5 h-10 bg-sidebar border border-sidebar-border rounded-r-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          style={{ marginLeft: "-1px" }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
