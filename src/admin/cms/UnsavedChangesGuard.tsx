import { useEffect } from "react";
import { useBlocker, useRouter } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export interface UnsavedChangesGuardProps {
  isDirty: boolean;
  title?: string;
  description?: string;
  onDiscard?: () => void;
}

export function useUnsavedChangesGuard(isDirty: boolean) {
  const router = useRouter({ warn: false });

  // Browser-level beforeunload event listener for page refresh / close
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes.";
      return "You have unsaved changes.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return {
    status: "idle" as const,
    proceed: () => {},
    reset: () => {},
    hasRouter: Boolean(router),
  };
}

function RouterBlockerDialog({
  isDirty,
  title = "Unsaved Changes",
  description = "You have unsaved modifications in the editor. Leaving this page will discard all changes made during this session.",
  onDiscard,
}: UnsavedChangesGuardProps) {
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: () => isDirty,
  });

  const isBlocked = blocker.status === "blocked";

  const handleProceed = () => {
    onDiscard?.();
    if (blocker.status === "blocked") {
      blocker.proceed();
    }
  };

  const handleReset = () => {
    if (blocker.status === "blocked") {
      blocker.reset();
    }
  };

  return (
    <AlertDialog
      open={isBlocked}
      onOpenChange={(open) => {
        if (!open) handleReset();
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-500">
            <AlertTriangle className="size-5 shrink-0" />
            <AlertDialogTitle className="text-base font-semibold">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground pt-1">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={handleReset} className="text-xs">
            Stay and Keep Editing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleProceed}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
          >
            Discard and Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function UnsavedChangesDialog(props: UnsavedChangesGuardProps) {
  const { isDirty } = props;
  const router = useRouter({ warn: false });

  // Browser-level beforeunload event listener for page refresh / close
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes.";
      return "You have unsaved changes.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (!router) {
    // When rendered outside a router context (e.g. isolated test environments),
    // skip the router blocker modal safely while maintaining beforeunload protection.
    return null;
  }

  return <RouterBlockerDialog {...props} />;
}
