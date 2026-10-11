import { api } from "@/api/api";

export const commentReplyLikesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    toggleReplyLike: builder.mutation<void, number>({
      query: (replyId) => ({
        url: `/comment-reply-likes/comment-reply/${replyId}`,
        method: "POST",
      }),
      invalidatesTags: ["CommentReplyLike"],
    }),
    getReplyLikeCount: builder.query<number, number>({
      query: (replyId) => ({
        url: `/comment-reply-likes/comment-reply/${replyId}/like-count`,
        method: "GET",
      }),
      providesTags: ["CommentReplyLike"],
    }),
    isReplyLiked: builder.query<boolean, number>({
      query: (replyId) => ({
        url: `/comment-reply-likes/comment-reply/${replyId}/is-liked`,
        method: "GET",
      }),
      providesTags: ["CommentReplyLike"],
    }),
  }),
});

export const {
  useToggleReplyLikeMutation,
  useGetReplyLikeCountQuery,
  useIsReplyLikedQuery,
} = commentReplyLikesApi;
