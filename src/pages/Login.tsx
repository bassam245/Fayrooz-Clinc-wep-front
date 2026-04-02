import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Stethoscope, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "staff") navigate("/staff/dashboard");
    else navigate("/patient/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      toast({ title: "Login failed", description: err?.data?.error || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    const accounts: Record<string, [string, string]> = {
      admin: ["admin@clinic.com", "password123"],
      staff: ["staff1@clinic.com", "password123"],
      patient: ["patient1@example.com", "password123"],
    };
    const [e, p] = accounts[role];
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-primary p-10 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-lg">ClinicCare</p>
            <p className="text-xs opacity-70">Medical Management System</p>
          </div>
        </div>
        <div className="space-y-6">
          <blockquote className="text-2xl font-semibold leading-snug opacity-90">
            "Bringing clarity and care together — so every appointment matters."
          </blockquote>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Patients Served", value: "2,400+" },
              { label: "Doctors", value: "48" },
              { label: "Specialties", value: "12" },
              { label: "Uptime", value: "99.9%" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs opacity-50">&copy; 2026 ClinicCare. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your ClinicCare account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="space-y-3">
            <p className="text-xs text-center text-muted-foreground font-medium">Demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {["admin", "staff", "patient"].map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  className="capitalize text-xs"
                  onClick={() => fillDemo(role)}
                >
                  {role}
                </Button>
              ))}
            </div>
            <p className="text-[11px] text-center text-muted-foreground">Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
