import {
  useIsFollowedQuery,
  useToggleFollowMutation,
} from "@/api/followers/followApi";
import { Button } from "@/components/ui/button";
import type { GetUserResponseDto } from "@/types/responseTypes";

interface FollowingCardProps {
  following: GetUserResponseDto;
  loggedInUsername: string;
}

function FollowingCard({ following, loggedInUsername }: FollowingCardProps) {
  const { data: isFollowed } = useIsFollowedQuery(following.username);
  const [toggleFollow] = useToggleFollowMutation();

  const isOwnProfile =
    loggedInUsername?.trim().toLowerCase() ===
    following.username?.trim().toLowerCase();

  return (
    <div className="py-3 flex justify-between items-center border-b-1">
      <div className="flex items-center justify-start">
        <img
          className="h-10 w-10 rounded-full"
          src={following.profilePictureUrl}
          alt={`${following.username} pic`}
        />
        <span className="px-3">{following.username}</span>
      </div>
      <div>
        {!isOwnProfile && (
          <Button
            className={`${
              isFollowed
                ? "fill-current text-white bg-gray-700 dark:bg-gray-950 dark:hover:bg-gray-900"
                : ""
            }`}
            onClick={() => toggleFollow(following.username)}
          >
            {isFollowed ? "Following" : "Follow"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FollowingCard;
