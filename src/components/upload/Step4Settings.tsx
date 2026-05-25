import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { UploadWizardState } from "@/lib/upload-types";
import { AdSettings } from "@/lib/template-defaults";

interface Step4Props {
  state: UploadWizardState;
  onChange: (patch: Partial<UploadWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  showValidation?: boolean;
}

const REQUIRED: (keyof AdSettings)[] = ["headline", "primaryText", "destinationUrl"];

export function Step4Settings({ state, onChange, onNext, onBack, showValidation }: Step4Props) {
  const s = state.settings;
  const set = (patch: Partial<AdSettings>) =>
    onChange({ settings: { ...s, ...patch } });

  const missing = (k: keyof AdSettings) =>
    showValidation && REQUIRED.includes(k) && !String(s[k] ?? "").trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad settings</CardTitle>
        {state.templateId && (
          <p className="text-xs text-muted-foreground">
            Pre-filled from template — fields are editable.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Headline *" error={missing("headline")}>
            <Input
              value={s.headline}
              maxLength={255}
              onChange={(e) => set({ headline: e.target.value })}
              className={cn(missing("headline") && "border-destructive")}
            />
          </Field>
          <Field label="Description">
            <Input
              value={s.description}
              maxLength={255}
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Primary text *" error={missing("primaryText")}>
          <Textarea
            value={s.primaryText}
            maxLength={2000}
            rows={4}
            onChange={(e) => set({ primaryText: e.target.value })}
            className={cn(missing("primaryText") && "border-destructive")}
          />
        </Field>
        <Field label="Destination URL *" error={missing("destinationUrl")}>
          <Input
            value={s.destinationUrl}
            maxLength={2048}
            onChange={(e) => set({ destinationUrl: e.target.value })}
            placeholder="https://example.com/landing"
            className={cn(missing("destinationUrl") && "border-destructive")}
          />
        </Field>
        <ToggleRow
          label="URL parameters — Using HubSpot or HiRose CRM?"
          checked={s.urlParametersEnabled}
          onChange={(v) => set({ urlParametersEnabled: v })}
        />
        {s.urlParametersEnabled && (
          <Field label="UTM parameters">
            <Input
              value={s.utmParameters}
              maxLength={500}
              onChange={(e) => set({ utmParameters: e.target.value })}
              placeholder="utm_source=facebook&utm_medium=paid"
            />
          </Field>
        )}

        <div>
          <Label className="mb-2 block">Enhancements</Label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {(
              [
                ["multiAdvertiserAds", "Multi-advertiser Ads"],
                ["sitelinks", "Sitelinks"],
                ["optimizeWebsiteDestination", "Optimize Website Destination"],
                ["textImprovements", "Text Improvements"],
                ["addSubtitles", "Add Subtitles"],
                ["videoTouchups", "Video Touchups"],
                ["relevantComments", "Relevant Comments"],
                ["enhancedCta", "Enhanced CTA"],
                ["addVideoEffects", "Add Video Effects"],
              ] as const
            ).map(([key, label]) => (
              <ToggleRow
                key={key}
                label={label}
                checked={s.enhancements[key]}
                onChange={(v) =>
                  set({ enhancements: { ...s.enhancements, [key]: v } })
                }
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button className="bg-gradient-primary" onClick={onNext}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn(error && "text-destructive")}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">Required</p>}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
