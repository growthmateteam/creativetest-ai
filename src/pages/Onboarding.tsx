import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, LogOut } from "lucide-react";

export default function Onboarding() {
  const { user, signOut } = useAuth();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />

      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card/60 p-10 text-center shadow-elegant backdrop-blur">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
          <Mail className="h-6 w-6 text-primary-foreground" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to CreativeTest<span className="bg-gradient-primary bg-clip-text text-transparent">.ai</span>
        </h1>

        <p className="mt-3 text-muted-foreground">
          Hi {user?.email} — your account isn't linked to a workspace yet.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-left text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Next step</p>
          <p className="mt-1">
            Contact your manager and ask them to assign you to an account from the Team page. Once you've been added, refresh this page to access the workspace.
          </p>
        </div>

        <Button onClick={signOut} variant="outline" className="mt-8 w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
