import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../public/baseApi";
import type { NotificationResponseDto } from "@/types/response-types";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notification"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getAllNotifications: builder.query<NotificationResponseDto[], void>({
      query: () => ({
        url: "/notifications",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Notification" as const,
                id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
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
  useGetAllNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useGetLatest3NotificationsQuery,
  useMarkOneAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
