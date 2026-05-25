export const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;

export const FACEBOOK_SCOPES = [
  "public_profile",
  "pages_show_list",
  "business_management",
  "ads_read",
  "pages_read_engagement",
  "ads_management",
].join(",");

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

export interface FBUser {
  id: string;
  name: string;
  picture?: { data: { url: string; width: number; height: number } };
}

export interface FBPage {
  id: string;
  name: string;
  fan_count?: number;
  followers_count?: number;
  link?: string;
  picture?: { data: { url: string } };
  access_token?: string;
  engagement?: { count: number; social_sentence: string };
}

export interface FBBusiness {
  id: string;
  name: string;
}

export interface FBAdAccount {
  id: string;
  account_id: string;
  name: string;
  account_status: number;
  currency: string;
  amount_spent?: string;
  spend_cap?: string;
}

export interface FBCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend_cap?: string;
  daily_budget?: string;
}

export interface FBAd {
  id: string;
  name: string;
  status: string;
  created_time?: string;
}

export interface FBPaged<T> {
  data: T[];
  paging?: { cursors?: { before: string; after: string }; next?: string };
}

export async function fbGraph<T = unknown>(
  path: string,
  token: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "Facebook API error");
  return json as T;
}

export function getMe(token: string) {
  return fbGraph<FBUser>("/me", token, { fields: "id,name,picture.type(large)" });
}

export function getPages(token: string) {
  return fbGraph<FBPaged<FBPage>>("/me/accounts", token, {
    fields: "id,name,fan_count,followers_count,link,picture,access_token,engagement",
    limit: "50",
  });
}

export function getBusinesses(token: string) {
  return fbGraph<FBPaged<FBBusiness>>("/me/businesses", token, {
    fields: "id,name",
    limit: "50",
  });
}

export function getAdAccounts(token: string) {
  return fbGraph<FBPaged<FBAdAccount>>("/me/adaccounts", token, {
    fields: "id,account_id,name,account_status,currency,amount_spent,spend_cap",
    limit: "50",
  });
}

export function getCampaigns(token: string, adAccountId: string) {
  return fbGraph<FBPaged<FBCampaign>>(`/${adAccountId}/campaigns`, token, {
    fields: "id,name,status,objective,spend_cap,daily_budget",
    limit: "25",
  });
}

export function getAds(token: string, adAccountId: string) {
  return fbGraph<FBPaged<FBAd>>(`/${adAccountId}/ads`, token, {
    fields: "id,name,status,created_time",
    limit: "25",
  });
}

export async function createCampaign(
  token: string,
  adAccountId: string,
  name: string,
  objective: string,
): Promise<{ id: string }> {
  const url = new URL(`${GRAPH_BASE}/${adAccountId}/campaigns`);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, objective, status: "PAUSED", access_token: token }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "Failed to create campaign");
  return json;
}

// Account status codes from the Marketing API
export function adAccountStatusLabel(status: number): string {
  const map: Record<number, string> = {
    1: "Active",
    2: "Disabled",
    3: "Unsettled",
    7: "Pending Review",
    8: "Pending Closure",
    9: "In Grace Period",
    100: "Pending Closure",
    101: "Closed",
    201: "Any Active",
    202: "Any Closed",
  };
  return map[status] ?? "Unknown";
}

export function formatSpend(amountSpent?: string, currency?: string): string {
  if (!amountSpent) return "—";
  const cents = Number(amountSpent);
  if (isNaN(cents)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
