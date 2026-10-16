import { api } from "@/api/api";
import type { CreateSearchRequestDto } from "@/types/request-types";
import type {
  GetPostResponse,
  GetSearchResponseDto,
  SearchUserResponseDto,
} from "@/types/response-types";
import type { PagedModel } from "@/types/api-response";
import {
  pagedInfiniteQueryOptions,
  pageParams,
  providePagedTags,
} from "@/api/pagination";

// Mirrors the backend's SearchController (/searches): the user and post searches,
// plus saving a term to the logged-in user's recent searches.
export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Infinite queries: one cache entry holds every page fetched so far.
    // <ResultPerPage, QueryArg, PageParam> - PageParam is Spring's zero-based page index.
    searchUsersByUsername: builder.infiniteQuery<
      PagedModel<SearchUserResponseDto>,
      string,
      number
    >({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: username, pageParam }) => ({
        url: `/searches/search/${username}`,
        method: "GET",
        // Stable order so pages don't shift between requests
        params: pageParams(pageParam, "id,asc"),
      }),
      providesTags: (result) =>
        providePagedTags(result, "User", [{ type: "UserList", id: "ALL" }]),
    }),

    getPostsByDescription: builder.infiniteQuery<
      PagedModel<GetPostResponse>,
      string,
      number
    >({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: description, pageParam }) => ({
        url: `/searches/search-posts/containing/${description}`,
        method: "GET",
        // Newest first
        params: pageParams(pageParam, "createdAt,desc"),
      }),
      providesTags: (result) =>
        providePagedTags(result, "Post", [{ type: "Post", id: "LIST" }]),
    }),

    // Saving is a mutation, separate from the searches above: queries are cached and
    // refetched on their own, so saving inside them would miss some searches and
    // duplicate others. Searching the same term again moves it back to the top.
    createRecentSearch: builder.mutation<
      GetSearchResponseDto,
      CreateSearchRequestDto
    >({
      query: (body) => ({
        url: "/searches/recent",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSearchUsersByUsernameInfiniteQuery,
  useGetPostsByDescriptionInfiniteQuery,
  useCreateRecentSearchMutation,
} = searchApi;
