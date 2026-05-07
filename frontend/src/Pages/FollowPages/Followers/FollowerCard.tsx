import { postApi } from '@/api/posts/postApi';
import FollowButton from '@/components/custom/follow-button';
import type { GetUserResponseDto } from '@/types/responseTypes';
import { useDispatch } from 'react-redux';

interface FollowerCardProps {
  follower: GetUserResponseDto;
  loggedInUsername: string;
}

function FollowerCard({ follower, loggedInUsername }: FollowerCardProps) {
  // Normalize comparison - trim whitespace and compare case-insensitively
  const isOwnProfile = loggedInUsername?.trim().toLowerCase() === follower.username?.trim().toLowerCase();
  const dispatch = useDispatch();

  return (
    <div className="py-3 flex justify-between items-center border-b-1">
      <div className="flex items-center justify-start">
        <img className="h-10 w-10 rounded-full" src={follower.profilePictureUrl} alt={`${follower.username} pic`} />
        <span className="px-3">{follower.username}</span>
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
