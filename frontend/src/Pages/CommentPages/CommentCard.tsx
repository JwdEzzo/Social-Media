import {
  useGetCommentLikeCountQuery,
  useIsCommentLikedQuery,
} from "@/api/comments/commentLikesApi";
import {
  useGetCommentReplyCountQuery,
  useGetRepliesByCommentIdQuery,
} from "@/api/comments/commentRepliesApi";
import type { GetCommentResponseDto } from "@/types/responseTypes";
import { Heart, MessageCircle } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import ReplyCard from "../ReplyPages/ReplyCard";

interface CommentCardProps {
  comment: GetCommentResponseDto;
  handleToggleCommentLike: (commentId: number) => void;
  isTogglingCommentLike: boolean;
  onReply: (commentId: number, username: string) => void;
  showReplies: boolean;
  setShowReplies: Dispatch<SetStateAction<boolean>>;
}

function CommentCard({
  comment,
  handleToggleCommentLike,
  isTogglingCommentLike,
  onReply,
  showReplies,
  setShowReplies,
}: CommentCardProps) {
  const { data: commentLikeCount } = useGetCommentLikeCountQuery(
    comment?.id ?? 0,
    {
      skip: !comment?.id || comment.id === 0,
    }
  );
  const { data: isCommentLiked } = useIsCommentLikedQuery(comment?.id ?? 0, {
    skip: !comment?.id || comment.id === 0,
  });

  const { data: commentReplyCount } = useGetCommentReplyCountQuery(
    comment?.id ?? 0,
    {
      skip: !comment?.id || comment.id === 0,
    }
  );

  // Fetch replies when showReplies is true
  const { data: replies, isLoading: isRepliesLoading } =
    useGetRepliesByCommentIdQuery(
      { commentId: comment.id },
      { skip: !showReplies }
    );

  return (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Profile Picture */}
        <img
          src={comment.appUser.profilePictureUrl}
          alt={comment.appUser.username}
          className="w-8 h-8 rounded-full object-cover"
        />

        {/* Comment Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[12px] dark:text-white font-sans">
              {comment.appUser.username}
            </span>
            <span className="text-[10px] pt-1 text-gray-500 dark:text-gray-400 hidden [@media(min-width:745px)]:block">
              {comment.createdAt.substring(0, 10)}
            </span>
          </div>

          <div className="mb-1">
            <span className="text-[12px] dark:text-white break-words font-normal">
              {comment.content}
            </span>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center">
            <Heart
              className={`h-4 w-4 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors ${
                isCommentLiked
                  ? "fill-current text-red-500 dark:text-red-500"
                  : ""
              } ${
                isTogglingCommentLike ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handleToggleCommentLike(comment.id)}
            />
            <span className="text-gray-700 dark:text-gray-300 text-sm pl-1 pr-2">
              {commentLikeCount}
            </span>
            <MessageCircle
              className="h-4 w-4 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500 transition-colors"
              onClick={() => {
                onReply(comment.id, comment.appUser.username);
                setShowReplies(true);
              }}
            />
            <span className="text-gray-700 dark:text-gray-300 text-sm pl-1">
              {commentReplyCount}
            </span>
          </div>

          {/* View Replies Button */}
          {commentReplyCount! > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-[12px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-2"
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
                <div className="text-[12px] text-gray-500 dark:text-gray-400 ml-8">
                  Loading replies...
                </div>
              ) : replies && replies.length > 0 ? (
                replies.map((reply) => (
                  <ReplyCard key={reply.id} reply={reply} />
                ))
              ) : (
                <div className="text-[12px] text-gray-500 dark:text-gray-400 ml-8">
                  No replies yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentCard;
