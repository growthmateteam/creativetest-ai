import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  Upload as UploadIcon,
  Video as VideoIcon,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ACCEPTED_MIME,
  MAX_FILES,
  UploadFile,
  UploadWizardState,
} from "@/lib/upload-types";
import { FileNamingGuide } from "./FileNamingGuide";

interface Step2Props {
  state: UploadWizardState;
  onChange: (patch: Partial<UploadWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

function fileTypeOf(mime: string): "image" | "video" {
  return mime.startsWith("video/") ? "video" : "image";
}

export function Step2Upload({ state, onChange, onNext, onBack }: Step2Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Always-current ref so async callbacks see latest state
  const stateRef = useRef(state);
  stateRef.current = state;

  const updateFile = useCallback(
    (id: string, patch: Partial<UploadFile>) => {
      onChange({
        files: stateRef.current.files.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      });
    },
    [onChange],
  );

  const startUpload = async (file: File, item: UploadFile) => {
    if (!user) return;
    const path = `${user.id}/${stateRef.current.sessionId ?? "draft"}/${item.id}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const { error } = await supabase.storage
      .from("creatives")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) {
      updateFile(item.id, { status: "failed", error: error.message, progress: 0 });
      return;
    }
    updateFile(item.id, {
      status: "ready",
      progress: 100,
      storagePath: path,
    });
  };

  const handleFiles = async (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const remaining = MAX_FILES - stateRef.current.files.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_FILES} files per session`);
      return;
    }
    const toAccept = arr.slice(0, remaining);
    if (arr.length > toAccept.length) {
      toast.error(`Only first ${toAccept.length} added — ${MAX_FILES} file limit`);
    }

    const valid: { file: File; item: UploadFile }[] = [];
    for (const f of toAccept) {
      if (!ACCEPTED_MIME.includes(f.type)) {
        toast.error(`${f.name}: unsupported file type`);
        continue;
      }
      if (f.size > 200 * 1024 * 1024) {
        toast.error(`${f.name}: exceeds 200MB`);
        continue;
      }
      const item: UploadFile = {
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: fileTypeOf(f.type),
        mime: f.type,
        storagePath: "",
        previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        status: "uploading",
        progress: 10,
      };
      valid.push({ file: f, item });
    }

    if (valid.length === 0) return;
    onChange({ files: [...stateRef.current.files, ...valid.map((v) => v.item)] });
    // Kick off uploads in parallel
    await Promise.all(valid.map((v) => startUpload(v.file, v.item)));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragRef.current?.classList.remove("border-primary", "bg-primary/5");
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const removeFile = async (id: string) => {
    const f = state.files.find((x) => x.id === id);
    onChange({
      files: state.files.filter((x) => x.id !== id),
      assignments: Object.fromEntries(
        Object.entries(state.assignments).filter(([k]) => k !== id),
      ),
    });
    if (f?.storagePath) {
      await supabase.storage.from("creatives").remove([f.storagePath]);
    }
  };

  const ready = state.files.filter((f) => f.status === "ready").length;
  const failed = state.files.filter((f) => f.status === "failed").length;
  const uploading = state.files.filter((f) => f.status === "uploading").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Upload creatives</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, MP4, MOV · up to {MAX_FILES} files
          </p>
        </div>
        <FileNamingGuide />
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={dragRef}
          onDragOver={(e) => {
            e.preventDefault();
            dragRef.current?.classList.add("border-primary", "bg-primary/5");
          }}
          onDragLeave={() => {
            dragRef.current?.classList.remove("border-primary", "bg-primary/5");
          }}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/30 px-6 py-12 text-center transition-smooth hover:border-primary/50 hover:bg-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
            <UploadIcon className="h-6 w-6" />
          </div>
          <p className="mt-3 text-base font-medium">
            Drop up to {MAX_FILES} images or videos here
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse — JPG, PNG, MP4, MOV
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_MIME.join(",")}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {state.files.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{state.files.length} of {MAX_FILES}</span>
            {ready > 0 && (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> {ready} ready
              </span>
            )}
            {uploading > 0 && <span>{uploading} uploading…</span>}
            {failed > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3.5 w-3.5" /> {failed} failed
              </span>
            )}
          </div>
        )}

        {state.files.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {state.files.map((f) => (
              <div
                key={f.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="relative aspect-square bg-muted">
                  {f.previewUrl ? (
                    <img src={f.previewUrl} alt={f.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <VideoIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <Badge
                    variant="outline"
                    className="absolute left-1.5 top-1.5 h-5 bg-background/80 px-1.5 text-[10px]"
                  >
                    {f.type === "video" ? "VID" : "IMG"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1 opacity-0 transition-smooth hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1.5 p-2">
                  <p className="line-clamp-1 break-all text-[11px]" title={f.name}>
                    {f.name}
                  </p>
                  {f.status === "uploading" && (
                    <Progress value={f.progress} className="h-1" />
                  )}
                  {f.status === "ready" && (
                    <span className="flex items-center gap-1 text-[10px] text-success">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </span>
                  )}
                  {f.status === "failed" && (
                    <span
                      className="flex items-center gap-1 text-[10px] text-destructive"
                      title={f.error}
                    >
                      <AlertCircle className="h-3 w-3" /> Failed
                    </span>
                  )}
                </div>
                {f.type === "image" && f.previewUrl && (
                  <div className="absolute inset-0 hidden" aria-hidden />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            className="bg-gradient-primary"
            onClick={onNext}
            disabled={ready === 0 || uploading > 0}
          >
            Continue ({ready} ready)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
