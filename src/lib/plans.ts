export type PlanId = "starter" | "growth" | "agency";

export interface PlanLimits {
  ads: number; // Infinity for unlimited
  adAccounts: number;
  teamMembers: number;
}

export interface Plan {
  id: PlanId;
  productId: string;
  priceId: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: PlanLimits;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    productId: "starter_plan",
    priceId: "starter_monthly",
    name: "Starter",
    price: 49,
    description: "For solo operators getting started.",
    features: [
      "Up to 200 ads/month (4 launches of 50)",
      "1 ad account",
      "2 team members",
      "Email support",
    ],
    limits: { ads: 200, adAccounts: 1, teamMembers: 2 },
  },
  {
    id: "growth",
    productId: "growth_plan",
    priceId: "growth_monthly",
    name: "Growth",
    price: 99,
    description: "For growing brands managing multiple accounts.",
    features: [
      "Up to 500 ads/month",
      "5 ad accounts",
      "5 team members",
      "Priority support",
    ],
    limits: { ads: 500, adAccounts: 5, teamMembers: 5 },
  },
  {
    id: "agency",
    productId: "agency_plan",
    priceId: "agency_monthly",
    name: "Agency",
    price: 199,
    description: "For agencies running unlimited campaigns.",
    features: [
      "Unlimited ads",
      "Unlimited ad accounts",
      "Up to 15 team members",
      "Dedicated account manager",
    ],
    limits: { ads: Infinity, adAccounts: Infinity, teamMembers: 15 },
  },
];

export function planByProductId(productId: string | null | undefined): Plan | null {
  if (!productId) return null;
  return PLANS.find((p) => p.productId === productId) ?? null;
}
