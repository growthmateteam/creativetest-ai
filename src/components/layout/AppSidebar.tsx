import { Home, Grid3x3, Upload, Layers, ListChecks, Users, Settings, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/hooks/useWorkspace";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Ad Accounts", url: "/ad-accounts", icon: Grid3x3 },
  { title: "Upload", url: "/upload", icon: Upload, highlight: true },
  { title: "Templates", url: "/templates", icon: Layers },
  { title: "Launch Log", url: "/launch-log", icon: ListChecks },
  { title: "Team", url: "/team", icon: Users, hideForAssistant: true },
  { title: "Billing", url: "/billing", icon: CreditCard, hideForAssistant: true },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, role, signOut } = useAuth();
  const { data: workspace } = useWorkspace();
  const visibleNav = navItems.filter((i) => !(i.hideForAssistant && role === "assistant"));
  const displayName = (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || user?.email || "User";
  const initials = displayName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "No role";
  const workspaceName = workspace?.name || "CreativeTest.ai";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-primary shadow-glow">
            {workspace?.logo_url ? (
              <img src={workspace.logo_url} alt={workspaceName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary-foreground">
                {workspaceName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {!collapsed && (
            <span className="truncate text-base font-semibold tracking-tight">
              {workspace?.name ? (
                workspaceName
              ) : (
                <>
                  CreativeTest<span className="bg-gradient-primary bg-clip-text text-transparent">.ai</span>
                </>
              )}
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      "h-10",
                      item.highlight &&
                        "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 data-[active=true]:bg-gradient-primary",
                    )}
                  >
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-md transition-smooth",
                        !item.highlight && "text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                      activeClassName={
                        item.highlight ? "" : "bg-sidebar-accent text-foreground font-medium"
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <Badge variant="secondary" className="mt-0.5 h-4 px-1.5 text-[10px] font-medium">
                  {roleLabel}
                </Badge>
              </div>
            </div>
            <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <Button onClick={signOut} variant="ghost" size="icon" className="mx-auto text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
