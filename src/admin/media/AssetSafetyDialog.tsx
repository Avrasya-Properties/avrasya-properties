import { AlertTriangle, Building2, Image as ImageIcon, Layout, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MediaReference } from "./types";

interface AssetSafetyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetName: string;
  references: MediaReference[];
}

export function AssetSafetyDialog({
  open,
  onOpenChange,
  assetName,
  references,
}: AssetSafetyDialogProps) {
  const getRefIcon = (type: MediaReference["type"]) => {
    switch (type) {
      case "property_cover":
        return <ImageIcon className="h-4 w-4 text-amber-500" />;
      case "property_gallery":
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case "property_floor_plan":
        return <Layout className="h-4 w-4 text-emerald-500" />;
      case "cms_design":
        return <Layout className="h-4 w-4 text-purple-500" />;
    }
  };

  const getRefLabel = (type: MediaReference["type"]) => {
    switch (type) {
      case "property_cover":
        return "Property Cover Image";
      case "property_gallery":
        return "Property Gallery";
      case "property_floor_plan":
        return "Floor Plan";
      case "cms_design":
        return "Website Design";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-amber-500/30">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold">
                Asset In Use — Cannot Delete
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Active references protect the live website from broken links.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <p className="text-muted-foreground">
            The media asset{" "}
            <span className="font-semibold text-foreground break-all">"{assetName}"</span> is
            currently displayed in{" "}
            <span className="font-semibold text-foreground">{references.length}</span> active
            location(s):
          </p>

          <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/40 p-2 space-y-2">
            {references.map((r, i) => (
              <div
                key={`${r.type}-${r.id}-${i}`}
                className="flex items-start gap-2.5 rounded bg-card p-2 text-xs border"
              >
                <div className="mt-0.5 shrink-0">{getRefIcon(r.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground truncate">{r.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase font-mono">
                      {getRefLabel(r.type)}
                    </span>
                  </div>
                  {r.details && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            To delete this file, please first reassign or remove it from the listed properties or
            settings.
          </p>
        </div>

        <DialogFooter className="mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Understood
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
