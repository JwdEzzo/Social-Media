import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../public/baseApi";

export const commentLikesApi = createApi({
  reducerPath: "commentLikesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CommentLike"],
  endpoints: (builder) => ({
    toggleCommentLike: builder.mutation<void, number>({
      query: (commentId) => ({
        url: `/comment-likes/comment/${commentId}`,
        method: "POST",
      }),
      invalidatesTags: ["CommentLike"],
    }),
    getCommentLikeCount: builder.query<number, number>({
      query: (commentId) => ({
        url: `/comment-likes/comment/${commentId}/like-count`,
        method: "GET",
      }),
      providesTags: ["CommentLike"],
    }),
    isCommentLiked: builder.query<boolean, number>({
      query: (commentId) => ({
        url: `/comment-likes/comment/${commentId}/is-liked`,
        method: "GET",
      }),
      providesTags: ["CommentLike"],
    }),
  }),
});

export const {
  useToggleCommentLikeMutation,
  useGetCommentLikeCountQuery,
  useIsCommentLikedQuery,
} = commentLikesApi;
