import { Button } from "@/components/ui/button";
import Spinner from "@/components/custom/spinner";
import { cn } from "@/utils/errors";
import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

interface RetryButtonProps {
  onRetry: () => void;
  variant?: "default" | "outline";
  className?: string;
}

// "Try Again" button with the retry icon
export function RetryButton({
  onRetry,
  variant = "default",
  className,
}: RetryButtonProps) {
  return (
    <Button variant={variant} className={className} onClick={onRetry}>
      <RotateCcw className="size-4" /> Try Again
    </Button>
  );
}

interface StatusCardProps {
  title: string;
  message: string;
  // Shows the title in red
  isError?: boolean;
  // Adds a Try Again button
  onRetry?: () => void;
  // Extra buttons next to Try Again (e.g. Close)
  children?: ReactNode;
  className?: string;
}

// Bordered card with a title, a message and an optional retry button: the
// "Error" / "User Not Found" boxes shown in place of a page or modal
export function StatusCard({
  title,
  message,
  isError = false,
  onRetry,
  children,
  className,
}: StatusCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center",
        className,
      )}
    >
      <h2
        className={cn(
          "mb-1 text-lg font-semibold",
          isError && "text-destructive",
        )}
      >
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{message}</p>
      {(onRetry || children) && (
        <div className="mt-6 flex justify-center gap-2">
          {onRetry && <RetryButton onRetry={onRetry} />}
          {children}
        </div>
      )}
    </div>
  );
}

// A StatusCard centred on an otherwise empty page
export function FullPageStatus(props: StatusCardProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <StatusCard {...props} />
    </div>
  );
}

interface FullPageLoadingProps {
  label: string;
}

// Spinner plus a label, centred on an otherwise empty page
export function FullPageLoading({ label }: FullPageLoadingProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="text-center">
        <Spinner className="mx-auto size-8" />
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  // Vertical padding etc. for where it sits; defaults to py-12
  className?: string;
}

// Inline "Couldn't load X" message with an outline Try Again button, for lists
// and panels (as opposed to StatusCard, which replaces a whole page)
export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("py-12 text-center", className)}>
      <p className="text-sm font-semibold text-foreground">{message}</p>
      <RetryButton variant="outline" className="mt-4" onRetry={onRetry} />
    </div>
  );
}
