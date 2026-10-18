import { useGetUsersWhoLikedPostInfiniteQuery } from "@/api/users/userApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import FollowButton from "@/components/custom/follow-button";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import Spinner from "@/components/custom/spinner";
import { ErrorState } from "@/components/custom/status-card";
import UserRow from "@/components/custom/user-row";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePagedList } from "@/hooks/usePagedList";
import "@/components/css/scrollbar.css";

interface ViewPostLikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  navigateToSelectedUserProfile: (username: string) => void;
}

// The users who liked a post, most recent like first. Opened from the like count in
// ViewPostModal; clicking a username closes it and opens that profile.
function ViewPostLikesModal({
  isOpen,
  onClose,
  postId,
  navigateToSelectedUserProfile,
}: ViewPostLikesModalProps) {
  const { isMe } = useCurrentUser();

  // Only fetch while the modal is open
  const likersQuery = useGetUsersWhoLikedPostInfiniteQuery(postId, {
    skip: !isOpen || !postId,
  });
  const likers = usePagedList(likersQuery);

  function handleUserClick(username: string) {
    onClose();
    navigateToSelectedUserProfile(username);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-sm"
        aria-describedby={undefined}
      >
        <DialogHeader className="border-b border-border py-3">
          <DialogTitle className="text-center text-base font-semibold">
            Likes
          </DialogTitle>
        </DialogHeader>

        <div className="custom-scrollbar max-h-[60vh] min-h-48 overflow-y-auto px-4 py-2">
          {/* Loading State: spinner while the first page loads */}
          {likers.isLoadingFirstPage ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : likersQuery.isError ? (
            /* Error State: message with a retry button */
            <ErrorState
              className="py-10"
              message="Couldn't load likes"
              onRetry={() => likersQuery.refetch()}
            />
          ) : likers.items.length === 0 ? (
            /* Empty State: nobody has liked the post */
            <p className="py-10 text-center text-sm text-muted-foreground">
              No likes yet.
            </p>
          ) : (
            /* Loaded State: liker rows plus infinite-scroll trigger */
            <>
              {likers.items.map((liker) => (
                <UserRow
                  key={liker.id}
                  className="py-2"
                  username={liker.username}
                  profilePictureUrl={liker.profilePictureUrl}
                  onClick={() => handleUserClick(liker.username)}
                  action={
                    !isMe(liker.username) && (
                      <FollowButton username={liker.username} />
                    )
                  }
                />
              ))}
              <LoadMoreTrigger
                hasNextPage={likers.hasNextPage}
                isFetchingNextPage={likers.isFetchingNextPage}
                onLoadMore={likers.loadMore}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewPostLikesModal;
