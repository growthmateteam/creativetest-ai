import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getStripeEnvironment } from "@/lib/stripe";
import { planByProductId, Plan } from "@/lib/plans";

export interface SubscriptionRow {
  id: string;
  status: string;
  product_id: string;
  price_id: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
  environment: string;
}

export interface SubscriptionInfo {
  subscription: SubscriptionRow | null;
  plan: Plan | null;
  isActive: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const env = getStripeEnvironment();

  return useQuery<SubscriptionInfo>({
    queryKey: ["subscription", user?.id, env],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      const sub = data as SubscriptionRow | null;
      const plan = planByProductId(sub?.product_id);
      const periodEndsInFuture = !sub?.current_period_end || new Date(sub.current_period_end) > new Date();
      const isActive = !!sub && (
        ((sub.status === "active" || sub.status === "trialing") && periodEndsInFuture) ||
        (sub.status === "canceled" && periodEndsInFuture)
      );
      return { subscription: sub, plan, isActive };
    },
  });
}

export function useCurrentMonthUsage() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["usage", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const month = new Date();
      month.setDate(1);
      const monthStr = month.toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("usage")
        .select("*")
        .eq("user_id", user!.id)
        .eq("month", monthStr)
        .maybeSingle();
      if (error) throw error;
      return data ?? { uploads_count: 0, api_calls_count: 0, month: monthStr };
    },
  });
}
