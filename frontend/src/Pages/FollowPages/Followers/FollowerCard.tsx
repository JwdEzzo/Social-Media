import { postApi } from "@/api/posts/postApi";
import FollowButton from "@/components/custom/follow-button";
import type { GetUserResponseDto } from "@/types/response-types";
import { useDispatch } from "react-redux";

interface FollowerCardProps {
  follower: GetUserResponseDto;
  loggedInUsername: string;
}

function FollowerCard({ follower, loggedInUsername }: FollowerCardProps) {
  // Normalize comparison - trim whitespace and compare case-insensitively
  const isOwnProfile =
    loggedInUsername?.trim().toLowerCase() ===
    follower.username?.trim().toLowerCase();
  const dispatch = useDispatch();

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
        {!isOwnProfile && (
          <FollowButton
            username={follower.username}
            onFollowToggled={() => dispatch(postApi.util.resetApiState())}
            //
          />
        )}
      </div>
    </div>
  );
}

export default FollowerCard;
