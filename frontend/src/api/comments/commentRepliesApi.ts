import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";
import { type WriteReplyRequestDto } from "@/types/request-types";
import { type GetReplyResponseDto } from "@/types/response-types";

export const commentRepliesApi = createApi({
  reducerPath: "commentRepliesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CommentReply"],
  endpoints: (builder) => ({
    createReply: builder.mutation<void, WriteReplyRequestDto>({
      query: (requestDto) => ({
        url: "/comment-replies/create-reply",
        body: requestDto,
        method: "POST",
      }),
      // FIXED: Only invalidate the specific comment's reply count and list
      // Don't invalidate the generic "CommentReply" tag
      invalidatesTags: (result, error, arg) => [
        { type: "CommentReply", id: `COMMENT_${arg.commentId}` },
        { type: "CommentReply", id: `COUNT_${arg.commentId}` },
      ],
    }),
    getRepliesByCommentId: builder.query<
      GetReplyResponseDto[],
      { commentId: number }
    >({
      query: ({ commentId }) => ({
        url: `/comment-replies/comment/${commentId}`,
        method: "GET",
      }),
      // FIXED: Tag with the specific comment ID
      providesTags: (result, error, { commentId }) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "CommentReply" as const,
                id,
              })),
              { type: "CommentReply", id: `COMMENT_${commentId}` },
            ]
          : [{ type: "CommentReply", id: `COMMENT_${commentId}` }],
    }),
    getCommentReplyCount: builder.query<number, number>({
      query: (commentId) => ({
        url: `/comment-replies/comment/${commentId}/reply-count`,
        method: "GET",
      }),
      // FIXED: Tag with the specific comment ID
      providesTags: (result, error, commentId) => [
        { type: "CommentReply", id: `COUNT_${commentId}` },
      ],
    }),
    editReply: builder.mutation<void, { replyId: number; content: string }>({
      query: ({ replyId, content }) => ({
        url: `/comment-replies/edit-reply/${replyId}`,
        body: { content },
        method: "PUT",
      }),
      invalidatesTags: (result, error, { replyId }) => [
        { type: "CommentReply", id: `COMMENT_${replyId}` },
        { type: "CommentReply", id: `COUNT_${replyId}` },
      ],
    }),
    deleteReply: builder.mutation<void, number>({
      query: (replyId) => ({
        url: `/comment-replies/delete-reply/${replyId}`,
        method: "DELETE",
      }),
      // FIXED: Only invalidate the specific comment's reply count and list
      // Don't invalidate the generic "CommentReply" tag
      invalidatesTags: (result, error, replyId) => [
        { type: "CommentReply", id: `COMMENT_${replyId}` },
        { type: "CommentReply", id: `COUNT_${replyId}` },
      ],
    }),
  }),
});

export const {
  useCreateReplyMutation,
  useGetRepliesByCommentIdQuery,
  useGetCommentReplyCountQuery,
  useDeleteReplyMutation,
  useEditReplyMutation,
} = commentRepliesApi;
