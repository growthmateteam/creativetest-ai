import { CheckCircle2 } from "lucide-react";
import { STEP_LABELS, WizardStep } from "@/lib/upload-types";
import { cn } from "@/lib/utils";

interface StepperProps {
  current: WizardStep;
}

const STEPS: WizardStep[] = [1, 2, 3, 4, 5, 6];

export function UploadStepper({ current }: StepperProps) {
  return (
    <ol className="flex w-full items-center gap-1">
      {STEPS.map((step, idx) => {
        const isDone = step < current;
        const isActive = step === current;
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-smooth",
                isDone && "border-primary bg-gradient-primary text-primary-foreground",
                isActive && "border-primary bg-primary/15 text-primary",
                !isDone && !isActive && "border-border bg-card text-muted-foreground",
              )}
            >
              {isDone ? <CheckCircle2 className="h-4 w-4" /> : step}
            </div>
            <div className="hidden min-w-0 flex-1 sm:block">
              <p
                className={cn(
                  "truncate text-xs font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {STEP_LABELS[step]}
              </p>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1",
                  isDone ? "bg-primary/60" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
