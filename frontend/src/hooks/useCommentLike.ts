import {
  useGetCommentLikeCountQuery,
  useIsCommentLikedQuery,
  useToggleCommentLikeMutation,
} from "@/api/comments/commentLikesApi";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useCallback } from "react";
/**
 * Like stats for one comment, instead of the two separate queries.
 *
 * RTK Query caches each one, so several components can show the same comment
 * without sending extra requests.
 * - commentId: undefined while the comment is loading; nothing is fetched until it's set
 */
export function useCommentLike(commentId: number | undefined) {
  const id = commentId || skipToken;
  const { data: isCommentLiked } = useIsCommentLikedQuery(id);
  const { data: commentLikeCount } = useGetCommentLikeCountQuery(id);

  const [toggleCommentLikeMutation, { isLoading: isTogglingCommentLike }] =
    useToggleCommentLikeMutation();

  const toggleCommentLike = useCallback(async () => {
    if (!commentId || isTogglingCommentLike) return;
    try {
      await toggleCommentLikeMutation(commentId).unwrap();
    } catch (error) {
      console.error("Failed to toggle comment like", error);
    }
  }, [commentId, isTogglingCommentLike, toggleCommentLikeMutation]);

  return {
    isCommentLiked,
    commentLikeCount,
    isTogglingCommentLike,
    toggleCommentLike,
  };
}
