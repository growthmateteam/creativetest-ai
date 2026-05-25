import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UploadStepper } from "@/components/upload/UploadStepper";
import { Step1AccountCampaign } from "@/components/upload/Step1AccountCampaign";
import { Step2Upload } from "@/components/upload/Step2Upload";
import { Step3Assign } from "@/components/upload/Step3Assign";
import { Step4Settings } from "@/components/upload/Step4Settings";
import { Step5Review } from "@/components/upload/Step5Review";
import { Step6Progress } from "@/components/upload/Step6Progress";
import {
  emptyWizardState,
  UploadWizardState,
  WizardStep,
} from "@/lib/upload-types";
import { AdSettings } from "@/lib/template-defaults";
import { SubscriptionGate } from "@/components/billing/SubscriptionGate";

const REQUIRED: (keyof AdSettings)[] = ["headline", "primaryText", "destinationUrl"];

export default function Upload() {
  const { user } = useAuth();
  const [state, setState] = useState<UploadWizardState>(emptyWizardState);
  const [showValidation, setShowValidation] = useState(false);

  const update = (patch: Partial<UploadWizardState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const goTo = (step: WizardStep) => update({ step });

  const ensureSession = async () => {
    if (state.sessionId || !user) return state.sessionId;
    const { data, error } = await supabase
      .from("upload_sessions")
      .insert({
        user_id: user.id,
        account_id: state.accountId || null,
        campaign_name: state.campaignName,
        status: "draft",
      })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      return null;
    }
    update({ sessionId: data.id });
    return data.id;
  };

  const persistSession = async (status?: "draft" | "uploading" | "ready" | "launching") => {
    if (!state.sessionId) return;
    await supabase
      .from("upload_sessions")
      .update({
        account_id: state.accountId || null,
        campaign_name: state.campaignName,
        files: JSON.parse(JSON.stringify(state.files)),
        adset_assignments: JSON.parse(JSON.stringify(state.assignments)),
        settings: JSON.parse(JSON.stringify(state.settings)),
        template_id: state.templateId,
        status: status ?? "ready",
      })
      .eq("id", state.sessionId);
  };

  const handleNext = async () => {
    if (state.step === 1) {
      await ensureSession();
      goTo(2);
      return;
    }
    if (state.step === 2) {
      goTo(3);
      return;
    }
    if (state.step === 3) {
      goTo(4);
      return;
    }
    if (state.step === 4) {
      goTo(5);
      return;
    }
  };

  const handleLaunch = async () => {
    const missing = REQUIRED.filter((k) => !String(state.settings[k] ?? "").trim());
    if (missing.length > 0) {
      setShowValidation(true);
      toast.error("Complete required fields before launching");
      goTo(4);
      return;
    }
    await persistSession("launching");
    goTo(6);
  };

  const reset = () => {
    setState(emptyWizardState);
    setShowValidation(false);
  };

  return (
    <SubscriptionGate>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag & drop up to 50 creatives and bulk-assign them to adsets.
          </p>
        </div>

        <UploadStepper current={state.step} />

        {state.step === 1 && (
          <Step1AccountCampaign state={state} onChange={update} onNext={handleNext} />
        )}
        {state.step === 2 && (
          <Step2Upload state={state} onChange={update} onNext={handleNext} onBack={() => goTo(1)} />
        )}
        {state.step === 3 && (
          <Step3Assign state={state} onChange={update} onNext={handleNext} onBack={() => goTo(2)} />
        )}
        {state.step === 4 && (
          <Step4Settings
            state={state}
            onChange={update}
            onNext={handleNext}
            onBack={() => goTo(3)}
            showValidation={showValidation}
          />
        )}
        {state.step === 5 && (
          <Step5Review state={state} onLaunch={handleLaunch} onBack={() => goTo(4)} />
        )}
        {state.step === 6 && <Step6Progress state={state} onReset={reset} />}
      </div>
    </SubscriptionGate>
  );
}
