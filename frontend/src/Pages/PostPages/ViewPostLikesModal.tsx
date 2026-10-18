import { useGetUsersWhoLikedPostInfiniteQuery } from "@/api/users/userApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import FollowButton from "@/components/custom/follow-button";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import UserAvatar from "@/components/custom/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePagedList } from "@/hooks/usePagedList";
import { RotateCcw } from "lucide-react";
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
              <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
            </div>
          ) : likersQuery.isError ? (
            /* Error State: message with a retry button */
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-foreground">
                Couldn't load likes
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => likersQuery.refetch()}
              >
                <RotateCcw className="size-4" /> Try Again
              </Button>
            </div>
          ) : likers.items.length === 0 ? (
            /* Empty State: nobody has liked the post */
            <p className="py-10 text-center text-sm text-muted-foreground">
              No likes yet.
            </p>
          ) : (
            /* Loaded State: liker rows plus infinite-scroll trigger */
            <>
              {likers.items.map((liker) => (
                <div
                  key={liker.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div
                    className="flex min-w-0 cursor-pointer items-center gap-3"
                    onClick={() => handleUserClick(liker.username)}
                  >
                    <UserAvatar
                      className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
                      src={liker.profilePictureUrl}
                      alt={`${liker.username} pic`}
                    />
                    <span className="truncate text-sm font-semibold hover:opacity-60">
                      {liker.username}
                    </span>
                  </div>
                  {!isMe(liker.username) && (
                    <FollowButton username={liker.username} />
                  )}
                </div>
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
