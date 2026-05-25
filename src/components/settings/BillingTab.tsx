import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BillingTab() {
  const { data: subInfo, isLoading } = useSubscription();
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/settings`,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Could not open portal");
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const plan = subInfo?.plan;
  const sub = subInfo?.subscription;
  const isActive = subInfo?.isActive ?? false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>Managed securely by Stripe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              {isActive
                ? "Card on file — view details in the Stripe portal."
                : "No payment method on file."}
            </div>
          </div>
          <Button onClick={openPortal} disabled={loading || !isActive} variant="outline">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Manage payment method
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoices & billing history</CardTitle>
          <CardDescription>Download invoices and view past payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openPortal} disabled={loading || !isActive} variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            View invoices
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current plan summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : isActive && plan ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <Badge>{plan.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">${plan.price}/month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next billing date</span>
                <span className="font-medium">
                  {sub?.current_period_end
                    ? new Date(sub.current_period_end).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              {sub?.cancel_at_period_end && (
                <p className="pt-2 text-xs text-warning">
                  Subscription is set to cancel at the end of the current period.
                </p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">No active subscription.</p>
              <Button asChild>
                <Link to="/billing">Choose a plan</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
