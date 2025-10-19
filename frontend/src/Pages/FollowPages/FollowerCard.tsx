import {
  useIsFollowedQuery,
  useToggleFollowMutation,
} from "@/api/followers/followerApi";
import { Button } from "@/components/ui/button";
import type { GetUserResponseDto } from "@/types/responseTypes";

interface FollowerCardProps {
  follower: GetUserResponseDto;
}

function FollowerCard({ follower }: FollowerCardProps) {
  const { data: isFollowed } = useIsFollowedQuery(follower.username);
  const [toggleFollow] = useToggleFollowMutation();

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
        <Button
          className={`ml-3 cursor-pointer ${
            isFollowed
              ? "fill-current text-white-500 text-white dark:text-white-500 bg-gray-700 dark:bg-gray-950 dark:hover:bg-gray-900 "
              : ""
          }`}
          onClick={() => toggleFollow(follower.username)}
        >
          {isFollowed ? "Following" : "Follow Back"}
        </Button>
      </div>
    </div>
  );
}

export default FollowerCard;
