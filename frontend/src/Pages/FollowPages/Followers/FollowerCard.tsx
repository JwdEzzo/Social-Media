import {
  useIsFollowedQuery,
  useToggleFollowMutation,
} from "@/api/followers/followApi";
import { Button } from "@/components/ui/button";
import type { GetUserResponseDto } from "@/types/responseTypes";

interface FollowerCardProps {
  follower: GetUserResponseDto;
  loggedInUsername: string;
}

function FollowerCard({ follower, loggedInUsername }: FollowerCardProps) {
  const { data: isFollowed } = useIsFollowedQuery(follower.username);
  const [toggleFollow] = useToggleFollowMutation();

  // Debug logs
  console.log("Logged in username:", loggedInUsername);
  console.log("Follower username:", follower.username);
  console.log("Are they equal?:", loggedInUsername === follower.username);

  // Normalize comparison - trim whitespace and compare case-insensitively
  const isOwnProfile =
    loggedInUsername?.trim().toLowerCase() ===
    follower.username?.trim().toLowerCase();

  console.log("isOwnProfile after normalization:", isOwnProfile);

  return (
    <div className="py-3 flex justify-between items-center border-b-1">
      <div className="flex items-center justify-start">
        <img
          className="h-10 w-10 rounded-full"
          src={follower.profilePictureUrl}
          alt={`${follower.username} pic`}
        />
        <span className="px-3">{follower.username}</span>
      </div>
      <div>
        {!isOwnProfile && (
          <Button
            className={`${
              isFollowed
                ? "fill-current text-white bg-gray-700 dark:bg-gray-950 dark:hover:bg-gray-900"
                : ""
            }`}
            onClick={() => toggleFollow(follower.username)}
          >
            {isFollowed ? "Following" : "Follow Back"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FollowerCard;
