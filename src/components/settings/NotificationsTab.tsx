import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NOTIFICATION_EVENTS, NotificationEventType } from "@/lib/timezones";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PrefRow {
  event_type: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
}

type PrefMap = Record<NotificationEventType, { email: boolean; inApp: boolean }>;

const defaultPrefs = (): PrefMap =>
  Object.fromEntries(
    NOTIFICATION_EVENTS.map((e) => [
      e.type,
      { email: e.emailSupported, inApp: true },
    ]),
  ) as PrefMap;

export function NotificationsTab() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<PrefMap>(defaultPrefs());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("notification_prefs")
        .select("event_type, email_enabled, in_app_enabled")
        .eq("user_id", user.id);
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      const next = defaultPrefs();
      (data as PrefRow[] | null)?.forEach((row) => {
        if (row.event_type in next) {
          next[row.event_type as NotificationEventType] = {
            email: row.email_enabled,
            inApp: row.in_app_enabled,
          };
        }
      });
      setPrefs(next);
      setLoading(false);
    };
    load();
  }, [user]);

  const setPref = (
    event: NotificationEventType,
    channel: "email" | "inApp",
    value: boolean,
  ) => {
    setPrefs((p) => ({ ...p, [event]: { ...p[event], [channel]: value } }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const rows = NOTIFICATION_EVENTS.map((e) => ({
      user_id: user.id,
      event_type: e.type,
      email_enabled: e.emailSupported ? prefs[e.type].email : false,
      in_app_enabled: prefs[e.type].inApp,
    }));
    const { error } = await supabase
      .from("notification_prefs")
      .upsert(rows, { onConflict: "user_id,event_type" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Preferences saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose how you want to be notified for each event.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="w-24 text-center">Email</TableHead>
                  <TableHead className="w-24 text-center">In-App</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {NOTIFICATION_EVENTS.map((e) => (
                  <TableRow key={e.type}>
                    <TableCell className="font-medium">{e.label}</TableCell>
                    <TableCell className="text-center">
                      {e.emailSupported ? (
                        <Switch
                          checked={prefs[e.type].email}
                          onCheckedChange={(v) => setPref(e.type, "email", v)}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={prefs[e.type].inApp}
                        onCheckedChange={(v) => setPref(e.type, "inApp", v)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save preferences
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
