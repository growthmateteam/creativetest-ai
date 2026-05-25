import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, Facebook, Plug, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFacebook } from "@/contexts/FacebookContext";
import { FACEBOOK_APP_ID } from "@/lib/facebook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface AdAccountRow {
  id: string;
  name: string;
  bm_name: string | null;
  external_id: string | null;
  created_at: string;
}

function statusFor(account: AdAccountRow): "connected" | "expiring" | "disconnected" {
  const ageDays = (Date.now() - new Date(account.created_at).getTime()) / 86400000;
  if (ageDays > 60) return "disconnected";
  if (ageDays > 50) return "expiring";
  return "connected";
}

const STATUS_STYLES: Record<string, string> = {
  connected: "bg-success text-success-foreground",
  expiring: "bg-warning text-warning-foreground",
  disconnected: "bg-destructive text-destructive-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  connected: "Connected",
  expiring: "Expiring",
  disconnected: "Disconnected",
};

export function ConnectedAccountsTab() {
  const { fbUser, fbConnected, fbLogin, fbLogout, sdkReady, fbLoading } = useFacebook();

  const { data, isLoading } = useQuery({
    queryKey: ["settings-ad-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_accounts")
        .select("id, name, bm_name, external_id, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdAccountRow[];
    },
  });

  const handleFbLogin = async () => {
    try {
      await fbLogin();
      toast.success("Facebook account connected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Facebook login failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Facebook Connection ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1877F2]/10">
              <Facebook className="h-4 w-4 text-[#1877F2]" />
            </div>
            <div>
              <CardTitle className="text-base">Facebook / Meta</CardTitle>
              <CardDescription>
                Grants access to Pages, Business Managers, and Ad Accounts via the Marketing API.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!FACEBOOK_APP_ID ? (
            <p className="text-sm text-warning">
              <strong>VITE_FACEBOOK_APP_ID</strong> is not configured. Add it to your{" "}
              <code>.env</code> file.
            </p>
          ) : fbLoading ? (
            <p className="text-sm text-muted-foreground">Checking Facebook session…</p>
          ) : fbConnected && fbUser ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {fbUser.picture?.data?.url ? (
                  <img
                    src={fbUser.picture.data.url}
                    alt={fbUser.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2]/15">
                    <Facebook className="h-5 w-5 text-[#1877F2]" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{fbUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Connected · ID: {fbUser.id}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFbLogin}
                  disabled={!sdkReady}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Reconnect
                </Button>
                <Button size="sm" variant="outline" onClick={fbLogout}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Not connected. Connect to manage your Facebook Pages, Business Managers, and Ad
                Accounts directly from CreativeTest.ai.
              </p>
              <Button
                onClick={handleFbLogin}
                disabled={!sdkReady}
                className="shrink-0 bg-[#1877F2] text-white hover:bg-[#166fe5]"
              >
                <Facebook className="mr-2 h-4 w-4" />
                Connect Facebook
              </Button>
            </div>
          )}

          {fbConnected && (
            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Permissions granted:</strong> public_profile · pages_show_list ·
              pages_read_engagement · business_management · ads_read · ads_management
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* ── Workspace Ad Accounts ── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Workspace ad accounts</CardTitle>
              <CardDescription>
                Facebook ad accounts added to your CreativeTest.ai workspace.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/ad-accounts">Manage all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !data?.length ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
              <Plug className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No accounts added yet.</p>
              <Button asChild size="sm">
                <Link to="/ad-accounts">Add an account</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.map((acc) => {
                const status = statusFor(acc);
                return (
                  <li key={acc.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{acc.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {acc.bm_name || "No BM"} · {acc.external_id || "No external ID"}
                        </p>
                      </div>
                    </div>
                    <Badge className={STATUS_STYLES[status]}>{STATUS_LABEL[status]}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
