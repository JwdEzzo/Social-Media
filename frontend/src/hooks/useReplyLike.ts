import {
  useIsReplyLikedQuery,
  useGetReplyLikeCountQuery,
  useToggleReplyLikeMutation,
} from "@/api/comments/commentReplyLikesApi";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useCallback } from "react";

export function useReplyLike(replyId: number | undefined) {
  const id = replyId || skipToken;

  const { data: isReplyLiked } = useIsReplyLikedQuery(id);
  const { data: replyLikeCount } = useGetReplyLikeCountQuery(id);
  const [toggleReplyLikeMutation, { isLoading: isTogglingReplyLike }] =
    useToggleReplyLikeMutation();

  const toggleReplyLike = useCallback(async () => {
    if (!replyId || isTogglingReplyLike) return;
    try {
      await toggleReplyLikeMutation(replyId).unwrap();
    } catch (error) {
      console.error("Failed to toggle reply like", error);
    }
  }, [replyId, isTogglingReplyLike, toggleReplyLikeMutation]);

  return {
    isReplyLiked,
    replyLikeCount,
    isTogglingReplyLike,
    toggleReplyLike,
  };
}
