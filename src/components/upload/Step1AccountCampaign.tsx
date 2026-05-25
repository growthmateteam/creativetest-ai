import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Layers, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { UploadWizardState } from "@/lib/upload-types";
import {
  AdSettings,
  AdsetSettings,
  CampaignSettings,
  defaultAdSettings,
} from "@/lib/template-defaults";

interface Step1Props {
  state: UploadWizardState;
  onChange: (patch: Partial<UploadWizardState>) => void;
  onNext: () => void;
}

interface AdAccount {
  id: string;
  name: string;
}

interface TemplateRow {
  id: string;
  name: string;
  account_id: string;
  campaign_settings: unknown;
  adset_settings: unknown;
  ad_settings: unknown;
}

export function Step1AccountCampaign({ state, onChange, onNext }: Step1Props) {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [adsetInput, setAdsetInput] = useState("");
  const [tplOpen, setTplOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("ad_accounts")
        .select("id, name")
        .order("name");
      if (error) toast.error(error.message);
      setAccounts(data ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!state.accountId) {
      setTemplates([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("templates")
        .select("id, name, account_id, campaign_settings, adset_settings, ad_settings")
        .eq("account_id", state.accountId)
        .order("updated_at", { ascending: false });
      setTemplates((data ?? []) as TemplateRow[]);
    })();
  }, [state.accountId]);

  const addAdset = () => {
    const v = adsetInput.trim().slice(0, 80);
    if (!v) return;
    if (state.adsets.includes(v)) {
      toast.error("Adset already added");
      return;
    }
    onChange({ adsets: [...state.adsets, v] });
    setAdsetInput("");
  };

  const removeAdset = (name: string) => {
    onChange({
      adsets: state.adsets.filter((a) => a !== name),
      assignments: Object.fromEntries(
        Object.entries(state.assignments).filter(([, v]) => v !== name),
      ),
    });
  };

  const applyTemplate = (tpl: TemplateRow) => {
    const merged: AdSettings = {
      ...defaultAdSettings,
      ...(tpl.ad_settings as AdSettings),
      enhancements: {
        ...defaultAdSettings.enhancements,
        ...((tpl.ad_settings as AdSettings)?.enhancements ?? {}),
      },
    };
    onChange({
      templateId: tpl.id,
      settings: merged,
    });
    setTplOpen(false);
    toast.success(`Template "${tpl.name}" applied`);
  };

  const canProceed =
    state.accountId && state.campaignName.trim().length > 0 && state.adsets.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account & campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Ad account</Label>
            <Select
              value={state.accountId}
              onValueChange={(v) => onChange({ accountId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an ad account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No ad accounts. Add one from Templates.
                  </div>
                ) : (
                  accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Campaign</Label>
            <Input
              value={state.campaignName}
              maxLength={120}
              onChange={(e) => onChange({ campaignName: e.target.value })}
              placeholder="Q1 Lead Gen — Launch"
            />
            <p className="text-xs text-muted-foreground">
              Type a new campaign name (existing campaigns will be wired once Facebook is connected).
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Adsets</Label>
          <div className="flex gap-2">
            <Input
              value={adsetInput}
              maxLength={80}
              onChange={(e) => setAdsetInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAdset();
                }
              }}
              placeholder="Webinar, BookACall…"
            />
            <Button type="button" variant="outline" onClick={addAdset}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {state.adsets.map((a) => (
              <Badge key={a} variant="outline" className="bg-card">
                {a}
                <button
                  type="button"
                  onClick={() => removeAdset(a)}
                  className="ml-1.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">Apply a template</p>
            <p className="text-xs text-muted-foreground">
              {state.templateId
                ? `Template applied — settings pre-filled`
                : "Pre-fill settings from a saved template"}
            </p>
          </div>
          <Button
            variant="outline"
            disabled={!state.accountId}
            onClick={() => setTplOpen(true)}
          >
            <Layers className="mr-1.5 h-4 w-4" />
            {state.templateId ? "Change template" : "Apply template"}
          </Button>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            className="bg-gradient-primary"
            onClick={onNext}
            disabled={!canProceed}
          >
            Continue
          </Button>
        </div>
      </CardContent>

      <Dialog open={tplOpen} onOpenChange={setTplOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply template</DialogTitle>
            <DialogDescription>
              Templates scoped to this ad account.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {templates.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No templates for this account yet.
              </p>
            ) : (
              templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-left transition-smooth hover:border-primary/60 hover:bg-card/80"
                >
                  <span className="text-sm font-medium">{t.name}</span>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTplOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
