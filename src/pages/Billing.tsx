import { useState } from "react";
import { Loader2, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, useCurrentMonthUsage } from "@/hooks/useSubscription";
import { PLANS, Plan } from "@/lib/plans";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckout } from "@/components/billing/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/billing/PaymentTestModeBanner";
import { cn } from "@/lib/utils";

export default function Billing() {
  const { user } = useAuth();
  const { data: subInfo, isLoading: subLoading } = useSubscription();
  const { data: usage } = useCurrentMonthUsage();
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentPlan = subInfo?.plan ?? null;
  const isActive = subInfo?.isActive ?? false;
  const uploadsUsed = usage?.uploads_count ?? 0;
  const uploadsLimit = currentPlan?.limits.ads ?? 0;
  const uploadsPercent = uploadsLimit === Infinity
    ? 0
    : uploadsLimit > 0
      ? Math.min(100, (uploadsUsed / uploadsLimit) * 100)
      : 0;

  const handleSelectPlan = (plan: Plan) => setCheckoutPlan(plan);

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/billing`,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Failed to open portal");
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Could not open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PaymentTestModeBanner />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription, view usage, and upgrade your plan.
        </p>
      </div>

      {/* Current plan + usage */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Current plan</CardTitle>
              <CardDescription>
                {subLoading
                  ? "Loading..."
                  : isActive && currentPlan
                    ? `${currentPlan.name} — $${currentPlan.price}/month`
                    : "No active subscription"}
              </CardDescription>
            </div>
            {isActive && (
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-success text-success-foreground">
                  Active
                </Badge>
                {subInfo?.subscription?.cancel_at_period_end && (
                  <Badge variant="outline" className="border-warning text-warning">
                    Cancels at period end
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActive && currentPlan ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ads launched this month</span>
                  <span className="font-medium">
                    {uploadsUsed.toLocaleString()} /{" "}
                    {uploadsLimit === Infinity ? "Unlimited" : uploadsLimit.toLocaleString()}
                  </span>
                </div>
                {uploadsLimit !== Infinity && (
                  <Progress value={uploadsPercent} className="h-2" />
                )}
              </div>
              {subInfo?.subscription?.current_period_end && (
                <p className="text-xs text-muted-foreground">
                  {subInfo.subscription.cancel_at_period_end ? "Access ends" : "Renews"}{" "}
                  {new Date(subInfo.subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
              <Button onClick={handleManage} variant="outline" disabled={portalLoading}>
                {portalLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Manage subscription
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a plan below to unlock the upload feature.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plans grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Available plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = isActive && currentPlan?.id === plan.id;
            const isHighlighted = plan.id === "growth";
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col",
                  isHighlighted && "border-primary shadow-[var(--shadow-glow)]",
                )}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-2">
                    {isCurrent ? (
                      <Button disabled variant="outline" className="w-full">
                        Current plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full"
                        variant={isHighlighted ? "default" : "outline"}
                      >
                        {isActive ? "Switch to " + plan.name : "Choose " + plan.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!checkoutPlan} onOpenChange={(o) => !o && setCheckoutPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscribe to {checkoutPlan?.name}</DialogTitle>
          </DialogHeader>
          {checkoutPlan && (
            <StripeEmbeddedCheckout
              priceId={checkoutPlan.priceId}
              customerEmail={user?.email}
              userId={user?.id}
              returnUrl={`${window.location.origin}/billing/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
