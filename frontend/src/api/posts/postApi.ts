import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";
import type {
  CreatePostRequest,
  EditPostWithUploadRequestDto,
  EditPostWithUrlRequestDto,
} from "@/types/request-types";
import type { GetPostResponse } from "@/types/response-types";
import type { PagedModel } from "@/types/api-response";
import {
  pagedInfiniteQueryOptions,
  pageParams,
  providePagedTags,
} from "@/api/pagination";
import type { InfiniteData } from "@reduxjs/toolkit/query";

type PostsPage = PagedModel<GetPostResponse>;

// Newest first: ?page=N&size=10&sort=createdAt,desc
const postPageParams = (pageParam: number) =>
  pageParams(pageParam, "createdAt,desc");

// Per-post tags plus the LIST tag for the collection as a whole and any endpoint-specific extras
const providePagedPostTags = (
  result: InfiniteData<PostsPage, number> | undefined,
  extraTags: { type: "Post"; id: string }[] = [],
) =>
  providePagedTags(result, "Post", [
    { type: "Post", id: "LIST" },
    ...extraTags,
  ]);

// prettier-ignore
export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Post'],
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    createPost: builder.mutation<string, CreatePostRequest>({
      query: (newPost) => ({
        url: '/posts/create-post',
        method: 'POST',
        body: newPost,
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }, 'Post'],
    }),
    uploadPost: builder.mutation<string, { description: string; image: File }>({
      query: ({ description, image }) => {
        const formData = new FormData(); // Creates an empty FormData object
        formData.append('description', description); // append for description
        formData.append('image', image); // append for image
        return {
          url: '/posts/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [{ type: 'Post', id: 'LIST' }, 'Post'],
    }),

    // Infinite queries: one cache entry holds every page fetched so far.
    // <ResultPerPage, QueryArg, PageParam> - PageParam is Spring's zero-based page index.
    getPrivateAccountPostsUserFollows: builder.infiniteQuery<PostsPage, { privateAccountUsername: string }, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: { privateAccountUsername }, pageParam }) => ({
        url: `/posts/private-account/${privateAccountUsername}`,
        method: 'GET',
        params: postPageParams(pageParam),
      }),
      providesTags: (result) => providePagedPostTags(result),
    }),

    getPosts: builder.infiniteQuery<PostsPage, void, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: '/posts',
        method: 'GET',
        params: postPageParams(pageParam),
      }),
      providesTags: (result) => providePagedPostTags(result),
    }),
    getPostsCount: builder.query<number, string>({
      query: (username) => ({
        url: `/posts/${username}/count`,
        method: 'GET',
      }),
      providesTags: (_result, _error, username) => [
        { type: 'Post', id: `COUNT_${username}` }, // Unique tag for each user's count
      ],
    }),
    getPostById: builder.query<GetPostResponse, number>({
      query: (id) => ({
        url: `/posts/get-by-id/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    getPostsByUsername: builder.infiniteQuery<PostsPage, string, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: username, pageParam }) => ({
        url: `/posts/${username}`,
        method: 'GET',
        params: postPageParams(pageParam),
      }),
      providesTags: (_result, _error, username) => [
        { type: 'Post', id: username },
        { type: 'Post', id: 'LIST' },
      ],
    }),
    getPostsExcludingCurrentUser: builder.infiniteQuery<PostsPage, void, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: '/posts/excluded',
        method: 'GET',
        params: postPageParams(pageParam),
      }),
      providesTags: (result) => providePagedPostTags(result),
    }),
    getPostsLikedByCurrentUser: builder.infiniteQuery<PostsPage, void, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: '/posts/liked-by-me',
        method: 'GET',
        params: postPageParams(pageParam),
      }),
      providesTags: (result) => providePagedPostTags(result),
    }),

    getPostsSavedByCurrentUser: builder.infiniteQuery<PostsPage, void, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: '/posts/saved-by-me',
        method: 'GET',
        params: postPageParams(pageParam),
      }),
      providesTags: (result) => providePagedPostTags(result),
    }),
    getFollowingPostsByUserId: builder.infiniteQuery<PostsPage, void, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: '/posts/my-followers',
        method: 'GET',
        params: postPageParams(pageParam),
      }),
      providesTags: (result) => providePagedPostTags(result, [{ type: 'Post', id: 'FOLLOWING_POSTS' }]),
    }),

    getPostsByDescription: builder.infiniteQuery<PostsPage, string, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: description, pageParam }) => ({
        url: `/posts/search-posts/containing/${description}`,
        method: 'GET',
        params: postPageParams(pageParam),
      }),
      providesTags: (result) => providePagedPostTags(result),
    }),

    editPostWithUrl: builder.mutation<void, EditPostWithUrlRequestDto & { postId: number }>({
      query: ({ postId, ...body }) => ({
        url: `/posts/edit-with-url/${postId}`,
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    editPostWithUpload: builder.mutation<void, EditPostWithUploadRequestDto & { postId: number }>({
      query: ({ postId, ...body }) => {
        const formData = new FormData();
        formData.append('description', body.description);
        formData.append('image', body.image);
        return {
          url: `/posts/edit-with-upload/${postId}`,
          method: 'PUT',
          body: formData,
        };
      },
    }),

    deletePostByPostId: builder.mutation<void, number>({
      query: (postId) => ({
        url: `/posts/delete/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useUploadPostMutation,
  useGetPostsInfiniteQuery,
  useGetPrivateAccountPostsUserFollowsInfiniteQuery,
  useGetPostsByUsernameInfiniteQuery,
  useGetPostsExcludingCurrentUserInfiniteQuery,
  useGetPostByIdQuery,
  useGetPostsCountQuery,
  useGetPostsLikedByCurrentUserInfiniteQuery,
  useGetFollowingPostsByUserIdInfiniteQuery,
  useGetPostsSavedByCurrentUserInfiniteQuery,
  useGetPostsByDescriptionInfiniteQuery,
  useEditPostWithUrlMutation,
  useEditPostWithUploadMutation,
  useDeletePostByPostIdMutation,
} = postApi;

export const { util: postApiUtil } = postApi;
