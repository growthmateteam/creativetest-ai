import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, MailX, XCircle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "success" };

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid", message: "No unsubscribe token in this link." });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } },
        );
        const data = await res.json();
        if (!res.ok) {
          setState({ kind: "invalid", message: data.error || "Invalid link." });
          return;
        }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setState({ kind: "already" });
          return;
        }
        if (data.valid) setState({ kind: "valid" });
        else setState({ kind: "invalid", message: "Invalid link." });
      } catch {
        setState({ kind: "invalid", message: "Could not validate this link." });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ token }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "invalid", message: data.error || "Could not unsubscribe." });
        return;
      }
      if (data.success || data.reason === "already_unsubscribed") {
        setState({ kind: "success" });
      } else {
        setState({ kind: "invalid", message: "Could not unsubscribe." });
      }
    } catch {
      setState({ kind: "invalid", message: "Network error." });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          {state.kind === "loading" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking your link…</p>
            </>
          )}
          {state.kind === "valid" && (
            <>
              <MailX className="h-10 w-10 text-secondary" />
              <h1 className="text-xl font-semibold">Unsubscribe from emails</h1>
              <p className="text-sm text-muted-foreground">
                Click below to confirm. You'll stop receiving emails from CreativeTest.ai.
              </p>
              <Button onClick={confirm} className="mt-2 bg-gradient-primary">
                Confirm unsubscribe
              </Button>
            </>
          )}
          {state.kind === "submitting" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Unsubscribing…</p>
            </>
          )}
          {state.kind === "success" && (
            <>
              <CheckCircle2 className="h-10 w-10 text-success" />
              <h1 className="text-xl font-semibold">You're unsubscribed</h1>
              <p className="text-sm text-muted-foreground">
                You won't receive further emails from CreativeTest.ai.
              </p>
            </>
          )}
          {state.kind === "already" && (
            <>
              <CheckCircle2 className="h-10 w-10 text-success" />
              <h1 className="text-xl font-semibold">Already unsubscribed</h1>
              <p className="text-sm text-muted-foreground">
                This email is already opted out — no action needed.
              </p>
            </>
          )}
          {state.kind === "invalid" && (
            <>
              <XCircle className="h-10 w-10 text-destructive" />
              <h1 className="text-xl font-semibold">Link not valid</h1>
              <p className="text-sm text-muted-foreground">{state.message}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
