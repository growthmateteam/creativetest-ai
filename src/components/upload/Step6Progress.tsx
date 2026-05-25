import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  Rocket,
  XCircle,
  Clock,
} from "lucide-react";
import { LaunchAdProgress, LaunchAdStatus, UploadWizardState } from "@/lib/upload-types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Step6Props {
  state: UploadWizardState;
  onReset: () => void;
}

const STATUS_LABEL: Record<LaunchAdStatus, string> = {
  pending: "Pending",
  uploading: "Uploading",
  success: "Success",
  failed: "Failed",
};

export function Step6Progress({ state, onReset }: Step6Props) {
  const { user } = useAuth();
  const ready = useMemo(() => state.files.filter((f) => f.status === "ready"), [state.files]);
  const [items, setItems] = useState<LaunchAdProgress[]>(() =>
    ready.map((f) => ({
      fileId: f.id,
      name: f.name,
      adset: state.assignments[f.id] ?? "—",
      status: "pending" as LaunchAdStatus,
    })),
  );
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void runLaunch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runLaunch = async () => {
    // Simulate per-ad upload with small delays — replace with real FB API later.
    const failed: LaunchAdProgress[] = [];
    for (let i = 0; i < items.length; i++) {
      setItems((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: "uploading" } : p)),
      );
      await new Promise((r) => setTimeout(r, 350));
      // 95% success simulation
      const ok = Math.random() > 0.05;
      setItems((prev) =>
        prev.map((p, idx) =>
          idx === i
            ? {
                ...p,
                status: ok ? "success" : "failed",
                error: ok ? undefined : "Simulated API error",
              }
            : p,
        ),
      );
      if (!ok) failed.push({ ...items[i], status: "failed" });
    }
    setDone(true);

    // Persist launch record + session
    try {
      if (!user || !state.accountId) return;
      const successCount = items.length - failed.length;
      const status =
        failed.length === 0 ? "success" : failed.length === items.length ? "failed" : "partial";
      const adsArray = items.map((it) => ({ name: it.name, adset: it.adset }));

      await supabase.from("launch_logs").insert({
        launched_by: user.id,
        account_id: state.accountId,
        campaign_name: state.campaignName,
        adset_names: state.adsets,
        ad_count: successCount,
        settings_snapshot: JSON.parse(
          JSON.stringify({ ...state.settings, ads: adsArray, templateId: state.templateId }),
        ),
        status,
        error_log:
          failed.length > 0
            ? (JSON.parse(JSON.stringify({ failed })) as never)
            : null,
      });

      if (state.sessionId) {
        await supabase
          .from("upload_sessions")
          .update({
            status: status === "failed" ? "failed" : "completed",
            completed_at: new Date().toISOString(),
            error_log:
              failed.length > 0
                ? (JSON.parse(JSON.stringify({ failed })) as never)
                : null,
          })
          .eq("id", state.sessionId);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Couldn't record launch: ${msg}`);
    }
  };

  const successCount = items.filter((i) => i.status === "success").length;
  const failedCount = items.filter((i) => i.status === "failed").length;
  const pct = items.length === 0 ? 0 : Math.round(((successCount + failedCount) / items.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launching to Facebook Ads Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {successCount + failedCount} of {items.length}
            </span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        <ul className="max-h-[420px] space-y-1.5 overflow-y-auto">
          {items.map((it) => (
            <li
              key={it.fileId}
              className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 break-all text-sm">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.adset}</p>
              </div>
              <StatusPill status={it.status} />
            </li>
          ))}
        </ul>

        {done && (
          <div className="rounded-lg border border-primary/40 bg-gradient-glow p-4 text-center">
            <Rocket className="mx-auto h-7 w-7 text-primary" />
            <h3 className="mt-2 text-base font-semibold">
              {failedCount === 0
                ? `Launch complete — ${successCount} ads sent to Ads Manager`
                : `Partial launch — ${successCount} sent, ${failedCount} failed`}
            </h3>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline">
                <Link to="/launch-log">View launch log</Link>
              </Button>
              <Button className="bg-gradient-primary" onClick={onReset}>
                Start new upload
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: LaunchAdStatus }) {
  const styles: Record<LaunchAdStatus, string> = {
    pending: "bg-muted text-muted-foreground",
    uploading: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    failed: "bg-destructive/15 text-destructive",
  };
  const Icon =
    status === "success"
      ? CheckCircle2
      : status === "failed"
        ? XCircle
        : status === "uploading"
          ? Loader2
          : Clock;
  return (
    <Badge variant="outline" className={styles[status] + " gap-1"}>
      <Icon className={`h-3 w-3 ${status === "uploading" ? "animate-spin" : ""}`} />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
