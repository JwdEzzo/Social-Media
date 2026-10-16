import FollowButton from "@/components/custom/follow-button";
import type { GetUserResponse } from "@/types/response-types";

interface FollowerCardProps {
  follower: GetUserResponse;
  loggedInUsername: string;
}

function FollowerCard({ follower, loggedInUsername }: FollowerCardProps) {
  // Normalize comparison - trim whitespace and compare case-insensitively
  const isOwnProfile =
    loggedInUsername?.trim().toLowerCase() ===
    follower.username?.trim().toLowerCase();

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <img
          className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
          src={follower.profilePictureUrl}
          alt={`${follower.username} pic`}
        />
        <span className="truncate text-sm font-semibold">
          {follower.username}
        </span>
      </div>
      <div>
        {!isOwnProfile && <FollowButton username={follower.username} />}
      </div>
    </div>
  );
}

export default FollowerCard;
