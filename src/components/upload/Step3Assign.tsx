import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Video as VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadWizardState } from "@/lib/upload-types";

interface Step3Props {
  state: UploadWizardState;
  onChange: (patch: Partial<UploadWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Assign({ state, onChange, onNext, onBack }: Step3Props) {
  const readyFiles = useMemo(() => state.files.filter((f) => f.status === "ready"), [state.files]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastIdx, setLastIdx] = useState<number | null>(null);
  const [bulkAdset, setBulkAdset] = useState<string>("");

  const toggle = (id: string, idx: number, shift: boolean) => {
    const next = new Set(selected);
    if (shift && lastIdx !== null) {
      const [a, b] = [Math.min(lastIdx, idx), Math.max(lastIdx, idx)];
      for (let i = a; i <= b; i++) next.add(readyFiles[i].id);
    } else {
      if (next.has(id)) next.delete(id);
      else next.add(id);
    }
    setSelected(next);
    setLastIdx(idx);
  };

  const selectAll = () => setSelected(new Set(readyFiles.map((f) => f.id)));
  const clearSelection = () => setSelected(new Set());

  const assignSelected = (adset: string) => {
    if (selected.size === 0) return;
    const next = { ...state.assignments };
    for (const id of selected) next[id] = adset;
    onChange({ assignments: next });
    setSelected(new Set());
    setBulkAdset("");
  };

  const assignedCount = Object.keys(state.assignments).filter((id) =>
    readyFiles.some((f) => f.id === id),
  ).length;
  const allAssigned = readyFiles.length > 0 && assignedCount === readyFiles.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign creatives to adsets</CardTitle>
        <p className="text-xs text-muted-foreground">
          Click to select, shift-click for ranges. Assigned: {assignedCount} / {readyFiles.length}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          {/* Files grid */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={selectAll}>
                Select all
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                disabled={selected.size === 0}
              >
                Clear
              </Button>
              <span className="text-xs text-muted-foreground">
                {selected.size} selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {readyFiles.map((f, idx) => {
                const isSel = selected.has(f.id);
                const adset = state.assignments[f.id];
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={(e) => toggle(f.id, idx, e.shiftKey)}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border-2 bg-card text-left transition-smooth",
                      isSel ? "border-primary shadow-glow" : "border-border hover:border-primary/40",
                    )}
                  >
                    <div className="relative aspect-square bg-muted">
                      {f.previewUrl ? (
                        <img src={f.previewUrl} alt={f.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <VideoIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {isSel && (
                        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      {adset && (
                        <Badge className="absolute bottom-1.5 left-1.5 bg-gradient-primary text-[10px]">
                          {adset}
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-1 break-all p-1.5 text-[11px]" title={f.name}>
                      {f.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 rounded-lg border border-border bg-card/30 p-3">
            <div>
              <p className="text-sm font-medium">Bulk assign</p>
              <p className="text-xs text-muted-foreground">
                Pick an adset for the {selected.size} selected file{selected.size === 1 ? "" : "s"}.
              </p>
            </div>
            <Select value={bulkAdset} onValueChange={setBulkAdset}>
              <SelectTrigger>
                <SelectValue placeholder="Choose adset" />
              </SelectTrigger>
              <SelectContent>
                {state.adsets.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full bg-gradient-primary"
              disabled={!bulkAdset || selected.size === 0}
              onClick={() => assignSelected(bulkAdset)}
            >
              Assign to adset
            </Button>

            <div className="border-t border-border pt-3">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Per-adset count
              </p>
              <ul className="space-y-1 text-sm">
                {state.adsets.map((a) => {
                  const count = Object.values(state.assignments).filter((v) => v === a).length;
                  return (
                    <li key={a} className="flex items-center justify-between">
                      <span>{a}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-5">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button className="bg-gradient-primary" onClick={onNext} disabled={!allAssigned}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
