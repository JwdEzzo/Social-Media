import { api } from "@/api/api";
import { type WriteCommentRequest } from "@/types/request-types";
import { type GetCommentResponse } from "@/types/response-types";
import type { PagedModel } from "@/types/api-response";
import {
  pagedInfiniteQueryOptions,
  pageParams,
  providePagedTags,
} from "@/api/pagination";

export const commentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation<void, WriteCommentRequest>({
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
    // Infinite query: one cache entry per post holds every page fetched so far.
    // Oldest first, so the conversation reads top to bottom and new comments land at the end.
    getCommentsByPostId: builder.infiniteQuery<
      PagedModel<GetCommentResponse>,
      { postId: number },
      number
    >({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: { postId }, pageParam }) => ({
        url: `/comments/${postId}`,
        method: "GET",
        params: pageParams(pageParam, "createdAt,asc"),
      }),
      providesTags: (result, _error, { postId }) =>
        providePagedTags(result, "Comment", [
          { type: "Comment", id: "LIST" },
          { type: "Comment", id: postId },
        ]),
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
  useGetCommentsByPostIdInfiniteQuery,
  useGetPostCommentCountQuery,
  useEditCommentMutation,
  useDeleteCommentMutation,
} = commentApi;

export const { util: commentApiUtil } = commentApi;
