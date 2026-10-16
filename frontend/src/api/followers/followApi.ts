import { api } from "@/api/api";
import type { FollowRequestResponse } from "@/types/response-types";
import type { PagedModel } from "@/types/api-response";
import { pagedInfiniteQueryOptions, pageParams } from "@/api/pagination";

type FollowRequestsPage = PagedModel<FollowRequestResponse>;

export const followApi = api.injectEndpoints({
  endpoints: (builder) => ({
    toggleFollow: builder.mutation<void, string>({
      query: (followingUsername) => ({
        url: `/follows/following/${followingUsername}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, followingUsername) => [
        { type: "Follow", id: followingUsername },
        { type: "Follow", id: "COUNT" },
        { type: "Follow", id: `PENDING-${followingUsername}` },
        // Follower / following lists
        { type: "User", id: "LIST" },
        // The home feed of followed accounts, and this account's posts
        // (a private account's posts appear or disappear)
        { type: "Post", id: "FOLLOWING_POSTS" },
        { type: "Post", id: followingUsername },
      ],
    }),
    getFollowerCount: builder.query<number, string>({
      query: (followingUsername) => ({
        url: `/follows/${followingUsername}/follower-count`,
        method: "GET",
      }),
      providesTags: (_result, _error, followingUsername) => [
        { type: "Follow", id: followingUsername },
        { type: "Follow", id: "COUNT" },
      ],
    }),
    getFollowingCount: builder.query<number, string>({
      query: (username) => ({
        url: `/follows/${username}/following-count`,
        method: "GET",
      }),
      providesTags: (_result, _error, username) => [
        { type: "Follow", id: username },
        { type: "Follow", id: "COUNT" },
      ],
    }),
    isFollowed: builder.query<boolean, string>({
      query: (followingUsername) => ({
        url: `/follows/already-follows/${followingUsername}`,
        method: "GET",
      }),
      providesTags: (_result, _error, followingUsername) => [
        { type: "Follow", id: followingUsername },
      ],
    }),

    // Infinite queries: one cache entry holds every page fetched so far, newest request first
    getIncomingFollowRequests: builder.infiniteQuery<
      FollowRequestsPage,
      void,
      number
    >({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: `/follow-requests/incoming`,
        method: "GET",
        params: pageParams(pageParam, "createdAt,desc"),
      }),
      providesTags: [{ type: "Follow", id: "REQUESTS" }],
    }),

    acceptFollowRequest: builder.mutation<
      void,
      { requestId: number; requesterUsername: string }
    >({
      query: ({ requestId }) => ({
        url: `/follow-requests/${requestId}/accept`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, { requesterUsername }) => [
        { type: "Follow", id: "REQUESTS" },
        { type: "Follow", id: "COUNT" },
        { type: "Follow", id: `PENDING-${requesterUsername}` },
        { type: "User", id: "LIST" },
      ],
    }),

    declineFollowRequest: builder.mutation<
      void,
      { requestId: number; requesterUsername: string }
    >({
      query: ({ requestId }) => ({
        url: `/follow-requests/${requestId}/decline`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, { requesterUsername }) => [
        { type: "Follow", id: "REQUESTS" },
        { type: "Follow", id: `PENDING-${requesterUsername}` },
      ],
    }),

    cancelFollowRequest: builder.mutation<
      void,
      { requestId: number; requesterUsername: string }
    >({
      query: ({ requestId }) => ({
        url: `/follow-requests/${requestId}/cancel`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { requesterUsername }) => [
        { type: "Follow", id: "REQUESTS" },
        { type: "Follow", id: `PENDING-${requesterUsername}` }, // this knows which tag to bust
      ],
    }),

    hasPendingRequest: builder.query<number, string>({
      query: (targetUsername) => ({
        url: `/follows/pending-request/${targetUsername}`,
        method: "GET",
      }),
      providesTags: (_result, _error, targetUsername) => [
        { type: "Follow", id: `PENDING-${targetUsername}` },
      ],
    }),

    getIncomingFollowRequestsCount: builder.query<number, void>({
      query: () => ({
        url: `/follow-requests/incoming/count`,
        method: "GET",
      }),
      providesTags: [{ type: "Follow", id: "REQUESTS" }],
    }),

    getAllOutgoingFollowRequests: builder.infiniteQuery<
      FollowRequestsPage,
      void,
      number
    >({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: `/follow-requests/outgoing`,
        method: "GET",
        params: pageParams(pageParam, "createdAt,desc"),
      }),
      providesTags: [{ type: "Follow", id: "REQUESTS" }],
    }),

    getOutgoingFollowRequestsCount: builder.query<number, void>({
      query: () => ({
        url: `/follow-requests/outgoing/count`,
        method: "GET",
      }),
      providesTags: [{ type: "Follow", id: "REQUESTS" }],
    }),
  }),
});

export const {
  useToggleFollowMutation,
  useGetFollowerCountQuery,
  useIsFollowedQuery,
  useGetFollowingCountQuery,
  useGetIncomingFollowRequestsInfiniteQuery,
  useAcceptFollowRequestMutation,
  useDeclineFollowRequestMutation,
  useCancelFollowRequestMutation,
  useHasPendingRequestQuery,
  useGetIncomingFollowRequestsCountQuery,
  useGetAllOutgoingFollowRequestsInfiniteQuery,
  useGetOutgoingFollowRequestsCountQuery,
} = followApi;

export const { util: followApiUtil } = followApi;
