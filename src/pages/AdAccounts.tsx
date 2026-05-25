import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  ExternalLink,
  Facebook,
  Grid3x3,
  Layers,
  ListChecks,
  Plug,
  Plus,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFacebook } from "@/contexts/FacebookContext";
import {
  getPages,
  getBusinesses,
  getAdAccounts,
  adAccountStatusLabel,
  formatSpend,
  type FBPage,
  type FBBusiness,
  type FBAdAccount,
} from "@/lib/facebook";
import { FACEBOOK_APP_ID } from "@/lib/facebook";

type ConnectionStatus = "connected" | "expiring" | "disconnected";

interface AccountCard {
  id: string;
  name: string;
  bm_name: string | null;
  external_id: string | null;
  created_at: string;
  status: ConnectionStatus;
  campaignCount: number;
  templateCount: number;
}

const statusBadge: Record<ConnectionStatus, { label: string; cls: string }> = {
  connected: {
    label: "Connected",
    cls: "bg-success/15 text-success border-success/30",
  },
  expiring: {
    label: "Token expiring",
    cls: "bg-warning/15 text-warning border-warning/30",
  },
  disconnected: {
    label: "Disconnected",
    cls: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

function placeholderStatus(id: string): ConnectionStatus {
  const c = id.charCodeAt(0) % 10;
  if (c < 7) return "connected";
  if (c < 9) return "expiring";
  return "disconnected";
}

export default function AdAccounts() {
  const { role } = useAuth();
  const { fbConnected, fbUser, fbToken, fbLogin, fbLogout, sdkReady, fbLoading } = useFacebook();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountCard[]>([]);
  const [connectOpen, setConnectOpen] = useState(false);

  // Facebook data
  const [fbPages, setFbPages] = useState<FBPage[]>([]);
  const [fbBusinesses, setFbBusinesses] = useState<FBBusiness[]>([]);
  const [fbAdAccounts, setFbAdAccounts] = useState<FBAdAccount[]>([]);
  const [fbDataLoading, setFbDataLoading] = useState(false);

  const canManage = role === "admin" || role === "manager";

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (fbConnected && fbToken) {
      void loadFbData(fbToken);
    } else {
      setFbPages([]);
      setFbBusinesses([]);
      setFbAdAccounts([]);
    }
  }, [fbConnected, fbToken]);

  const load = async () => {
    setLoading(true);
    try {
      const [accRes, launchRes, tplRes] = await Promise.all([
        supabase
          .from("ad_accounts")
          .select("id, name, bm_name, external_id, created_at")
          .order("name"),
        supabase.from("launch_logs").select("account_id, campaign_name"),
        supabase.from("templates").select("account_id"),
      ]);
      if (accRes.error) throw accRes.error;
      if (launchRes.error) throw launchRes.error;
      if (tplRes.error) throw tplRes.error;

      const campaigns = new Map<string, Set<string>>();
      (launchRes.data ?? []).forEach((l) => {
        const set = campaigns.get(l.account_id) ?? new Set();
        set.add(l.campaign_name);
        campaigns.set(l.account_id, set);
      });
      const templates = new Map<string, number>();
      (tplRes.data ?? []).forEach((t) => {
        templates.set(t.account_id, (templates.get(t.account_id) ?? 0) + 1);
      });

      setAccounts(
        (accRes.data ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          bm_name: a.bm_name,
          external_id: a.external_id,
          created_at: a.created_at,
          status: placeholderStatus(a.id),
          campaignCount: campaigns.get(a.id)?.size ?? 0,
          templateCount: templates.get(a.id) ?? 0,
        })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const loadFbData = async (token: string) => {
    setFbDataLoading(true);
    try {
      const [pagesRes, bizRes, adAccRes] = await Promise.allSettled([
        getPages(token),
        getBusinesses(token),
        getAdAccounts(token),
      ]);
      if (pagesRes.status === "fulfilled") setFbPages(pagesRes.value.data);
      if (bizRes.status === "fulfilled") setFbBusinesses(bizRes.value.data);
      if (adAccRes.status === "fulfilled") setFbAdAccounts(adAccRes.value.data);
    } catch (e) {
      toast.error("Failed to load Facebook data");
    } finally {
      setFbDataLoading(false);
    }
  };

  const handleFbLogin = async () => {
    try {
      await fbLogin();
      toast.success("Facebook connected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Facebook login failed");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ad Accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your connected Facebook ad accounts, business managers, and pages.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setConnectOpen(true)} className="bg-gradient-primary">
            <Plus className="mr-1.5 h-4 w-4" />
            Add account
          </Button>
        )}
      </div>

      {/* ── Facebook Connection Panel ── */}
      {!fbLoading && !FACEBOOK_APP_ID ? (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="py-4 text-sm text-warning">
            <strong>VITE_FACEBOOK_APP_ID</strong> is not set. Add it to your <code>.env</code> file
            to enable Facebook integration.
          </CardContent>
        </Card>
      ) : fbConnected && fbUser ? (
        <FacebookProfileCard
          fbUser={fbUser}
          onDisconnect={fbLogout}
          pagesCount={fbPages.length}
          bizCount={fbBusinesses.length}
          adAccountsCount={fbAdAccounts.length}
        />
      ) : (
        <Card className="border-dashed border-border/60">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1877F2]/10">
              <Facebook className="h-7 w-7 text-[#1877F2]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Connect your Facebook account</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Grant access to your Pages, Business Managers, and Ad Accounts to manage campaigns
                from one place.
              </p>
            </div>
            <Button
              onClick={handleFbLogin}
              disabled={!sdkReady && !!FACEBOOK_APP_ID}
              className="bg-[#1877F2] text-white hover:bg-[#166fe5]"
            >
              <Facebook className="mr-2 h-4 w-4" />
              Connect with Facebook
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Facebook Live Data ── */}
      {fbConnected && (
        <div className="space-y-6">
          {/* Pages — pages_show_list + pages_read_engagement */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-[#1877F2]" />
              <h2 className="text-base font-semibold">Your Facebook Pages</h2>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                pages_show_list · pages_read_engagement
              </Badge>
              {fbDataLoading && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>
            {fbPages.length === 0 && !fbDataLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No Facebook Pages found on this account.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {fbPages.map((page) => (
                  <FBPageCard key={page.id} page={page} />
                ))}
              </div>
            )}
          </section>

          {/* Business Managers — business_management */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Business Managers</h2>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                business_management
              </Badge>
              {fbDataLoading && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>
            {fbBusinesses.length === 0 && !fbDataLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No Business Managers found on this account.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {fbBusinesses.map((biz) => (
                  <Card key={biz.id} className="border-border/60">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{biz.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{biz.id}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Ad Accounts — ads_read */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-secondary" />
              <h2 className="text-base font-semibold">Facebook Ad Accounts</h2>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                ads_read
              </Badge>
              {fbDataLoading && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>
            {fbAdAccounts.length === 0 && !fbDataLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No Ad Accounts found. Make sure your Facebook user has access to ad accounts.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {fbAdAccounts.map((acc) => (
                  <FBAdAccountCard key={acc.id} account={acc} />
                ))}
              </div>
            )}
          </section>

          <Separator />
        </div>
      )}

      {/* ── Supabase-backed accounts ── */}
      <section className="space-y-3">
        {fbConnected && (
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Workspace Ad Accounts</h2>
          </div>
        )}
        {loading ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              Loading accounts…
            </CardContent>
          </Card>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Plug className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">No workspace accounts yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a Facebook Ad Account to start building templates and launching campaigns.
                </p>
              </div>
              {canManage && (
                <Button onClick={() => setConnectOpen(true)} className="bg-gradient-primary">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add account
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((a) => (
              <AccountCardItem key={a.id} account={a} />
            ))}
          </div>
        )}
      </section>

      <ConnectAccountModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onCreated={load}
      />
    </div>
  );
}

// ── Facebook Profile Card ──────────────────────────────────────────────────

function FacebookProfileCard({
  fbUser,
  onDisconnect,
  pagesCount,
  bizCount,
  adAccountsCount,
}: {
  fbUser: { id: string; name: string; picture?: { data: { url: string } } };
  onDisconnect: () => void;
  pagesCount: number;
  bizCount: number;
  adAccountsCount: number;
}) {
  const avatarUrl = fbUser.picture?.data?.url;
  return (
    <Card className="border-[#1877F2]/30 bg-[#1877F2]/5">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fbUser.name}
              className="h-12 w-12 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2]/20">
              <Facebook className="h-6 w-6 text-[#1877F2]" />
            </div>
          )}
          <div>
            <p className="font-semibold">{fbUser.name}</p>
            <p className="text-xs text-muted-foreground">
              Facebook ID: {fbUser.id} ·{" "}
              <span className="text-success">Connected</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold">{pagesCount}</p>
            <p className="text-[11px] text-muted-foreground">Pages</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{bizCount}</p>
            <p className="text-[11px] text-muted-foreground">Businesses</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{adAccountsCount}</p>
            <p className="text-[11px] text-muted-foreground">Ad Accounts</p>
          </div>
          <Button size="sm" variant="outline" onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Facebook Page Card ─────────────────────────────────────────────────────

function FBPageCard({ page }: { page: FBPage }) {
  const avatarUrl = page.picture?.data?.url;
  const fans = page.fan_count ?? page.followers_count;
  const engCount = page.engagement?.count;

  return (
    <Card className="border-border/60">
      <CardContent className="flex items-start gap-3 p-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={page.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1877F2]/10">
            <Facebook className="h-5 w-5 text-[#1877F2]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{page.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">ID: {page.id}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {fans !== undefined && (
              <span>
                <span className="font-semibold text-foreground">
                  {fans.toLocaleString()}
                </span>{" "}
                fans
              </span>
            )}
            {engCount !== undefined && (
              <span>
                <span className="font-semibold text-foreground">
                  {engCount.toLocaleString()}
                </span>{" "}
                engaged
              </span>
            )}
          </div>
          {page.link && (
            <a
              href={page.link}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              View page <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Facebook Ad Account Card ───────────────────────────────────────────────

function FBAdAccountCard({ account }: { account: FBAdAccount }) {
  const isActive = account.account_status === 1;
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
          <Wallet className="h-5 w-5 text-secondary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{account.name}</p>
            <Badge
              variant="outline"
              className={
                isActive
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-muted text-muted-foreground"
              }
            >
              {adAccountStatusLabel(account.account_status)}
            </Badge>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            act_{account.account_id}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {formatSpend(account.amount_spent, account.currency)}
              </span>{" "}
              spent
            </span>
            <span className="uppercase">{account.currency}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Workspace Account Card ─────────────────────────────────────────────────

function AccountCardItem({ account }: { account: AccountCard }) {
  const status = statusBadge[account.status];
  return (
    <Link to={`/ad-accounts/${account.id}`} className="group block">
      <Card className="h-full transition-smooth hover:border-primary/40 hover:shadow-glow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary/10">
                <Grid3x3 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate text-base">{account.name}</CardTitle>
                {account.bm_name && (
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {account.bm_name}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline" className={status.cls}>
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {account.external_id && (
            <p className="font-mono text-[11px] text-muted-foreground">
              ID: {account.external_id}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div>
              <p className="text-xs text-muted-foreground">Campaigns</p>
              <p className="text-lg font-semibold">{account.campaignCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Templates</p>
              <p className="text-lg font-semibold">{account.templateCount}</p>
            </div>
          </div>
          {account.status !== "connected" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Reconnect your Facebook account via Settings → Connected Accounts.");
              }}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Reconnect
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Add Account Modal ──────────────────────────────────────────────────────

interface ConnectAccountModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

function ConnectAccountModal({ open, onOpenChange, onCreated }: ConnectAccountModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [bmName, setBmName] = useState("");
  const [externalId, setExternalId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setBmName("");
      setExternalId("");
    }
  }, [open]);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("ad_accounts").insert({
        name: name.trim(),
        bm_name: bmName.trim() || null,
        external_id: externalId.trim() || null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      toast.success("Account added");
      onOpenChange(false);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add workspace account</DialogTitle>
          <DialogDescription>
            Add a Facebook Ad Account to your workspace. Use the external ID (act_XXXX) to link
            live campaign data from the Marketing API.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="acc-name">Account name</Label>
            <Input
              id="acc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme — Performance"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acc-bm">Business Manager (optional)</Label>
            <Input
              id="acc-bm"
              value={bmName}
              onChange={(e) => setBmName(e.target.value)}
              placeholder="Acme BM"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acc-id">Facebook Ad Account ID (optional)</Label>
            <Input
              id="acc-id"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder="act_1234567890"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting} className="bg-gradient-primary">
            <Plus className="mr-1.5 h-4 w-4" />
            Add account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { statusBadge as adAccountStatusBadge };
export type { ConnectionStatus };
