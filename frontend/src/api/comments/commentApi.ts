import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";
import { type WriteCommentRequestDto } from "@/types/requestTypes";
import { type GetCommentResponseDto } from "@/types/responseTypes";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    createComment: builder.mutation<void, WriteCommentRequestDto>({
      query: (requestDto) => ({
        url: "/comments/create-comment",
        body: requestDto,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Comment", id: "LIST" },
        { type: "Comment", id: arg.postId },
      ],
    }),
    getCommentsByPostId: builder.query<
      GetCommentResponseDto[],
      { postId: number }
    >({
      query: ({ postId }) => ({
        url: `/comments/${postId}`,
        method: "GET",
      }),
      providesTags: (result, error, { postId }) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Comment" as const,
                id,
              })),
              { type: "Comment", id: "LIST" },
              { type: "Comment", id: postId },
            ]
          : [{ type: "Comment", id: "LIST" }],
    }),
    getPostCommentCount: builder.query<number, number>({
      query: (postId) => ({
        url: `/comments/post/${postId}/comment-count`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [
        { type: "Comment", id: "LIST" },
        { type: "Comment", id: postId },
      ],
    }),

    editComment: builder.mutation<void, { commentId: number; content: string }>(
      {
        query: ({ commentId, content }) => ({
          url: `/comments/edit-comment/${commentId}`,
          method: "PUT",
          body: content,
        }),
        invalidatesTags: (result, error, { commentId }) => [
          { type: "Comment", id: commentId },
          { type: "Comment", id: "LIST" },
        ],
      },
    ),

    deleteComment: builder.mutation<void, number>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Comment", id: "LIST" }, "Comment"],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsByPostIdQuery,
  useGetPostCommentCountQuery,
  useEditCommentMutation,
  useDeleteCommentMutation,
} = commentApi;

export const { util: commentApiUtil } = commentApi;
