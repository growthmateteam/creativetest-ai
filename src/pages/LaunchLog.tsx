import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  History,
  X,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

type LaunchStatus = "pending" | "success" | "partial" | "failed";

interface LaunchRow {
  id: string;
  launched_by: string;
  account_id: string;
  campaign_name: string;
  adset_names: string[];
  ad_count: number;
  status: LaunchStatus;
  settings_snapshot: Record<string, unknown>;
  error_log: Record<string, unknown> | null;
  created_at: string;
}

const statusStyles: Record<LaunchStatus, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  success: "bg-success/15 text-success border-success/30",
  partial: "bg-warning/15 text-warning border-warning/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusLabel: Record<LaunchStatus, string> = {
  pending: "Pending",
  success: "Success",
  partial: "Partial",
  failed: "Failed",
};

export default function LaunchLog() {
  const [rows, setRows] = useState<LaunchRow[]>([]);
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Filters
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [logsRes, accRes] = await Promise.all([
        supabase
          .from("launch_logs")
          .select(
            "id, launched_by, account_id, campaign_name, adset_names, ad_count, status, settings_snapshot, error_log, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase.from("ad_accounts").select("id, name"),
      ]);
      if (logsRes.error) toast.error(logsRes.error.message);

      const logs = (logsRes.data ?? []) as unknown as LaunchRow[];
      setRows(logs);
      setAccounts(Object.fromEntries((accRes.data ?? []).map((a) => [a.id, a.name])));

      const userIds = Array.from(new Set(logs.map((r) => r.launched_by).filter(Boolean)));
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds);
        setUsers(Object.fromEntries((profiles ?? []).map((p) => [p.id, p.name ?? p.email])));
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (accountFilter !== "all" && r.account_id !== accountFilter) return false;
      if (userFilter !== "all" && r.launched_by !== userFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (dateRange?.from && new Date(r.created_at) < dateRange.from) return false;
      if (dateRange?.to) {
        const end = new Date(dateRange.to);
        end.setHours(23, 59, 59, 999);
        if (new Date(r.created_at) > end) return false;
      }
      return true;
    });
  }, [rows, accountFilter, userFilter, statusFilter, dateRange]);

  const clearFilters = () => {
    setAccountFilter("all");
    setUserFilter("all");
    setStatusFilter("all");
    setDateRange(undefined);
  };

  const hasFilters =
    accountFilter !== "all" || userFilter !== "all" || statusFilter !== "all" || !!dateRange;

  const accountOptions = Object.entries(accounts);
  const userOptions = Object.entries(users);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Launch Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          History of every launch — who, what, when, and the result.
        </p>
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="space-y-1.5">
            <Label className="text-xs">Date range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL d, y")} –{" "}
                        {format(dateRange.to, "LLL d, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL d, y")
                    )
                  ) : (
                    "Any date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Account</Label>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {accountOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Launched by</Label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Anyone</SelectItem>
                {userOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" /> Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        {loading ? (
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading…
          </CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <History className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold">
              {rows.length === 0 ? "No launches yet" : "No launches match these filters"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {rows.length === 0
                ? "Upload your first batch of ads to see launches here."
                : "Try adjusting or clearing the filters above."}
            </p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Date / Time</TableHead>
                <TableHead>Launched by</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Adsets</TableHead>
                <TableHead className="text-right">Ads</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const isOpen = expanded === r.id;
                return (
                  <>
                    <TableRow
                      key={r.id}
                      className="cursor-pointer"
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                    >
                      <TableCell>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(r.created_at), "MMM d, yyyy · HH:mm")}
                      </TableCell>
                      <TableCell>{users[r.launched_by] ?? "—"}</TableCell>
                      <TableCell>{accounts[r.account_id] ?? "—"}</TableCell>
                      <TableCell>{r.campaign_name}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {r.adset_names.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{r.ad_count}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[r.status]}>
                          {statusLabel[r.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow key={`${r.id}-expanded`}>
                        <TableCell colSpan={8} className="bg-muted/20">
                          <ExpandedDetails row={r} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function ExpandedDetails({ row }: { row: LaunchRow }) {
  const settings = row.settings_snapshot ?? {};
  const ads = (settings as { ads?: Array<{ name: string; thumbnail?: string; adset?: string }> })
    .ads ?? [];

  return (
    <div className="space-y-4 py-3">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Adsets
        </p>
        <div className="flex flex-wrap gap-1.5">
          {row.adset_names.length === 0 ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            row.adset_names.map((a) => (
              <Badge key={a} variant="outline" className="bg-card">
                {a}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ads ({row.ad_count})
        </p>
        {ads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No per-ad detail recorded for this launch.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {ads.map((ad, i) => (
              <div
                key={`${ad.name}-${i}`}
                className="rounded-md border border-border/60 bg-card p-2"
              >
                <div className="aspect-square overflow-hidden rounded bg-muted">
                  {ad.thumbnail ? (
                    <img
                      src={ad.thumbnail}
                      alt={ad.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No preview
                    </div>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 break-all text-[11px] text-foreground">
                  {ad.name}
                </p>
                {ad.adset && (
                  <p className="text-[10px] text-muted-foreground">{ad.adset}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Settings snapshot
        </p>
        <pre className="max-h-64 overflow-auto rounded-md border border-border/60 bg-background/50 p-3 text-[11px] text-muted-foreground">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>

      {row.error_log && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-destructive">
            Errors
          </p>
          <pre className="max-h-48 overflow-auto rounded-md border border-destructive/30 bg-destructive/10 p-3 text-[11px] text-destructive">
            {JSON.stringify(row.error_log, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
