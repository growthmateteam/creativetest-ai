import { useMemo, useState } from "react";
import {
  CreditCard,
  Building2,
  User,
  Bell,
  Receipt,
  Plug,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { PlanUsageTab } from "@/components/settings/PlanUsageTab";
import { WorkspaceTab } from "@/components/settings/WorkspaceTab";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { BillingTab } from "@/components/settings/BillingTab";
import { ConnectedAccountsTab } from "@/components/settings/ConnectedAccountsTab";
import { DangerZoneTab } from "@/components/settings/DangerZoneTab";

type TabId =
  | "plan"
  | "workspace"
  | "profile"
  | "notifications"
  | "billing"
  | "connected"
  | "danger";

type Role = "admin" | "manager" | "assistant";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const TABS: TabDef[] = [
  { id: "plan", label: "Plan & Usage", icon: CreditCard, roles: ["admin", "manager"] },
  { id: "workspace", label: "Workspace", icon: Building2, roles: ["admin"] },
  { id: "profile", label: "Profile", icon: User, roles: ["admin", "manager", "assistant"] },
  { id: "notifications", label: "Notifications", icon: Bell, roles: ["admin", "manager", "assistant"] },
  { id: "billing", label: "Billing", icon: Receipt, roles: ["admin", "manager"] },
  { id: "connected", label: "Connected Accounts", icon: Plug, roles: ["admin", "manager"] },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, roles: ["admin"] },
];

export default function Settings() {
  const { role } = useAuth();
  const visible = useMemo(
    () => TABS.filter((t) => !role || t.roles.includes(role as Role)),
    [role],
  );
  const [active, setActive] = useState<TabId>(visible[0]?.id ?? "profile");

  const renderTab = () => {
    switch (active) {
      case "plan":
        return <PlanUsageTab />;
      case "workspace":
        return <WorkspaceTab />;
      case "profile":
        return <ProfileTab />;
      case "notifications":
        return <NotificationsTab />;
      case "billing":
        return <BillingTab />;
      case "connected":
        return <ConnectedAccountsTab />;
      case "danger":
        return <DangerZoneTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace, plan, and personal preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <nav className="md:sticky md:top-4 md:self-start">
          <ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
            {visible.map((tab) => {
              const isActive = active === tab.id;
              const isDanger = tab.id === "danger";
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={cn(
                      "flex w-full items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? isDanger
                          ? "bg-destructive/10 text-destructive font-medium"
                          : "bg-sidebar-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      isDanger && !isActive && "text-destructive/80 hover:text-destructive",
                    )}
                  >
                    <tab.icon className="h-4 w-4 shrink-0" />
                    <span className="text-left">{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">{renderTab()}</div>
      </div>
    </div>
  );
}
