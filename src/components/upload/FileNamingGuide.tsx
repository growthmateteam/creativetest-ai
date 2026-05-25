import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Image as ImageIcon, Video, Lightbulb, HelpCircle } from "lucide-react";

interface FileNamingGuideProps {
  trigger?: React.ReactNode;
}

const exampleGroups = [
  {
    adset: "Webinar",
    files: [
      { name: "ACME-Webinar-001.mp4", type: "video" as const },
      { name: "ACME-Webinar-002.jpg", type: "image" as const },
      { name: "ACME-Webinar-003.jpg", type: "image" as const },
    ],
  },
  {
    adset: "BookACall",
    files: [
      { name: "ACME-BookACall-001.jpg", type: "image" as const },
      { name: "ACME-BookACall-002.mp4", type: "video" as const },
    ],
  },
];

const typeIcon = { video: Video, image: ImageIcon };

export function FileNamingGuide({ trigger }: FileNamingGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="link" className="h-auto p-0 text-primary">
            <HelpCircle className="mr-1.5 h-4 w-4" />
            File Naming Guide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            How to Name Your Files for Easy Assignment
          </DialogTitle>
          <DialogDescription>
            A quick convention that lets you bulk-assign creatives to adsets in one step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Convention */}
          <section className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recommended format
            </p>
            <p className="mt-2 font-mono text-base text-foreground">
              [ClientCode]-[AdsetName]-[CreativeNumber]
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["ACME-Webinar-001.mp4", "ACME-Webinar-002.jpg", "ACME-BookACall-001.jpg"].map(
                (ex) => (
                  <Badge
                    key={ex}
                    variant="outline"
                    className="border-primary/30 bg-primary/10 font-mono text-xs text-foreground"
                  >
                    {ex}
                  </Badge>
                ),
              )}
            </div>
          </section>

          {/* Tip */}
          <section className="flex gap-3 rounded-lg border border-secondary/30 bg-secondary/10 p-4">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
            <p className="text-sm">
              <span className="font-medium">Pro tip:</span> Files with the same
              adset name in their filename can be bulk-selected and assigned
              together in one step.
            </p>
          </section>

          {/* Visual example */}
          <section className="space-y-3">
            <p className="text-sm font-medium">Visual example — files grouped by adset</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {exampleGroups.map((group) => (
                <div
                  key={group.adset}
                  className="rounded-lg border border-border bg-card/50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Badge className="bg-gradient-primary">
                      {group.adset}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {group.files.length} files
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {group.files.map((f) => {
                      const Icon = typeIcon[f.type];
                      return (
                        <div
                          key={f.name}
                          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-border/60 bg-muted/40 p-2 text-center"
                        >
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="line-clamp-2 break-all text-[10px] leading-tight text-muted-foreground">
                            {f.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              No specific naming required — this just speeds up assignment.
            </p>
          </section>
        </div>

        <DialogFooter>
          <Button className="bg-gradient-primary" onClick={() => setOpen(false)}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
