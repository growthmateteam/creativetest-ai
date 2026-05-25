import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AdSettings,
  AdsetSettings,
  CampaignSettings,
  bidStrategyOptions,
  buyingTypeOptions,
  conversionLocationOptions,
  defaultAdSettings,
  defaultAdsetSettings,
  defaultCampaignSettings,
  objectiveOptions,
  performanceGoalOptions,
} from "@/lib/template-defaults";

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const canManage = role === "admin" || role === "manager";

  const [name, setName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [campaign, setCampaign] = useState<CampaignSettings>(defaultCampaignSettings);
  const [adset, setAdset] = useState<AdsetSettings>(defaultAdsetSettings);
  const [ad, setAd] = useState<AdSettings>(defaultAdSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("name, account_id, campaign_settings, adset_settings, ad_settings, ad_accounts(name)")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      if (!data) {
        toast.error("Template not found");
        navigate("/templates");
        return;
      }
      setName(data.name);
      const joined = data as unknown as { ad_accounts?: { name?: string } | null };
      setAccountName(joined.ad_accounts?.name ?? "");
      setCampaign({ ...defaultCampaignSettings, ...(data.campaign_settings as object) });
      setAdset({
        ...defaultAdsetSettings,
        ...(data.adset_settings as object),
        placements: {
          ...defaultAdsetSettings.placements,
          ...((data.adset_settings as { placements?: object })?.placements ?? {}),
        },
      });
      setAd({
        ...defaultAdSettings,
        ...(data.ad_settings as object),
        enhancements: {
          ...defaultAdSettings.enhancements,
          ...((data.ad_settings as { enhancements?: object })?.enhancements ?? {}),
        },
      });
      setLoading(false);
    })();
  }, [id, navigate]);

  const save = async () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("templates")
      .update({
        name: name.trim().slice(0, 120),
        campaign_settings: JSON.parse(JSON.stringify(campaign)),
        adset_settings: JSON.parse(JSON.stringify(adset)),
        ad_settings: JSON.parse(JSON.stringify(ad)),
      })
      .eq("id", id!);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Template saved");
    navigate("/templates");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading template…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/templates")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit template</h1>
            <p className="text-sm text-muted-foreground">{accountName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/templates")}>
            Cancel
          </Button>
          <Button className="bg-gradient-primary" onClick={save} disabled={!canManage || saving}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            Save template
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Template name</Label>
            <Input
              id="tpl-name"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              disabled={!canManage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaign Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Objective">
            <Select
              value={campaign.objective}
              onValueChange={(v) => setCampaign({ ...campaign, objective: v })}
              disabled={!canManage}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {objectiveOptions.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Buying type">
            <Select
              value={campaign.buyingType}
              onValueChange={(v) => setCampaign({ ...campaign, buyingType: v })}
              disabled={!canManage}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {buyingTypeOptions.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Budget type">
            <div className="inline-flex rounded-md border border-border bg-muted/40 p-1">
              {(["ABO", "CBO"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!canManage}
                  onClick={() => setCampaign({ ...campaign, budgetType: t })}
                  className={`rounded-sm px-4 py-1.5 text-sm font-medium transition-smooth ${
                    campaign.budgetType === t
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Bid strategy">
            <Select
              value={campaign.bidStrategy}
              onValueChange={(v) => setCampaign({ ...campaign, bidStrategy: v })}
              disabled={!canManage}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {bidStrategyOptions.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <ToggleRow
            label="Spending limit"
            checked={campaign.spendingLimit}
            onChange={(v) => setCampaign({ ...campaign, spendingLimit: v })}
            disabled={!canManage}
          />
        </CardContent>
      </Card>

      {/* Adset Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Adset settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Pixel ID">
            <Input
              value={adset.pixel}
              maxLength={64}
              onChange={(e) => setAdset({ ...adset, pixel: e.target.value })}
              placeholder="1234567890"
              disabled={!canManage}
            />
          </Field>
          <Field label="Performance goal">
            <Select
              value={adset.performanceGoal}
              onValueChange={(v) => setAdset({ ...adset, performanceGoal: v })}
              disabled={!canManage}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {performanceGoalOptions.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Conversion location">
            <Select
              value={adset.conversionLocation}
              onValueChange={(v) => setAdset({ ...adset, conversionLocation: v })}
              disabled={!canManage}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {conversionLocationOptions.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Conversion event">
            <Select
              value={adset.conversionEvent}
              onValueChange={(v) => setAdset({ ...adset, conversionEvent: v as "Schedule" | "Lead" })}
              disabled={!canManage}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Schedule">Schedule</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Attribution (locked default)" full>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 text-primary" />
              {adset.attribution}
            </div>
          </Field>
          <ToggleRow
            label="Set start / end date"
            checked={adset.scheduleEnabled}
            onChange={(v) => setAdset({ ...adset, scheduleEnabled: v })}
            disabled={!canManage}
          />
          <ToggleRow
            label="Advantage+ audience"
            checked={adset.advantagePlusAudience}
            onChange={(v) => setAdset({ ...adset, advantagePlusAudience: v })}
            disabled={!canManage}
          />
          <Field label="Location" full>
            <Input
              value={adset.location}
              maxLength={120}
              onChange={(e) => setAdset({ ...adset, location: e.target.value })}
              disabled={!canManage}
            />
          </Field>
          <Field label="Placements" full>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  ["facebook", "Facebook"],
                  ["instagram", "Instagram"],
                  ["audienceNetwork", "Audience Network"],
                  ["threads", "Threads"],
                  ["messenger", "Messenger"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={adset.placements[key]}
                    onCheckedChange={(v) =>
                      setAdset({
                        ...adset,
                        placements: { ...adset.placements, [key]: Boolean(v) },
                      })
                    }
                    disabled={!canManage}
                  />
                  {label}
                </label>
              ))}
            </div>
          </Field>
        </CardContent>
      </Card>

      {/* Ad Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Ad settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Headline">
              <Input
                value={ad.headline}
                maxLength={255}
                onChange={(e) => setAd({ ...ad, headline: e.target.value })}
                disabled={!canManage}
              />
            </Field>
            <Field label="Description">
              <Input
                value={ad.description}
                maxLength={255}
                onChange={(e) => setAd({ ...ad, description: e.target.value })}
                disabled={!canManage}
              />
            </Field>
          </div>
          <Field label="Primary text">
            <Textarea
              rows={4}
              value={ad.primaryText}
              maxLength={2000}
              onChange={(e) => setAd({ ...ad, primaryText: e.target.value })}
              disabled={!canManage}
            />
          </Field>
          <Field label="Destination URL">
            <Input
              value={ad.destinationUrl}
              maxLength={2048}
              onChange={(e) => setAd({ ...ad, destinationUrl: e.target.value })}
              placeholder="https://example.com/landing"
              disabled={!canManage}
            />
          </Field>
          <ToggleRow
            label="URL parameters — Using HubSpot or HiRose CRM?"
            checked={ad.urlParametersEnabled}
            onChange={(v) => setAd({ ...ad, urlParametersEnabled: v })}
            disabled={!canManage}
          />
          {ad.urlParametersEnabled && (
            <Field label="UTM parameters">
              <Input
                value={ad.utmParameters}
                maxLength={500}
                onChange={(e) => setAd({ ...ad, utmParameters: e.target.value })}
                placeholder="utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}"
                disabled={!canManage}
              />
            </Field>
          )}
        </CardContent>
      </Card>

      {/* Enhancements */}
      <Card>
        <CardHeader>
          <CardTitle>Enhancements</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
              checked={ad.enhancements[key]}
              onChange={(v) =>
                setAd({ ...ad, enhancements: { ...ad.enhancements, [key]: v } })
              }
              disabled={!canManage}
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/templates")}>
          Cancel
        </Button>
        <Button className="bg-gradient-primary" onClick={save} disabled={!canManage || saving}>
          {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
          Save template
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "md:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
