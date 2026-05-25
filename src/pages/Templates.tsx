import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
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

interface AdAccount {
  id: string;
  name: string;
  bm_name: string | null;
}

interface Template {
  id: string;
  name: string;
  account_id: string;
  created_by: string | null;
  updated_at: string;
}

export default function Templates() {
  const { role, user } = useAuth();
  const canManage = role === "admin" || role === "manager";

  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [creators, setCreators] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAccountId, setNewAccountId] = useState<string>("");

  const [accountOpen, setAccountOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountBm, setAccountBm] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const [accRes, tplRes] = await Promise.all([
      supabase.from("ad_accounts").select("id, name, bm_name").order("name"),
      supabase
        .from("templates")
        .select("id, name, account_id, created_by, updated_at")
        .order("updated_at", { ascending: false }),
    ]);
    if (accRes.error) toast.error(accRes.error.message);
    if (tplRes.error) toast.error(tplRes.error.message);
    setAccounts(accRes.data ?? []);
    setTemplates(tplRes.data ?? []);

    const ids = Array.from(new Set((tplRes.data ?? []).map((t) => t.created_by).filter(Boolean) as string[]));
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, name, email").in("id", ids);
      const map: Record<string, string> = {};
      for (const p of profiles ?? []) map[p.id] = p.name ?? p.email;
      setCreators(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? templates : templates.filter((t) => t.account_id === filter)),
    [filter, templates],
  );

  const accountName_ = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const createAccount = async () => {
    if (!accountName.trim()) {
      toast.error("Account name is required");
      return;
    }
    const { error } = await supabase.from("ad_accounts").insert({
      name: accountName.trim().slice(0, 120),
      bm_name: accountBm.trim().slice(0, 120) || null,
      created_by: user?.id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ad account created");
    setAccountOpen(false);
    setAccountName("");
    setAccountBm("");
    loadAll();
  };

  const createTemplate = async () => {
    if (!newName.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!newAccountId) {
      toast.error("Choose an ad account");
      return;
    }
    const { data, error } = await supabase
      .from("templates")
      .insert({
        name: newName.trim().slice(0, 120),
        account_id: newAccountId,
        created_by: user?.id,
      })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewOpen(false);
    setNewName("");
    setNewAccountId("");
    window.location.assign(`/templates/${data.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable campaign, adset, and ad templates scoped per ad account.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-56">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by ad account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ad accounts</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canManage && (
            <>
              <Button variant="outline" onClick={() => setAccountOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Ad account
              </Button>
              <Button
                className="bg-gradient-primary"
                onClick={() => {
                  if (accounts.length === 0) {
                    toast.error("Create an ad account first");
                    return;
                  }
                  setNewAccountId(filter !== "all" ? filter : accounts[0].id);
                  setNewOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Create template
              </Button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold">
              No templates yet for this account
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first template to start launching ads faster.
            </p>
            {canManage && accounts.length > 0 && (
              <Button
                className="mt-5 bg-gradient-primary"
                onClick={() => {
                  setNewAccountId(filter !== "all" ? filter : accounts[0].id);
                  setNewOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Create your first template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.id} className="border-border/60 transition-smooth hover:border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{accountName_(t.account_id)}</p>
                <p className="text-xs">
                  Modified {formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}
                  {t.created_by && creators[t.created_by] ? ` · by ${creators[t.created_by]}` : ""}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                  <Link to={`/templates/${t.id}`}>
                    <Pencil className="mr-1.5 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create template */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create template</DialogTitle>
            <DialogDescription>
              Name your template and pick the ad account it belongs to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-name">Template name</Label>
              <Input
                id="tpl-name"
                value={newName}
                maxLength={120}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Q1 Lead Gen — Standard"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ad account</Label>
              <Select value={newAccountId} onValueChange={setNewAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-primary" onClick={createTemplate}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create ad account */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add ad account</DialogTitle>
            <DialogDescription>
              Quick-add an ad account so templates have somewhere to live. Full account management comes later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="acc-name">Account name</Label>
              <Input
                id="acc-name"
                value={accountName}
                maxLength={120}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Acme Co — US"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-bm">Business Manager (optional)</Label>
              <Input
                id="acc-bm"
                value={accountBm}
                maxLength={120}
                onChange={(e) => setAccountBm(e.target.value)}
                placeholder="Acme BM"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-primary" onClick={createAccount}>
              Add account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
