import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Rocket } from "lucide-react";
import { UploadWizardState } from "@/lib/upload-types";
import { AdSettings } from "@/lib/template-defaults";

interface Step5Props {
  state: UploadWizardState;
  onLaunch: () => void;
  onBack: () => void;
}

const REQUIRED: (keyof AdSettings)[] = ["headline", "primaryText", "destinationUrl"];

export function Step5Review({ state, onLaunch, onBack }: Step5Props) {
  const ready = state.files.filter((f) => f.status === "ready");
  const missing = REQUIRED.filter((k) => !String(state.settings[k] ?? "").trim());
  const totalAds = ready.length;
  const isLargeBatch = totalAds > 25;
  const canLaunch = missing.length === 0 && totalAds > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Review</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stat label="Total ads" value={totalAds.toString()} />
          <Stat label="Adsets" value={state.adsets.length.toString()} />
          <Stat label="Template" value={state.templateId ? "Applied" : "None"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adset assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {state.adsets.map((a) => {
              const count = Object.values(state.assignments).filter((v) => v === a).length;
              return (
                <li
                  key={a}
                  className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span>{a}</span>
                  <Badge variant="outline" className="bg-card">
                    {count} {count === 1 ? "ad" : "ads"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settings summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <SummaryRow label="Headline" value={state.settings.headline} required />
          <SummaryRow label="Description" value={state.settings.description} />
          <SummaryRow label="Primary text" value={state.settings.primaryText} required truncate />
          <SummaryRow label="Destination URL" value={state.settings.destinationUrl} required />
          {state.settings.urlParametersEnabled && (
            <SummaryRow label="UTM" value={state.settings.utmParameters} />
          )}
        </CardContent>
      </Card>

      {missing.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Missing required fields: {missing.join(", ")}. Go back to step 4 to complete them.
          </span>
        </div>
      )}

      {isLargeBatch && (
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>
            This batch may hit Facebook API rate limits. The upload will auto-retry if needed.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          className="w-full bg-gradient-primary shadow-glow sm:w-auto sm:flex-1"
          onClick={onLaunch}
          disabled={!canLaunch}
        >
          <Rocket className="mr-2 h-5 w-5" />
          Send to Facebook Ads Manager
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  required,
  truncate,
}: {
  label: string;
  value: string;
  required?: boolean;
  truncate?: boolean;
}) {
  const empty = !value?.trim();
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      {empty ? (
        <span
          className={
            required
              ? "text-destructive"
              : "text-muted-foreground italic"
          }
        >
          {required ? "Missing" : "—"}
        </span>
      ) : (
        <span className={truncate ? "line-clamp-2 text-right" : "text-right"}>
          <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-success" />
          {value}
        </span>
      )}
    </div>
  );
}
