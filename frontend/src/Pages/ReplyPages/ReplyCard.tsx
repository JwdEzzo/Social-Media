import { useDeleteReplyMutation } from "@/api/comments/commentRepliesApi";
import EditDeleteDropdown from "@/components/custom/edit-delete-dropdown";
import LikeButton from "@/components/custom/like-button";
import { useReplyLike } from "@/hooks/useReplyLike";
import type {
  GetCommentResponse,
  GetReplyResponse,
} from "@/types/response-types";
import { memo, useCallback } from "react";
import UserAvatar from "@/components/custom/user-avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDate } from "@/utils/helpers";

interface ReplyCardProps {
  reply: GetReplyResponse;
  navigateToSelectedUserProfile: (username: string) => void;
  comment: GetCommentResponse;
  postUsername: string;
  onEditReply: (replyId: number) => void;
}

const ReplyCard = memo(
  ({
    reply,
    navigateToSelectedUserProfile,
    comment,
    postUsername,
    onEditReply,
    //
  }: ReplyCardProps) => {
    const { isMe } = useCurrentUser();

    const {
      isReplyLiked,
      replyLikeCount,
      isTogglingReplyLike,
      toggleReplyLike,
    } = useReplyLike(reply.id);

    const [deleteReply] = useDeleteReplyMutation();

    const handleDeleteReply = useCallback(async () => {
      try {
        await deleteReply(reply.id).unwrap();
      } catch (error) {
        console.error("Failed to delete reply", error);
      }
    }, [deleteReply, reply.id]);

    // Post/Comment/Reply owners have the authority to delete the reply
    const isAuthenticated =
      isMe(comment.appUser.username) ||
      isMe(postUsername) ||
      isMe(reply.appUser.username);

    return (
      <div className="pt-3">
        <div className="flex items-start gap-2.5">
          {/* Profile Picture */}
          <UserAvatar
            src={reply.appUser.profilePictureUrl}
            alt={reply.appUser.username}
            className="size-6 shrink-0 cursor-pointer rounded-full object-cover ring-1 ring-border"
            loading="lazy"
            decoding="async"
            onClick={() => {
              navigateToSelectedUserProfile(reply.appUser.username);
            }}
          />

          {/* Reply Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span
                className="cursor-pointer text-[13px] font-semibold hover:opacity-70"
                onClick={() => {
                  navigateToSelectedUserProfile(reply.appUser.username);
                }}
              >
                {reply.appUser.username}
              </span>
              <div>
                {isAuthenticated && (
                  <EditDeleteDropdown
                    isAuthenticated={isAuthenticated}
                    entityId={reply.id}
                    handleEntityDelete={handleDeleteReply}
                    handleEntityEdit={onEditReply}
                  />
                )}
              </div>
            </div>

            <div className="pb-1.5">
              <span className="whitespace-pre-line break-words text-sm leading-snug text-foreground">
                {reply.content}
              </span>
            </div>

            {/* Reply Actions */}
            <div className="flex items-center">
              <span className="hidden pr-3 text-xs text-muted-foreground [@media(min-width:770px)]:block">
                {formatDate(reply.createdAt)}
              </span>

              <LikeButton
                isLiked={isReplyLiked}
                likeCount={replyLikeCount}
                isToggling={isTogglingReplyLike}
                onToggle={toggleReplyLike}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps: ReplyCardProps, nextProps: ReplyCardProps): boolean =>
    prevProps.reply.id === nextProps.reply.id,
);

ReplyCard.displayName = "ReplyCard";

export default ReplyCard;
