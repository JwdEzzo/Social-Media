import { api } from "@/api/api";
import type { CreateSearchRequest } from "@/types/request-types";
import type {
  GetPostResponse,
  GetSearchResponse,
  SearchUserResponse,
} from "@/types/response-types";
import type { PagedModel } from "@/types/api-response";
import {
  pagedInfiniteQueryOptions,
  pageParams,
  providePagedTags,
} from "@/api/pagination";

// Mirrors the backend's SearchController (/searches): the user and post searches,
// plus saving and removing terms in the logged-in user's recent searches.
export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Infinite queries: one cache entry holds every page fetched so far.
    // <ResultPerPage, QueryArg, PageParam> - PageParam is Spring's zero-based page index.
    searchUsersByUsername: builder.infiniteQuery<
      PagedModel<SearchUserResponse>,
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

    // The logged-in user's recent searches, newest first. No username argument:
    // the backend reads the user from the token, so no one can request another
    // user's searches.
    getSearchesForUser: builder.infiniteQuery<
      PagedModel<GetSearchResponse>,
      void,
      number
    >({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: "/searches/recent",
        method: "GET",
        params: pageParams(pageParam, "createdAt,desc"),
      }),
      providesTags: (result) =>
        providePagedTags(result, "RecentSearch", [
          { type: "RecentSearch", id: "LIST" },
        ]),
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
      GetSearchResponse,
      CreateSearchRequest
    >({
      query: (body) => ({
        url: "/searches/recent",
        method: "POST",
        body,
      }),
      // Refetch the recents list so the new or bumped term shows at the top
      invalidatesTags: [{ type: "RecentSearch", id: "LIST" }],
    }),

    // Remove one term from the logged-in user's recents. Only the term is sent:
    // the backend reads the user from the token, so this can't touch anyone
    // else's searches. Sent as a query param so terms with "/" or spaces are safe.
    deleteSearchForUser: builder.mutation<void, number>({
      query: (searchId) => ({
        url: `/searches/recent/${searchId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "RecentSearch", id: "LIST" }],
    }),

    deleteAllSearchesForUser: builder.mutation<void, void>({
      query: () => ({
        url: "/searches/recent/all",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "RecentSearch", id: "LIST" }],
    }),
  }),
});

export const {
  useSearchUsersByUsernameInfiniteQuery,
  useGetPostsByDescriptionInfiniteQuery,
  useGetSearchesForUserInfiniteQuery,
  useCreateRecentSearchMutation,
  useDeleteSearchForUserMutation,
  useDeleteAllSearchesForUserMutation,
} = searchApi;
