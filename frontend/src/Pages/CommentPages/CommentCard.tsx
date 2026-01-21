import {
  useGetCommentLikeCountQuery,
  useIsCommentLikedQuery,
} from "@/api/comments/commentLikesApi";
import {
  useGetCommentReplyCountQuery,
  useGetRepliesByCommentIdQuery,
} from "@/api/comments/commentRepliesApi";
import type {
  GetCommentResponseDto,
  GetUserResponseDto,
} from "@/types/responseTypes";
import {
  Edit,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { memo, useCallback, useState } from "react";
import ReplyCard from "../ReplyPages/ReplyCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteCommentMutation } from "@/api/comments/commentApi";

interface CommentCardProps {
  comment: GetCommentResponseDto;
  handleToggleCommentLike: (commentId: number) => void;
  isTogglingCommentLike: boolean;
  onReply: (commentId: number, username: string) => void;
  navigateToSelectedUserProfile: (username: string) => void;
  loggedInUser: GetUserResponseDto | undefined;
  postUsername: string;
  onEdit: (commentId: number) => void;
}

const CommentCard = memo(
  ({
    comment,
    handleToggleCommentLike,
    isTogglingCommentLike,
    onReply,
    navigateToSelectedUserProfile,
    loggedInUser,
    postUsername,
    onEdit,
  }: CommentCardProps) => {
    // Each comment now has its own showReplies state
    const [showReplies, setShowReplies] = useState(false);

    const { data: commentLikeCount } = useGetCommentLikeCountQuery(
      comment?.id ?? 0,
      {
        skip: !comment?.id || comment.id === 0,
      },
    );
    const { data: isCommentLiked } = useIsCommentLikedQuery(comment?.id ?? 0, {
      skip: !comment?.id || comment.id === 0,
    });

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

    // Fetch replies when showReplies is true
    const { data: replies, isLoading: isRepliesLoading } =
      useGetRepliesByCommentIdQuery(
        { commentId: comment.id },
        { skip: !showReplies },
      );

    const isAuthenticated =
      comment.appUser.username === loggedInUser?.username ||
      loggedInUser?.username === postUsername;

    return (
      <div
        className={`py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0  transition-all `}
      >
        <div className="flex items-start gap-3">
          {/* Profile Picture */}
          <img
            src={comment.appUser.profilePictureUrl}
            alt={comment.appUser.username}
            className="w-8 h-8 rounded-full object-cover"
            loading="lazy"
            decoding="async"
            onClick={() => {
              navigateToSelectedUserProfile(comment.appUser.username);
            }}
          />

          {/* Comment Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-bold text-[12px] dark:text-white font-sans"
                  onClick={() => {
                    navigateToSelectedUserProfile(comment.appUser.username);
                  }}
                >
                  {comment.appUser.username}
                </span>
                <span className="text-[10px] pt-1 text-gray-500 dark:text-gray-400 hidden [@media(min-width:745px)]:block">
                  {comment.createdAt.substring(0, 10)}
                </span>
              </div>
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <MoreHorizontal className="h-6 w-6 cursor-pointer" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-fit dark:bg-gray-900"
                    align="center"
                  >
                    {/* Dropdown Content - Edit and Delete */}
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <div className="flex items-center justify-start gap-7 cursor-pointer">
                        <DropdownMenuItem
                          className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-600 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900"
                          onClick={() => onEdit(comment.id)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <Edit className="size-4 text-blue-200" />
                      </div>
                      <div
                        className="flex items-center justify-start cursor-pointer"
                        onClick={handleDeleteComment}
                      >
                        <DropdownMenuItem className="text-red-400 hover:text-red-600 dark:hover:text-red-600 cursor-pointer font-bold pr-[18px] hover:bg-gray-200 dark:hover:bg-gray-900">
                          Delete
                        </DropdownMenuItem>
                        <Trash2 className="size-4 text-red-200" />
                      </div>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
                    <ReplyCard
                      key={reply.id}
                      reply={reply}
                      navigateToSelectedUserProfile={
                        navigateToSelectedUserProfile
                      }
                      //
                    />
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
  },
  (prevProps, nextProps) => {
    // Only re-render if the comment ID or callbacks changed
    const commentUnchanged = prevProps.comment.id === nextProps.comment.id;
    const callbacksUnchanged =
      prevProps.handleToggleCommentLike === nextProps.handleToggleCommentLike &&
      prevProps.onReply === nextProps.onReply;

    return commentUnchanged && callbacksUnchanged;
  },
);

CommentCard.displayName = "CommentCard";

export default CommentCard;
