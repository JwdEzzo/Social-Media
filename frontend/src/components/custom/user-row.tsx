import UserAvatar from "@/components/custom/user-avatar";
import { cn } from "@/utils/errors";
import type { ReactNode } from "react";

interface UserRowProps {
  username: string;
  profilePictureUrl?: string | null;
  // Makes the avatar + username clickable, e.g. to open the profile
  onClick?: () => void;
  // Shown on the right, e.g. a FollowButton or Accept/Decline buttons
  action?: ReactNode;
  className?: string;
}

// One user in a list: avatar and username on the left, an optional action on the right.
// Used by the follower/following lists, the post likes modal and the follow request cards.
function UserRow({
  username,
  profilePictureUrl,
  onClick,
  action,
  className,
}: UserRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-2.5",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 items-center gap-3",
          onClick && "cursor-pointer",
        )}
        onClick={onClick}
      >
        <UserAvatar
          className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
          src={profilePictureUrl}
          alt={`${username} pic`}
        />
        <span
          className={cn(
            "truncate text-sm font-semibold",
            onClick && "hover:opacity-60",
          )}
        >
          {username}
        </span>
      </div>
      {action}
    </div>
  );
}

export default UserRow;
