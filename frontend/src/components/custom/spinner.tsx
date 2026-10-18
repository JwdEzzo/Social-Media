import { cn } from "@/utils/errors";

interface SpinnerProps {
  // Size (and any colour overrides) as Tailwind classes, e.g. "size-5"
  className?: string;
}

// The round loading spinner used across the app. Defaults to size-6.
function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "size-6 animate-spin rounded-full border-2 border-muted border-t-foreground",
        className,
      )}
    />
  );
}

export default Spinner;
