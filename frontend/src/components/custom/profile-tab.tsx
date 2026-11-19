import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/errors";

// Tab styles: shared base + one of active/inactive
const TAB_BASE =
  "-mt-px flex flex-1 cursor-pointer items-center justify-center gap-2 border-t py-3 text-sm font-semibold transition-colors";
const TAB_ACTIVE = "border-foreground text-foreground";
const TAB_INACTIVE =
  "border-transparent text-muted-foreground hover:text-foreground";

interface ProfileTabProps {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onSelect: () => void;
}

// One tab in the profile page's Posts / Likes / Saved bar
function ProfileTab({
  label,
  icon: Icon,
  isActive,
  onSelect,
}: ProfileTabProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(TAB_BASE, isActive ? TAB_ACTIVE : TAB_INACTIVE)}
    >
      <button className="cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <div className="flex cursor-pointer items-center gap-1.5">
          <Icon className="size-3.5 sm:size-4" />
          <span>{label}</span>
        </div>
      </button>
    </div>
  );
}

export default ProfileTab;
