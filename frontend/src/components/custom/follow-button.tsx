import {
  useCancelFollowRequestMutation,
  useHasPendingRequestQuery,
  useIsFollowedQuery,
  useToggleFollowMutation,
} from "@/api/followers/followApi";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FollowButtonProps {
  username: string;
  onFollowToggled?: () => void;
}

function FollowButton({ username, onFollowToggled }: FollowButtonProps) {
  const [isHoveringPending, setIsHoveringPending] = useState(false);

  const { data: isFollowed } = useIsFollowedQuery(username);
  const { data: pendingRequestId } = useHasPendingRequestQuery(username);
  const [toggleFollow, { isLoading: isTogglingFollow }] =
    useToggleFollowMutation();
  const [cancelRequest, { isLoading: isCancelling }] =
    useCancelFollowRequestMutation();

  const isPending = pendingRequestId !== undefined && pendingRequestId > 0;

  function handleFollowClick() {
    if (isPending && pendingRequestId) {
      cancelRequest({
        requestId: pendingRequestId,
        requesterUsername: username,
      });
      return;
    }
    toggleFollow(username)
      .unwrap()
      .then(() => onFollowToggled?.());
  }

  return (
    <Button
      className={`ml-2 h-8 cursor-pointer rounded-lg px-4 text-sm font-semibold shadow-none transition-colors ${
        isPending && isHoveringPending
          ? "bg-destructive text-white hover:bg-destructive/90"
          : isPending
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            : isFollowed
              ? "bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive"
              : "bg-sky-500 text-white hover:bg-sky-600"
      }`}
      onClick={handleFollowClick}
      onMouseEnter={() => isPending && setIsHoveringPending(true)}
      onMouseLeave={() => setIsHoveringPending(false)}
      disabled={isTogglingFollow || isCancelling}
    >
      {isPending && isHoveringPending
        ? "Cancel"
        : isPending
          ? "Pending"
          : isFollowed
            ? "Unfollow"
            : "Follow"}
    </Button>
  );
}

export default FollowButton;
