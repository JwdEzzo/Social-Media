import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";

export const commentReplyLikesApi = createApi({
  reducerPath: "commentReplyLikesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CommentReplyLike"],
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
