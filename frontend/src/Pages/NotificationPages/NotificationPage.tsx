import {
  useGetAllNotificationsInfiniteQuery,
  useMarkAllAsReadMutation,
  useMarkOneAsReadMutation,
} from "@/api/notifications/notificationApi";
import { usePagedList } from "@/hooks/usePagedList";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/custom/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BellOff, CheckCheck, ArrowRight } from "lucide-react";
import { useNavigateToProfile } from "@/hooks/useNavigateToProfile";
import { cn } from "@/utils/errors";
import { formatTimeAgo } from "@/utils/helpers";
import { getNotificationDetails } from "@/utils/notification-details";
import type { NotificationResponse } from "@/types/response-types";
import NavigateBack from "@/components/custom/navigate-back";
import { StatusCard } from "@/components/custom/status-card";

function NotificationPage() {
  const navigateToProfile = useNavigateToProfile();

  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllAsReadMutation();
  const [markOneAsRead] = useMarkOneAsReadMutation();

  const notificationsQuery = useGetAllNotificationsInfiniteQuery(undefined, {
    refetchOnFocus: true,
  });
  const {
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
    refetch: refetchNotifications,
  } = notificationsQuery;
  const {
    items: notifications,
    loadMore: loadMoreNotifications,
    hasNextPage: hasMoreNotifications,
    isFetchingNextPage: isFetchingMoreNotifications,
  } = usePagedList(notificationsQuery);

  // Only checks the pages loaded so far; newest-first ordering puts unread ones on top
  const hasUnread = notifications.some((n) => !n.isRead);

  const handleNotificationClick = async (
    notification: NotificationResponse,
  ) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await markOneAsRead(notification.id).unwrap();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate to appropriate profile page
    navigateToProfile(notification.sender.username);
  };

  // Loading state
  if (isNotificationsLoading) {
    return (
      <div className="min-h-svh bg-background">
        <NavigateBack />
        <main className="flex-1 bg-background pt-16 pb-10">
          <div className="mx-auto max-w-[600px] px-4">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-3">
                  <Skeleton className="size-11 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (isNotificationsError) {
    return (
      <div className="min-h-svh bg-background">
        <NavigateBack />
        <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4"></div>
        </header>
        <main className="flex-1 bg-background pt-16 pb-10">
          <div className="flex items-center justify-center min-h-[50vh]">
            <StatusCard
              isError
              title="Error Loading Notifications"
              message="We couldn't retrieve your notifications. Please check your network connection and try again."
              onRetry={refetchNotifications}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background">
      <NavigateBack />
      {/* Main Content */}
      <main className="flex-1 bg-background pt-16 pb-10">
        <div className="mx-auto max-w-[600px] px-4">
          {/* Header section with count and mark as read */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-0.5 text-xl font-semibold text-foreground">
                Notifications
              </h2>
              <p className="text-sm text-muted-foreground">
                Stay updated on recent likes, comments, and follows.
              </p>
            </div>
            {hasUnread && (
              <Button
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                variant="outline"
                size="sm"
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-transparent bg-transparent font-semibold text-sky-500 shadow-none hover:bg-sky-500/10 hover:text-sky-600 sm:w-auto dark:border-transparent dark:bg-transparent dark:hover:bg-sky-500/10 dark:hover:text-sky-400"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark all as read</span>
              </Button>
            )}
          </div>

          {/* List details */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
              <div className="mb-4 flex size-16 select-none items-center justify-center rounded-full border-2 border-foreground">
                <BellOff className="size-7 text-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                All caught up!
              </h3>
              <p className="max-w-[280px] text-sm text-muted-foreground">
                You have no notifications yet. Interaction activity will be
                displayed here as it happens.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const details = getNotificationDetails(
                  notification.notificationType,
                );
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-accent/60",
                      notification.isRead
                        ? "bg-transparent"
                        : "bg-sky-500/5 dark:bg-sky-500/10",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {/* Avatar container with relative badge placement */}
                      <div className="relative shrink-0">
                        <UserAvatar
                          src={notification.sender.profilePictureUrl}
                          alt={notification.sender.username}
                          className="size-11 rounded-full object-cover ring-1 ring-border"
                        />
                        <span
                          className={cn(
                            "absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-background",
                            details.bgColor,
                          )}
                        >
                          <details.icon
                            className={cn("size-3", details.iconClassName)}
                          />
                        </span>
                      </div>

                      {/* Text descriptions */}
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <p className="break-words text-sm leading-snug text-foreground">
                          <span className="mr-1 font-semibold hover:underline">
                            {notification.sender.username}
                          </span>
                          {details.message}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Right hand action / unread dots */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.isRead && (
                        <span className="size-2 rounded-full bg-sky-500" />
                      )}
                      <ArrowRight className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                  </div>
                );
              })}
              <LoadMoreTrigger
                hasNextPage={hasMoreNotifications}
                isFetchingNextPage={isFetchingMoreNotifications}
                onLoadMore={loadMoreNotifications}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default NotificationPage;
