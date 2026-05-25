import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BillingReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const queryClient = useQueryClient();

  useEffect(() => {
    // Webhook will populate the subscription row; refresh after a short delay.
    const t = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    }, 1500);
    return () => clearTimeout(t);
  }, [queryClient]);

  return (
    <div className="mx-auto max-w-md py-16">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <div>
            <h1 className="text-2xl font-bold">Payment successful</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {sessionId
                ? "Your subscription is being activated. This usually takes a few seconds."
                : "No checkout session found."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/upload">Start uploading</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/billing">Back to billing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
