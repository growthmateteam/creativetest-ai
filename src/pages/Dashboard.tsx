import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Grid3x3,
  Plug,
  Activity,
  History,
  Upload as UploadIcon,
  Rocket,
  Layers,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Placeholder data — wire to backend in later prompts
const adAccounts: Array<{
  id: string;
  name: string;
  bm: string;
  status: "connected" | "expiring" | "disconnected";
  campaigns: number;
}> = [];

const activity: Array<{
  id: string;
  type: "upload" | "launch" | "template" | "team";
  text: string;
  timestamp: string;
}> = [];

const launches: Array<{
  id: string;
  date: string;
  launchedBy: string;
  account: string;
  campaign: string;
  ads: number;
  status: "success" | "partial" | "failed";
}> = [];

const statusStyles: Record<string, string> = {
  connected: "bg-success/15 text-success border-success/30",
  expiring: "bg-warning/15 text-warning border-warning/30",
  disconnected: "bg-destructive/15 text-destructive border-destructive/30",
  success: "bg-success/15 text-success border-success/30",
  partial: "bg-warning/15 text-warning border-warning/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusLabel: Record<string, string> = {
  connected: "Connected",
  expiring: "Token expiring",
  disconnected: "Disconnected",
  success: "Success",
  partial: "Partial",
  failed: "Failed",
};

const activityIcons = {
  upload: UploadIcon,
  launch: Rocket,
  template: Layers,
  team: UserPlus,
};

export default function Dashboard() {
  const { user } = useAuth();
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's a snapshot of your agency activity.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Connected Ad Accounts */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Connected ad accounts
            </h2>
            <Button variant="outline" size="sm">
              <Plug className="mr-1.5 h-4 w-4" />
              Connect account
            </Button>
          </div>

          {adAccounts.length === 0 ? (
            <EmptyState
              icon={Grid3x3}
              title="No ad accounts connected yet"
              description="Connect your first Facebook ad account to start launching campaigns."
              action={
                <Button className="bg-gradient-primary">
                  <Plug className="mr-1.5 h-4 w-4" />
                  Connect your first account
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {adAccounts.map((acc) => (
                <Card key={acc.id} className="border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{acc.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={statusStyles[acc.status]}
                      >
                        {statusLabel[acc.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm text-muted-foreground">
                    <p>BM: {acc.bm}</p>
                    <p>{acc.campaigns} campaigns</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Team Activity Feed */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Team activity
          </h2>
          <Card className="border-border/60">
            <CardContent className="p-0">
              {activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground/60" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No activity yet
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {activity.map((item) => {
                    const Icon = activityIcons[item.type];
                    return (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{item.text}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.timestamp}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Recent Launch Sessions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Recent launch sessions
        </h2>
        <Card className="border-border/60">
          {launches.length === 0 ? (
            <EmptyState
              icon={History}
              title="No launches yet"
              description="Start your first upload to see launch sessions here."
              action={
                <Button className="bg-gradient-primary">
                  <UploadIcon className="mr-1.5 h-4 w-4" />
                  Start your first upload
                </Button>
              }
              bare
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Launched by</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Ads</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {launches.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.date}</TableCell>
                    <TableCell>{l.launchedBy}</TableCell>
                    <TableCell>{l.account}</TableCell>
                    <TableCell>{l.campaign}</TableCell>
                    <TableCell className="text-right">{l.ads}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[l.status]}
                      >
                        {statusLabel[l.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  bare?: boolean;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  bare,
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );

  if (bare) return content;
  return (
    <Card className="border-dashed border-border/60 bg-card/30">
      {content}
    </Card>
  );
}
