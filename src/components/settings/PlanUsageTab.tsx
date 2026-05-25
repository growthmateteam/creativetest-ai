import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, useCurrentMonthUsage } from "@/hooks/useSubscription";
import { PLANS } from "@/lib/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === Infinity;
  const pct = isUnlimited ? 0 : limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const indicatorColor =
    pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-warning" : "bg-primary";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {used.toLocaleString()} / {isUnlimited ? "Unlimited" : limit.toLocaleString()}
        </span>
      </div>
      {!isUnlimited && (
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all", indicatorColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function PlanUsageTab() {
  const { user } = useAuth();
  const { data: subInfo, isLoading } = useSubscription();
  const { data: usage } = useCurrentMonthUsage();

  const plan = subInfo?.plan;
  const isActive = subInfo?.isActive ?? false;
  const sub = subInfo?.subscription;

  // Counts for limits
  const { data: counts } = useQuery({
    queryKey: ["settings-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [accounts, members] = await Promise.all([
        supabase.from("ad_accounts").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }),
      ]);
      return {
        accounts: accounts.count ?? 0,
        members: members.count ?? 0,
      };
    },
  });

  const uploadsUsed = usage?.uploads_count ?? 0;

  return (
    <div className="space-y-6">
      {/* Current plan header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle>Current plan</CardTitle>
                {isActive && plan ? (
                  <span className="inline-flex items-center rounded-md bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                    {plan.name}
                  </span>
                ) : (
                  <Badge variant="outline">No plan</Badge>
                )}
              </div>
              <CardDescription>
                {isActive && plan
                  ? `Monthly • Renews ${
                      sub?.current_period_end
                        ? new Date(sub.current_period_end).toLocaleDateString()
                        : "—"
                    }`
                  : "Choose a plan to unlock the Upload feature."}
              </CardDescription>
            </div>
            <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Link to="/billing">
                <Sparkles className="mr-2 h-4 w-4" />
                {isActive ? "Change plan" : "Upgrade plan"}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              <UsageMeter
                label="Ads launched this month"
                used={uploadsUsed}
                limit={plan?.limits.ads ?? 0}
              />
              <UsageMeter
                label="Ad accounts connected"
                used={counts?.accounts ?? 0}
                limit={plan?.limits.adAccounts ?? 0}
              />
              <UsageMeter
                label="Team members"
                used={counts?.members ?? 0}
                limit={plan?.limits.teamMembers ?? 0}
              />
            </>
          )}

          {isActive && (
            <div className="pt-2">
              <Button asChild variant="link" className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive">
                <Link to="/billing">Cancel subscription</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing tiers */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">All plans</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => {
            const isCurrent = isActive && plan?.id === p.id;
            return (
              <Card key={p.id} className={cn(isCurrent && "border-primary")}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                  </div>
                  <div>
                    <span className="text-2xl font-bold">${p.price}</span>
                    <span className="text-xs text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                      <span>{f}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
