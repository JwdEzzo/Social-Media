import { postApi } from "@/api/posts/postApi";
import FollowButton from "@/components/custom/follow-button";
import type { GetUserResponseDto } from "@/types/response-types";
import { useDispatch } from "react-redux";

interface FollowingCardProps {
  following: GetUserResponseDto;
  loggedInUsername: string;
}

function FollowingCard({ following, loggedInUsername }: FollowingCardProps) {
  const isOwnProfile =
    loggedInUsername?.trim().toLowerCase() ===
    following.username?.trim().toLowerCase();
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <img
          className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
          src={following.profilePictureUrl}
          alt={`${following.username} pic`}
        />
        <span className="truncate text-sm font-semibold">
          {following.username}
        </span>
      </div>
      <div>
        {!isOwnProfile && (
          <FollowButton
            username={following.username}
            onFollowToggled={() => dispatch(postApi.util.resetApiState())}
            //
          />
        )}
      </div>
    </div>
  );
}

export default FollowingCard;
