import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Redirect to="/" />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === "patient") return <Redirect to="/patient/dashboard" />;
    if (user.role === "staff") return <Redirect to="/staff/dashboard" />;
    if (user.role === "admin") return <Redirect to="/admin/dashboard" />;
  }

  return <>{children}</>;
}
