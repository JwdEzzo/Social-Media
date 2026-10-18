import { useGetPostCommentCountQuery } from "@/api/comments/commentApi";
import {
  useGetPostLikeCountQuery,
  useIsPostLikedQuery,
} from "@/api/posts/postLikesApi";
import {
  useGetPostSaveCountQuery,
  useIsPostSavedQuery,
} from "@/api/posts/postSavesApi";
import { skipToken } from "@reduxjs/toolkit/query/react";

/**
 * Like, save and comment stats for one post, instead of the five separate queries.
 *
 * RTK Query caches each one, so several components can show the same post
 * without sending extra requests.
 * - postId: undefined while the post is loading; nothing is fetched until it's set
 */
export function usePostStats(postId: number | undefined) {
  // skipToken skips every request until there's a real id
  const id = postId || skipToken;

  const { data: isPostLiked } = useIsPostLikedQuery(id);
  const { data: postLikeCount } = useGetPostLikeCountQuery(id);
  const { data: isPostSaved } = useIsPostSavedQuery(id);
  const { data: postSaveCount } = useGetPostSaveCountQuery(id);
  const { data: postCommentCount } = useGetPostCommentCountQuery(id);

  return {
    isPostLiked,
    postLikeCount,
    isPostSaved,
    postSaveCount,
    postCommentCount,
  };
}
