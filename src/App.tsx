import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

import PatientDashboard from "@/pages/patient/Dashboard";
import PatientBookAppointment from "@/pages/patient/BookAppointment";
import PatientAppointments from "@/pages/patient/Appointments";
import PatientNotifications from "@/pages/patient/Notifications";

import StaffDashboard from "@/pages/staff/Dashboard";
import StaffAppointments from "@/pages/staff/Appointments";
import StaffSchedule from "@/pages/staff/Schedule";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminDoctors from "@/pages/admin/Doctors";
import AdminSpecialties from "@/pages/admin/Specialties";
import AdminWorkingHours from "@/pages/admin/WorkingHours";
import AdminAuditLog from "@/pages/admin/AuditLog";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Login />;
  if (user.role === "admin") return <Redirect to="/admin/dashboard" />;
  if (user.role === "staff") return <Redirect to="/staff/dashboard" />;
  return <Redirect to="/patient/dashboard" />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />

      {/* Patient */}
      <Route path="/patient/dashboard">
        <ProtectedRoute roles={["patient"]}><PatientDashboard /></ProtectedRoute>
      </Route>
      <Route path="/patient/book">
        <ProtectedRoute roles={["patient"]}><PatientBookAppointment /></ProtectedRoute>
      </Route>
      <Route path="/patient/appointments">
        <ProtectedRoute roles={["patient"]}><PatientAppointments /></ProtectedRoute>
      </Route>
      <Route path="/patient/notifications">
        <ProtectedRoute roles={["patient"]}><PatientNotifications /></ProtectedRoute>
      </Route>

      {/* Staff */}
      <Route path="/staff/dashboard">
        <ProtectedRoute roles={["staff"]}><StaffDashboard /></ProtectedRoute>
      </Route>
      <Route path="/staff/appointments">
        <ProtectedRoute roles={["staff"]}><StaffAppointments /></ProtectedRoute>
      </Route>
      <Route path="/staff/schedule">
        <ProtectedRoute roles={["staff"]}><StaffSchedule /></ProtectedRoute>
      </Route>

      {/* Admin */}
      <Route path="/admin/dashboard">
        <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>
      </Route>
      <Route path="/admin/doctors">
        <ProtectedRoute roles={["admin"]}><AdminDoctors /></ProtectedRoute>
      </Route>
      <Route path="/admin/specialties">
        <ProtectedRoute roles={["admin"]}><AdminSpecialties /></ProtectedRoute>
      </Route>
      <Route path="/admin/working-hours">
        <ProtectedRoute roles={["admin"]}><AdminWorkingHours /></ProtectedRoute>
      </Route>
      <Route path="/admin/audit-log">
        <ProtectedRoute roles={["admin"]}><AdminAuditLog /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
