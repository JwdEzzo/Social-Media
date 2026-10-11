import { api } from "@/api/api";
import type { NotificationResponseDto } from "@/types/response-types";
import type { PagedModel } from "@/types/api-response";
import {
  pagedInfiniteQueryOptions,
  pageParams,
  providePagedTags,
} from "@/api/pagination";

// Notifications go stale while the tab is in the background, so their hooks are
// called with { refetchOnFocus: true } (the shared API leaves it off by default)
export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Infinite query: one cache entry holds every page fetched so far, newest first
    getAllNotifications: builder.infiniteQuery<
      PagedModel<NotificationResponseDto>,
      void,
      number
    >({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: "/notifications",
        method: "GET",
        params: pageParams(pageParam, "createdAt,desc"),
      }),
      providesTags: (result) =>
        providePagedTags(result, "Notification", [
          { type: "Notification", id: "LIST" },
        ]),
    }),
    getUnreadNotificationCount: builder.query<number, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
    getLatest3Notifications: builder.query<NotificationResponseDto[], void>({
      query: () => ({
        url: "/notifications/latest-3",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
    markOneAsRead: builder.mutation<void, number>({
      query: (id) => ({
        url: `/notifications/${id}/mark-as-read`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/mark-all-as-read",
        method: "PUT",
      }),
      invalidatesTags: () => [{ type: "Notification", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllNotificationsInfiniteQuery,
  useGetUnreadNotificationCountQuery,
  useGetLatest3NotificationsQuery,
  useMarkOneAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
