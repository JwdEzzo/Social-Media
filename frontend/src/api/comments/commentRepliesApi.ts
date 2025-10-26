import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";
import { type WriteReplyRequestDto } from "@/types/requestTypes";
import { type GetReplyResponseDto } from "@/types/responseTypes";

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
      invalidatesTags: [{ type: "CommentReply", id: "LIST" }, "CommentReply"],
    }),
    getRepliesByCommentId: builder.query<
      GetReplyResponseDto[],
      { commentId: number }
    >({
      query: ({ commentId }) => ({
        url: `/comment-replies/comment/${commentId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "CommentReply" as const,
                id,
              })),
              { type: "CommentReply", id: "LIST" },
            ]
          : [{ type: "CommentReply", id: "LIST" }],
    }),
    getCommentReplyCount: builder.query<number, number>({
      query: (commentId) => ({
        url: `/comment-replies/comment/${commentId}/reply-count`,
        method: "GET",
      }),
      providesTags: [{ type: "CommentReply", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateReplyMutation,
  useGetRepliesByCommentIdQuery,
  useGetCommentReplyCountQuery,
} = commentRepliesApi;
