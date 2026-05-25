import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Building2,
  Facebook,
  Grid3x3,
  Instagram,
  Layers,
  ListChecks,
  Megaphone,
  Plus,
  RefreshCw,
  Rocket,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFacebook } from "@/contexts/FacebookContext";
import {
  getCampaigns,
  getAds,
  createCampaign,
  type FBCampaign,
  type FBAd,
} from "@/lib/facebook";
import { adAccountStatusBadge, type ConnectionStatus } from "./AdAccounts";

interface AccountDetail {
  id: string;
  name: string;
  bm_name: string | null;
  external_id: string | null;
  created_at: string;
}

interface TemplateRow {
  id: string;
  name: string;
  updated_at: string;
}

interface LaunchRow {
  id: string;
  campaign_name: string;
  ad_count: number;
  status: string;
  created_at: string;
}

interface MemberRow {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

function placeholderStatus(id: string): ConnectionStatus {
  const c = id.charCodeAt(0) % 10;
  if (c < 7) return "connected";
  if (c < 9) return "expiring";
  return "disconnected";
}

const FB_OBJECTIVES = [
  "OUTCOME_AWARENESS",
  "OUTCOME_TRAFFIC",
  "OUTCOME_ENGAGEMENT",
  "OUTCOME_LEADS",
  "OUTCOME_APP_PROMOTION",
  "OUTCOME_SALES",
];

export default function AdAccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { fbConnected, fbToken } = useFacebook();

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [launches, setLaunches] = useState<LaunchRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);

  // Marketing API data
  const [campaigns, setCampaigns] = useState<FBCampaign[]>([]);
  const [ads, setAds] = useState<FBAd[]>([]);
  const [fbDataLoading, setFbDataLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    void load(id);
  }, [id]);

  useEffect(() => {
    if (fbConnected && fbToken && account?.external_id) {
      void loadMarketingData(fbToken, account.external_id);
    }
  }, [fbConnected, fbToken, account]);

  const load = async (accountId: string) => {
    setLoading(true);
    try {
      const [accRes, tplRes, launchRes, accessRes] = await Promise.all([
        supabase
          .from("ad_accounts")
          .select("id, name, bm_name, external_id, created_at")
          .eq("id", accountId)
          .maybeSingle(),
        supabase
          .from("templates")
          .select("id, name, updated_at")
          .eq("account_id", accountId)
          .order("updated_at", { ascending: false }),
        supabase
          .from("launch_logs")
          .select("id, campaign_name, ad_count, status, created_at")
          .eq("account_id", accountId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("user_account_access").select("user_id").eq("account_id", accountId),
      ]);
      if (accRes.error) throw accRes.error;
      if (tplRes.error) throw tplRes.error;
      if (launchRes.error) throw launchRes.error;
      if (accessRes.error) throw accessRes.error;
      if (!accRes.data) {
        toast.error("Account not found");
        navigate("/ad-accounts");
        return;
      }
      setAccount(accRes.data);
      setTemplates(tplRes.data ?? []);
      setLaunches(launchRes.data ?? []);

      const userIds = (accessRes.data ?? []).map((a) => a.user_id);
      if (userIds.length > 0) {
        const [profilesRes, rolesRes] = await Promise.all([
          supabase.from("profiles").select("id, name, email").in("id", userIds),
          supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
        ]);
        const roleMap = new Map((rolesRes.data ?? []).map((r) => [r.user_id, r.role]));
        setMembers(
          (profilesRes.data ?? []).map((p) => ({
            user_id: p.id,
            name: p.name ?? p.email,
            email: p.email,
            role: roleMap.get(p.id) ?? "—",
          })),
        );
      } else {
        setMembers([]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  const loadMarketingData = async (token: string, externalId: string) => {
    setFbDataLoading(true);
    try {
      const [campRes, adsRes] = await Promise.allSettled([
        getCampaigns(token, externalId),
        getAds(token, externalId),
      ]);
      if (campRes.status === "fulfilled") setCampaigns(campRes.value.data);
      if (adsRes.status === "fulfilled") setAds(adsRes.value.data);
    } finally {
      setFbDataLoading(false);
    }
  };

  if (loading || !account) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            {loading ? "Loading account…" : "Account not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = adAccountStatusBadge[placeholderStatus(account.id)];
  const canManage = role === "admin" || role === "manager";
  const hasFbAccount = !!account.external_id;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2 text-muted-foreground"
          onClick={() => navigate("/ad-accounts")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          All ad accounts
        </Button>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Grid3x3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{account.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {account.bm_name && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {account.bm_name}
                    </span>
                  )}
                  {account.external_id && (
                    <span className="font-mono">ID: {account.external_id}</span>
                  )}
                  <span>Added {format(new Date(account.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={status.cls}>
                {status.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Marketing API: Campaigns (ads_management) ── */}
      {hasFbAccount && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">
                Live Campaigns
                {campaigns.length > 0 && (
                  <span className="ml-1.5 text-muted-foreground">({campaigns.length})</span>
                )}
              </CardTitle>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                ads_management · Marketing API
              </Badge>
              {fbDataLoading && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>
            {canManage && fbConnected && (
              <Button
                size="sm"
                className="bg-gradient-primary"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New campaign
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!fbConnected ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Connect your Facebook account on the{" "}
                <Link to="/ad-accounts" className="text-primary hover:underline">
                  Ad Accounts
                </Link>{" "}
                page to see live campaign data.
              </p>
            ) : campaigns.length === 0 && !fbDataLoading ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No campaigns found for this ad account.
              </p>
            ) : (
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <CampaignRow key={c.id} campaign={c} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Marketing API: Ads (ads_management) ── */}
      {hasFbAccount && fbConnected && ads.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-secondary" />
              <CardTitle className="text-base">
                Live Ads
                <span className="ml-1.5 text-muted-foreground">({ads.length})</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                ads_management · Marketing API
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ads.map((ad) => (
                <AdRow key={ad.id} ad={ad} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Page & Instagram ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected page & Instagram</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <Facebook className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Facebook page</p>
              <p className="truncate text-sm font-medium text-muted-foreground">
                {fbConnected ? "Select from your Pages" : "Not linked yet"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary/15">
              <Instagram className="h-4 w-4 text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Instagram profile</p>
              <p className="truncate text-sm font-medium text-muted-foreground">Not linked yet</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Templates */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" />
              Templates ({templates.length})
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/templates?account=${account.id}`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No templates for this account yet.
              </p>
            ) : (
              templates.slice(0, 5).map((t) => (
                <Link
                  key={t.id}
                  to={`/templates/${t.id}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 transition-smooth hover:border-primary/40 hover:bg-muted/40"
                >
                  <span className="truncate text-sm font-medium">{t.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {format(new Date(t.updated_at), "MMM d")}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent launches */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-secondary" />
              Recent launches
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/launch-log?account=${account.id}`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {launches.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No launches yet from this account.
              </p>
            ) : (
              launches.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.campaign_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {l.ad_count} ad{l.ad_count === 1 ? "" : "s"} ·{" "}
                      {format(new Date(l.created_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      l.status === "success"
                        ? "bg-success/15 text-success border-success/30"
                        : l.status === "failed"
                          ? "bg-destructive/15 text-destructive border-destructive/30"
                          : l.status === "partial"
                            ? "bg-warning/15 text-warning border-warning/30"
                            : "bg-muted text-muted-foreground"
                    }
                  >
                    {l.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Team members with access ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No teammates have been granted access to this account yet.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {members.map((m) => (
                <div
                  key={m.user_id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {m.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        externalId={account.external_id}
        fbToken={fbToken}
        onCreated={() => {
          if (fbToken && account.external_id) {
            void loadMarketingData(fbToken, account.external_id);
          }
        }}
      />
    </div>
  );
}

// ── Campaign Row ────────────────────────────────────────────────────────────

function CampaignRow({ campaign }: { campaign: FBCampaign }) {
  const isActive = campaign.status === "ACTIVE";
  const isPaused = campaign.status === "PAUSED";
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{campaign.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {campaign.objective.replace(/_/g, " ")} · ID: {campaign.id}
        </p>
      </div>
      <Badge
        variant="outline"
        className={
          isActive
            ? "bg-success/15 text-success border-success/30"
            : isPaused
              ? "bg-muted text-muted-foreground"
              : "bg-warning/15 text-warning border-warning/30"
        }
      >
        {campaign.status}
      </Badge>
    </div>
  );
}

// ── Ad Row ──────────────────────────────────────────────────────────────────

function AdRow({ ad }: { ad: FBAd }) {
  const isActive = ad.status === "ACTIVE";
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{ad.name}</p>
        <p className="text-[11px] text-muted-foreground">ID: {ad.id}</p>
      </div>
      <Badge
        variant="outline"
        className={
          isActive
            ? "bg-success/15 text-success border-success/30"
            : "bg-muted text-muted-foreground"
        }
      >
        {ad.status}
      </Badge>
    </div>
  );
}

// ── Create Campaign Modal ───────────────────────────────────────────────────

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  externalId: string | null;
  fbToken: string | null;
  onCreated: () => void;
}

function CreateCampaignModal({
  open,
  onOpenChange,
  externalId,
  fbToken,
  onCreated,
}: CreateCampaignModalProps) {
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("OUTCOME_TRAFFIC");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setObjective("OUTCOME_TRAFFIC");
    }
  }, [open]);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    if (!fbToken || !externalId) {
      toast.error("Facebook account not connected");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createCampaign(fbToken, externalId, name.trim(), objective);
      toast.success(`Campaign created (ID: ${result.id})`);
      onOpenChange(false);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create campaign</DialogTitle>
          <DialogDescription>
            Creates a new PAUSED campaign in your Facebook Ad Account via the Marketing API.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="camp-name">Campaign name</Label>
            <Input
              id="camp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Summer Sale — Traffic"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="camp-obj">Objective</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger id="camp-obj">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FB_OBJECTIVES.map((obj) => (
                  <SelectItem key={obj} value={obj}>
                    {obj.replace(/^OUTCOME_/, "").replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting} className="bg-gradient-primary">
            <Plus className="mr-1.5 h-4 w-4" />
            Create campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
