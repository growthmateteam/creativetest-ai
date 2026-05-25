import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Plus, Trash2, UserCog, Users, Clock, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "admin" | "manager" | "assistant";

interface AdAccount {
  id: string;
  name: string;
}

interface MemberRow {
  user_id: string;
  name: string;
  email: string;
  role: AppRole;
  invited_by_name: string | null;
  created_at: string;
  account_ids: string[];
}

interface InviteRow {
  id: string;
  email: string;
  name: string | null;
  role: AppRole;
  account_ids: string[];
  invited_by_name: string | null;
  created_at: string;
  status: "pending" | "accepted" | "revoked";
}

const roleStyles: Record<AppRole, string> = {
  admin: "bg-primary/15 text-primary border-primary/30",
  manager: "bg-secondary/20 text-secondary border-secondary/30",
  assistant: "bg-muted text-muted-foreground border-border",
};

const roleLabel: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  assistant: "Assistant",
};

export default function Team() {
  const { user, role } = useAuth();
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MemberRow | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MemberRow | null>(null);

  const isManager = role === "manager" || role === "admin";
  const isAdmin = role === "admin";

  useEffect(() => {
    if (role === "assistant") return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const load = async () => {
    setLoading(true);
    try {
      const [accRes, profilesRes, rolesRes, accessRes, invitesRes] = await Promise.all([
        supabase.from("ad_accounts").select("id, name").order("name"),
        supabase.from("profiles").select("id, name, email, invited_by, created_at"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("user_account_access").select("user_id, account_id"),
        supabase
          .from("team_invites")
          .select("id, email, name, role, account_ids, invited_by, created_at, status")
          .order("created_at", { ascending: false }),
      ]);

      if (accRes.error) throw accRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (accessRes.error) throw accessRes.error;
      if (invitesRes.error) throw invitesRes.error;

      const accs = (accRes.data ?? []) as AdAccount[];
      setAccounts(accs);

      const profileMap = new Map(
        (profilesRes.data ?? []).map((p) => [p.id, p]),
      );
      const roleMap = new Map(
        (rolesRes.data ?? []).map((r) => [r.user_id, r.role as AppRole]),
      );
      const accessMap = new Map<string, string[]>();
      (accessRes.data ?? []).forEach((a) => {
        const list = accessMap.get(a.user_id) ?? [];
        list.push(a.account_id);
        accessMap.set(a.user_id, list);
      });

      const memberRows: MemberRow[] = (profilesRes.data ?? [])
        .filter((p) => roleMap.has(p.id))
        .map((p) => ({
          user_id: p.id,
          name: p.name ?? p.email,
          email: p.email,
          role: roleMap.get(p.id)!,
          invited_by_name: p.invited_by ? profileMap.get(p.invited_by)?.name ?? null : null,
          created_at: p.created_at,
          account_ids: accessMap.get(p.id) ?? [],
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setMembers(memberRows);

      const inviteRows: InviteRow[] = (invitesRes.data ?? []).map((i) => ({
        id: i.id,
        email: i.email,
        name: i.name,
        role: i.role as AppRole,
        account_ids: (i.account_ids as string[]) ?? [],
        invited_by_name: profileMap.get(i.invited_by)?.name ?? null,
        created_at: i.created_at,
        status: i.status as "pending" | "accepted" | "revoked",
      }));
      setInvites(inviteRows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load team";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const accountNameById = useMemo(() => {
    const m = new Map<string, string>();
    accounts.forEach((a) => m.set(a.id, a.name));
    return m;
  }, [accounts]);

  if (role === "assistant") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ShieldAlert className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Team page is not available</h2>
            <p className="text-sm text-muted-foreground">
              Only Admins and Managers can manage team members.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingInvites = invites.filter((i) => i.status === "pending");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage workspace members, roles, and ad-account access.
          </p>
        </div>
        {isManager && (
          <Button onClick={() => setInviteOpen(true)} className="bg-gradient-primary">
            <Plus className="mr-1.5 h-4 w-4" />
            Invite Team Member
          </Button>
        )}
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">Loading…</p>
          ) : members.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No team members yet. Invite your first teammate.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Accounts Assigned</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.user_id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleStyles[m.role]}>
                        {roleLabel[m.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.role === "admin" ? (
                        <span className="text-xs text-muted-foreground">All accounts</span>
                      ) : m.account_ids.length === 0 ? (
                        <span className="text-xs text-muted-foreground">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {m.account_ids.slice(0, 3).map((id) => (
                            <Badge key={id} variant="secondary" className="text-[10px]">
                              {accountNameById.get(id) ?? "—"}
                            </Badge>
                          ))}
                          {m.account_ids.length > 3 && (
                            <Badge variant="secondary" className="text-[10px]">
                              +{m.account_ids.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.invited_by_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(m.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isManager && m.user_id !== user?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditTarget(m)}
                          >
                            <UserCog className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                        )}
                        {isAdmin && m.user_id !== user?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setRemoveTarget(m)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-secondary" />
              Pending invites ({pendingInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Accounts</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleStyles[i.role]}>
                        {roleLabel[i.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {i.account_ids.length} account{i.account_ids.length === 1 ? "" : "s"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {i.invited_by_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(i.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          const { error } = await supabase
                            .from("team_invites")
                            .update({ status: "revoked" })
                            .eq("id", i.id);
                          if (error) toast.error(error.message);
                          else {
                            toast.success("Invite revoked");
                            void load();
                          }
                        }}
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        accounts={accounts}
        onInvited={load}
      />

      {editTarget && (
        <EditMemberModal
          member={editTarget}
          accounts={accounts}
          onClose={() => setEditTarget(null)}
          onSaved={load}
        />
      )}

      {removeTarget && (
        <AlertDialog open onOpenChange={(o) => !o && setRemoveTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {removeTarget.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {removeTarget.name}? They will lose
                access immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  const target = removeTarget;
                  setRemoveTarget(null);
                  // Revoke role and account access (deactivates app access)
                  const { error: rolesErr } = await supabase
                    .from("user_roles")
                    .delete()
                    .eq("user_id", target.user_id);
                  if (rolesErr) {
                    toast.error(rolesErr.message);
                    return;
                  }
                  await supabase
                    .from("user_account_access")
                    .delete()
                    .eq("user_id", target.user_id);
                  toast.success(`${target.name} removed from workspace`);
                  void load();
                }}
              >
                Remove member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

/* ---------- Invite modal ---------- */

interface InviteModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  accounts: AdAccount[];
  onInvited: () => void;
}

function InviteModal({ open, onOpenChange, accounts, onInvited }: InviteModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("assistant");
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setInviteRole("assistant");
      setAccountIds([]);
    }
  }, [open]);

  const toggleAccount = (id: string) => {
    setAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const submit = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      const recipientEmail = email.trim().toLowerCase();
      const { data: invite, error } = await supabase
        .from("team_invites")
        .insert({
          email: recipientEmail,
          name: name.trim() || null,
          role: inviteRole,
          account_ids: accountIds,
          invited_by: user.id,
        })
        .select("id, token")
        .single();
      if (error) throw error;

      // Look up inviter's display name for the email
      const { data: inviterProfile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", user.id)
        .maybeSingle();
      const inviterName =
        inviterProfile?.name || inviterProfile?.email || "A teammate";

      const acceptUrl = `${window.location.origin}/login?invite=${invite.token}`;

      const { error: emailError } = await supabase.functions.invoke(
        "send-transactional-email",
        {
          body: {
            templateName: "team-invite",
            recipientEmail,
            idempotencyKey: `team-invite-${invite.id}`,
            templateData: {
              inviterName,
              recipientName: name.trim() || undefined,
              acceptUrl,
              role: roleLabel[inviteRole],
            },
          },
        },
      );
      if (emailError) {
        console.error("Email send failed", emailError);
        toast.warning(
          `Invite saved, but email couldn't be sent: ${emailError.message}`,
        );
      } else {
        toast.success(`Invite sent to ${recipientEmail}`);
      }
      onOpenChange(false);
      onInvited();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't send invite";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            They'll receive an email invitation to join CreativeTest.ai.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Name</Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Accounts</Label>
            {accounts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No ad accounts yet — add some on the Ad Accounts page.
              </p>
            ) : (
              <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
                {accounts.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={accountIds.includes(a.id)}
                      onCheckedChange={() => toggleAccount(a.id)}
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting} className="bg-gradient-primary">
            {submitting ? "Sending…" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Edit member modal ---------- */

interface EditMemberProps {
  member: MemberRow;
  accounts: AdAccount[];
  onClose: () => void;
  onSaved: () => void;
}

function EditMemberModal({ member, accounts, onClose, onSaved }: EditMemberProps) {
  const [newRole, setNewRole] = useState<AppRole>(member.role);
  const [accountIds, setAccountIds] = useState<string[]>(member.account_ids);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const toggleAccount = (id: string) => {
    setAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      // Update role
      if (newRole !== member.role) {
        const { error: roleErr } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", member.user_id);
        if (roleErr) throw roleErr;
      }
      // Replace account access
      const current = new Set(member.account_ids);
      const next = new Set(accountIds);
      const toAdd = accountIds.filter((id) => !current.has(id));
      const toRemove = member.account_ids.filter((id) => !next.has(id));

      if (toRemove.length > 0) {
        const { error } = await supabase
          .from("user_account_access")
          .delete()
          .eq("user_id", member.user_id)
          .in("account_id", toRemove);
        if (error) throw error;
      }
      if (toAdd.length > 0) {
        const { error } = await supabase.from("user_account_access").insert(
          toAdd.map((account_id) => ({
            user_id: member.user_id,
            account_id,
            granted_by: user?.id ?? null,
          })),
        );
        if (error) throw error;
      }
      toast.success("Access updated");
      onSaved();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't update access";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit access — {member.name}</DialogTitle>
          <DialogDescription>{member.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Account access</Label>
            {accounts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No ad accounts yet.</p>
            ) : (
              <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
                {accounts.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={accountIds.includes(a.id)}
                      onCheckedChange={() => toggleAccount(a.id)}
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-primary">
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
