import { useDeleteReplyMutation } from "@/api/comments/commentRepliesApi";
import {
  useGetReplyLikeCountQuery,
  useIsReplyLikedQuery,
  useToggleReplyLikeMutation,
} from "@/api/comments/commentReplyLikesApi";
import EditDeleteDropdown from "@/components/custom/edit-delete-dropdown";
import type {
  GetCommentResponseDto,
  GetReplyResponseDto,
  GetUserResponseDto,
} from "@/types/response-types";
import { Heart } from "lucide-react";
import { memo, useCallback } from "react";

interface ReplyCardProps {
  reply: GetReplyResponseDto;
  navigateToSelectedUserProfile: (username: string) => void;
  comment: GetCommentResponseDto;
  postUsername: string;
  loggedInUser: GetUserResponseDto | undefined;
  onEditReply: (replyId: number) => void;
}

const ReplyCard = memo(
  ({
    reply,
    navigateToSelectedUserProfile,
    comment,
    postUsername,
    loggedInUser,
    onEditReply,
    //
  }: ReplyCardProps) => {
    const [toggleReplyLike, { isLoading: isLikeToggling }] =
      useToggleReplyLikeMutation();

    const { data: replyLikeCount } = useGetReplyLikeCountQuery(reply?.id ?? 0, {
      skip: !reply?.id || reply.id === 0,
    });

    const { data: isReplyLiked } = useIsReplyLikedQuery(reply?.id ?? 0, {
      skip: !reply?.id || reply.id === 0,
    });

    const handleToggleLike = useCallback(() => {
      toggleReplyLike(reply.id);
    }, [toggleReplyLike, reply.id]);

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
      comment.appUser.username === loggedInUser?.username ||
      postUsername === loggedInUser?.username ||
      reply.appUser.username === loggedInUser?.username;

    return (
      <div className="pt-3">
        <div className="flex items-start gap-2.5">
          {/* Profile Picture */}
          <img
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
                {reply.createdAt.substring(0, 10)}
              </span>

              <Heart
                className={`size-3.5 cursor-pointer text-muted-foreground transition-[opacity,transform] hover:opacity-60 active:scale-90 ${
                  isReplyLiked
                    ? "fill-current text-red-500 dark:text-red-500"
                    : ""
                } ${isLikeToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleToggleLike}
              />
              <span className="pr-3 pl-1 text-xs font-medium text-muted-foreground">
                {replyLikeCount}
              </span>
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
