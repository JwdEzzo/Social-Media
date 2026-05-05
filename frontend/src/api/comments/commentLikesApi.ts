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
      invalidatesTags: (result, error, commentId) => [
        { type: "CommentLike", id: commentId },
      ],
    }),
    getCommentLikeCount: builder.query<number, number>({
      query: (commentId) => ({
        url: `/comment-likes/comment/${commentId}/like-count`,
        method: "GET",
      }),
      providesTags: (result, error, commentId) => [
        { type: "CommentLike", id: commentId },
      ],
    }),
    isCommentLiked: builder.query<boolean, number>({
      query: (commentId) => ({
        url: `/comment-likes/comment/${commentId}/is-liked`,
        method: "GET",
      }),
      providesTags: (result, error, commentId) => [
        { type: "CommentLike", id: commentId },
      ],
    }),
  }),
});

export const {
  useToggleCommentLikeMutation,
  useGetCommentLikeCountQuery,
  useIsCommentLikedQuery,
} = commentLikesApi;
