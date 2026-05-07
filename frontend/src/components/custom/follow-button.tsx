import {
  useCancelFollowRequestMutation,
  useHasPendingRequestQuery,
  useIsFollowedQuery,
  useToggleFollowMutation,
} from '@/api/followers/followApi';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface FollowButtonProps {
  username: string;
  onFollowToggled?: () => void;
}

function FollowButton({ username, onFollowToggled }: FollowButtonProps) {
  const [isHoveringPending, setIsHoveringPending] = useState(false);

  const { data: isFollowed } = useIsFollowedQuery(username);
  const { data: pendingRequestId } = useHasPendingRequestQuery(username);
  const [toggleFollow, { isLoading: isTogglingFollow }] = useToggleFollowMutation();
  const [cancelRequest, { isLoading: isCancelling }] = useCancelFollowRequestMutation();

  const isPending = pendingRequestId !== undefined && pendingRequestId > 0;

  function handleFollowClick() {
    if (isPending && pendingRequestId) {
      cancelRequest({ requestId: pendingRequestId, targetUsername: username });
      return;
    }
    toggleFollow(username)
      .unwrap()
      .then(() => onFollowToggled?.());
  }

  return (
    <Button
      className={`ml-3 cursor-pointer transition-colors ${
        isPending && isHoveringPending
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : isPending
            ? 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white'
            : isFollowed
              ? 'bg-black dark:bg-gray-900 text-white hover:bg-red-700 dark:hover:bg-red-700'
              : 'bg-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600 dark:hover:text-white text-black'
      }`}
      onClick={handleFollowClick}
      onMouseEnter={() => isPending && setIsHoveringPending(true)}
      onMouseLeave={() => setIsHoveringPending(false)}
      disabled={isTogglingFollow || isCancelling}
    >
      {isPending && isHoveringPending ? 'Cancel' : isPending ? 'Pending' : isFollowed ? 'Unfollow' : 'Follow'}
    </Button>
  );
}

export default FollowButton;
