import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/api/public/baseApi';
import { type WriteReplyRequestDto } from '@/types/requestTypes';
import { type GetReplyResponseDto } from '@/types/responseTypes';

export const commentRepliesApi = createApi({
  reducerPath: 'commentRepliesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CommentReply'],
  endpoints: (builder) => ({
    createReply: builder.mutation<void, WriteReplyRequestDto>({
      query: (requestDto) => ({
        url: '/comment-replies/create-reply',
        body: requestDto,
        method: 'POST',
      }),
      // FIXED: Only invalidate the specific comment's reply count and list
      // Don't invalidate the generic "CommentReply" tag
      invalidatesTags: (result, error, arg) => [
        { type: 'CommentReply', id: `COMMENT_${arg.commentId}` },
        { type: 'CommentReply', id: `COUNT_${arg.commentId}` },
      ],
    }),
    getRepliesByCommentId: builder.query<GetReplyResponseDto[], { commentId: number }>({
      query: ({ commentId }) => ({
        url: `/comment-replies/comment/${commentId}`,
        method: 'GET',
      }),
      // FIXED: Tag with the specific comment ID
      providesTags: (result, error, { commentId }) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'CommentReply' as const,
                id,
              })),
              { type: 'CommentReply', id: `COMMENT_${commentId}` },
            ]
          : [{ type: 'CommentReply', id: `COMMENT_${commentId}` }],
    }),
    getCommentReplyCount: builder.query<number, number>({
      query: (commentId) => ({
        url: `/comment-replies/comment/${commentId}/reply-count`,
        method: 'GET',
      }),
      // FIXED: Tag with the specific comment ID
      providesTags: (result, error, commentId) => [{ type: 'CommentReply', id: `COUNT_${commentId}` }],
    }),
  }),
});

export const { useCreateReplyMutation, useGetRepliesByCommentIdQuery, useGetCommentReplyCountQuery } =
  commentRepliesApi;
