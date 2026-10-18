import {
  useGetCommentReplyCountQuery,
  useGetRepliesByCommentIdInfiniteQuery,
} from "@/api/comments/commentRepliesApi";
import { useCommentLike } from "@/hooks/useCommentLike";
import { usePagedList } from "@/hooks/usePagedList";
import type { GetCommentResponse } from "@/types/response-types";
import { MessageCircle } from "lucide-react";
import { memo, useCallback, useState } from "react";
import ReplyCard from "../ReplyPages/ReplyCard";

import { useDeleteCommentMutation } from "@/api/comments/commentApi";
import EditDeleteDropdown from "@/components/custom/edit-delete-dropdown";
import LikeButton from "@/components/custom/like-button";
import UserAvatar from "@/components/custom/user-avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDate } from "@/utils/helpers";

interface CommentCardProps {
  comment: GetCommentResponse;
  onReply: (commentId: number, username: string) => void;
  navigateToSelectedUserProfile: (username: string) => void;
  postUsername: string;
  focusRef: React.RefObject<HTMLInputElement | null>;
  onEditComment: (commentId: number) => void;
  onEditReply: (replyId: number) => void;
}

const CommentCard = memo(
  ({
    comment,
    onReply,
    navigateToSelectedUserProfile,
    postUsername,
    onEditComment,
    onEditReply,
    focusRef,
  }: CommentCardProps) => {
    const { isMe } = useCurrentUser();
    // Each comment now has its own showReplies state
    const [showReplies, setShowReplies] = useState(false);

    const {
      isCommentLiked,
      commentLikeCount,
      isTogglingCommentLike,
      toggleCommentLike,
    } = useCommentLike(comment.id);

    const { data: commentReplyCount } = useGetCommentReplyCountQuery(
      comment?.id ?? 0,
      {
        skip: !comment?.id || comment.id === 0,
      },
    );

    const [deleteComment] = useDeleteCommentMutation();

    // // highlight the comment being edited
    // const isCommentBeingEdited =
    //   editMode.isEditing && editMode.commentId === comment.id;

    const handleDeleteComment = useCallback(async () => {
      try {
        await deleteComment(comment.id).unwrap();
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }, [comment.id, deleteComment]);

    // Fetch replies when showReplies is true, a page at a time
    const repliesQuery = useGetRepliesByCommentIdInfiniteQuery(
      { commentId: comment.id },
      { skip: !showReplies },
    );
    const { isLoading: isRepliesLoading } = repliesQuery;
    const {
      items: replies,
      loadMore: loadMoreReplies,
      hasNextPage: hasMoreReplies,
      isFetchingNextPage: isFetchingMoreReplies,
    } = usePagedList(repliesQuery);

    // Comment and post owners can edit/delete the comment
    const isAuthenticated =
      isMe(comment.appUser.username) || isMe(postUsername);

    return (
      <div className={`py-2.5`}>
        <div className="flex items-start gap-3">
          {/* Profile Picture */}
          <UserAvatar
            src={comment.appUser.profilePictureUrl}
            alt={comment.appUser.username}
            className="size-8 shrink-0 cursor-pointer rounded-full object-cover ring-1 ring-border"
            loading="lazy"
            decoding="async"
            onClick={() => {
              navigateToSelectedUserProfile(comment.appUser.username);
            }}
          />

          {/* Comment Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-baseline gap-2">
                <span
                  className="cursor-pointer text-sm font-semibold hover:opacity-70"
                  onClick={() => {
                    navigateToSelectedUserProfile(comment.appUser.username);
                  }}
                >
                  {comment.appUser.username}
                </span>
                <span className="hidden text-xs text-muted-foreground [@media(min-width:745px)]:block">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <EditDeleteDropdown
                isAuthenticated={isAuthenticated}
                entityId={comment.id}
                handleEntityDelete={handleDeleteComment}
                handleEntityEdit={onEditComment}
              />
            </div>

            <div className="mb-1.5">
              <span className="whitespace-pre-line break-words text-sm leading-snug text-foreground">
                {comment.content}
              </span>
            </div>

            {/* Comment Actions */}
            <div className="flex items-center">
              <LikeButton
                isLiked={isCommentLiked}
                likeCount={commentLikeCount}
                isToggling={isTogglingCommentLike}
                onToggle={toggleCommentLike}
              />
              <MessageCircle
                className="size-3.5 -scale-x-100 cursor-pointer text-muted-foreground transition-opacity hover:opacity-60"
                onClick={() => {
                  onReply(comment.id, comment.appUser.username);
                  setShowReplies(true);
                  focusRef.current?.focus();
                }}
              />
              <span className="pl-1 text-xs font-medium text-muted-foreground">
                {commentReplyCount}
              </span>
            </div>

            {/* View Replies Button */}
            {commentReplyCount! > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="mt-2 flex items-center gap-3 text-xs font-semibold text-muted-foreground before:h-px before:w-6 before:bg-muted-foreground/50 hover:text-foreground"
              >
                {showReplies
                  ? "Hide replies"
                  : `View ${commentReplyCount} ${
                      commentReplyCount === 1 ? "reply" : "replies"
                    }`}
              </button>
            )}
            {/* If showReplies is true, render the replies */}
            {/* If replies are loading, show loading replies... */}
            {/* If they are loaded, and their length is > 0 , render them */}
            {/* If either the 1st condition or the 3rd is false, show "No replies yet" */}

            {/* Replies Section */}
            {showReplies && (
              <div>
                {isRepliesLoading ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Loading replies...
                  </div>
                ) : replies.length > 0 ? (
                  <>
                    {replies.map((reply) => (
                      <ReplyCard
                        key={reply.id}
                        reply={reply}
                        navigateToSelectedUserProfile={
                          navigateToSelectedUserProfile
                        }
                        postUsername={postUsername}
                        comment={comment}
                        onEditReply={onEditReply}
                        //
                      />
                    ))}
                    {hasMoreReplies && (
                      <button
                        onClick={loadMoreReplies}
                        disabled={isFetchingMoreReplies}
                        className="mt-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        {isFetchingMoreReplies
                          ? "Loading replies..."
                          : "View more replies"}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="mt-2 text-xs text-muted-foreground">
                    No replies yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the comment ID or callbacks changed
    const commentUnchanged = prevProps.comment.id === nextProps.comment.id;
    const callbacksUnchanged = prevProps.onReply === nextProps.onReply;

    return commentUnchanged && callbacksUnchanged;
  },
);

CommentCard.displayName = "CommentCard";

export default CommentCard;
