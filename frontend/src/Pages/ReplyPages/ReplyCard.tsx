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
      <div className="pt-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="flex items-start gap-3">
          {/* Profile Picture */}
          <img
            src={reply.appUser.profilePictureUrl}
            alt={reply.appUser.username}
            className="w-8 h-8 rounded-full object-cover"
            loading="lazy"
            decoding="async"
            onClick={() => {
              navigateToSelectedUserProfile(reply.appUser.username);
            }}
          />

          {/* Reply Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center justify-between">
              <span
                className="font-bold text-[11px] dark:text-white font-sans"
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

            <div className="pb-1">
              <span className="text-sm dark:text-white break-words font-normal">
                {reply.content}
              </span>
            </div>

            {/* Reply Actions */}
            <div className="flex items-center">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 hidden [@media(min-width:770px)]:block pr-2">
                {reply.createdAt.substring(0, 10)}
              </span>

              <Heart
                className={`h-4 w-4 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors ${
                  isReplyLiked
                    ? "fill-current text-red-500 dark:text-red-500"
                    : ""
                } ${isLikeToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleToggleLike}
              />
              <span className="text-gray-700 dark:text-gray-300 text-[13px] pl-1 pr-3 pb-[1px]">
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
