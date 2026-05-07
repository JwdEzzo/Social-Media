import { postApi } from '@/api/posts/postApi';
import FollowButton from '@/components/custom/follow-button';
import type { GetUserResponseDto } from '@/types/responseTypes';
import { useDispatch } from 'react-redux';

interface FollowingCardProps {
  following: GetUserResponseDto;
  loggedInUsername: string;
}

function FollowingCard({ following, loggedInUsername }: FollowingCardProps) {
  const isOwnProfile = loggedInUsername?.trim().toLowerCase() === following.username?.trim().toLowerCase();
  const dispatch = useDispatch();

  return (
    <div className="py-3 flex justify-between items-center border-b-1">
      <div className="flex items-center justify-start">
        <img className="h-10 w-10 rounded-full" src={following.profilePictureUrl} alt={`${following.username} pic`} />
        <span className="px-3">{following.username}</span>
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
