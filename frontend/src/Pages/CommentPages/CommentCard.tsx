import {
  useGetCommentLikeCountQuery,
  useIsCommentLikedQuery,
} from "@/api/comments/commentLikesApi";
import { useGetCommentReplyCountQuery } from "@/api/comments/commentRepliesApi";
import type { GetCommentResponseDto } from "@/types/responseTypes";
import { Heart, MessageCircle } from "lucide-react";

interface CommentCardProps {
  comment: GetCommentResponseDto;
  handleToggleCommentLike: (commentId: number) => void;
  isTogglingCommentLike: boolean;
}

function CommentCard({
  comment,
  handleToggleCommentLike,
  isTogglingCommentLike,
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

  console.log(commentReplyCount);

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
            <span className="font-bold text-sm dark:text-white font-sans">
              {comment.appUser.username}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden [@media(min-width:745px)]:block">
              {comment.createdAt.substring(0, 10)}
            </span>
          </div>

          <div className="mb-2">
            <span className="text-sm dark:text-white break-words font-serif">
              {comment.content}
            </span>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center ">
            <Heart
              className={`h-5 w-5 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors ${
                isCommentLiked
                  ? "fill-current text-red-500 dark:text-red-500"
                  : ""
              } ${
                isTogglingCommentLike ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handleToggleCommentLike(comment.id)}
            />
            <span className="text-gray-700 dark:text-gray-300 text-sm pl-1 pr-3">
              {commentLikeCount}
            </span>
            <MessageCircle className="h-5 w-5 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500 transition-colors " />
            <span className="text-gray-700 dark:text-gray-300 text-sm pl-1 pr-3">
              {commentReplyCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentCard;
