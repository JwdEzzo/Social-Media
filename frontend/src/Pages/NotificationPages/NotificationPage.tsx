import {
  useGetAllNotificationsInfiniteQuery,
  useMarkAllAsReadMutation,
  useMarkOneAsReadMutation,
} from "@/api/notifications/notificationApi";
import { usePagedList } from "@/hooks/usePagedList";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MessageCircle,
  UserPlus,
  BellOff,
  CheckCheck,
  RotateCcw,
  Bell,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { cn } from "@/utils/errors";
import { NotificationType } from "@/types/enums";
import type { NotificationResponseDto } from "@/types/response-types";
import NavigateBack from "@/components/custom/navigate-back";

function NotificationPage() {
  const { username: loggedInUsername } = useAuth();
  const navigate = useNavigate();

  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllAsReadMutation();
  const [markOneAsRead] = useMarkOneAsReadMutation();

  const notificationsQuery = useGetAllNotificationsInfiniteQuery();
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

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (isNaN(diffMs)) return "";
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  const getNotificationDetails = (type: NotificationType) => {
    switch (type) {
      case NotificationType.POST_LIKE:
        return {
          message: "liked your post",
          icon: <Heart className="h-3 w-3 fill-current text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-950/50",
        };
      case NotificationType.COMMENT_LIKE:
        return {
          message: "liked your comment",
          icon: <Heart className="h-3 w-3 fill-current text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-950/50",
        };
      case NotificationType.REPLY_LIKE:
        return {
          message: "liked your reply",
          icon: <Heart className="h-3 w-3 fill-current text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-950/50",
        };
      case NotificationType.COMMENT:
        return {
          message: "commented on your post",
          icon: (
            <MessageCircle className="h-3 w-3 fill-current text-blue-500" />
          ),
          bgColor: "bg-blue-100 dark:bg-blue-950/50",
        };
      case NotificationType.REPLY:
        return {
          message: "replied to your comment",
          icon: (
            <MessageCircle className="h-3 w-3 fill-current text-purple-500" />
          ),
          bgColor: "bg-purple-100 dark:bg-purple-950/50",
        };
      case NotificationType.FOLLOW:
        return {
          message: "started following you",
          icon: (
            <UserPlus className="h-3 w-3 text-green-600 dark:text-green-400" />
          ),
          bgColor: "bg-green-100 dark:bg-green-950/50",
        };
      case NotificationType.FOLLOW_REQUEST_SENT:
        return {
          message: "sent you a follow request",
          icon: (
            <UserPlus className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
          ),
          bgColor: "bg-yellow-100 dark:bg-yellow-950/50",
        };
      case NotificationType.FOLLOW_REQUEST_ACCEPTED:
        return {
          message: "accepted your follow request",
          icon: (
            <UserPlus className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          ),
          bgColor: "bg-indigo-100 dark:bg-indigo-950/50",
        };
      default:
        return {
          message: "interacted with you",
          icon: <Bell className="h-3 w-3 text-muted-foreground" />,
          bgColor: "bg-muted",
        };
    }
  };

  const handleNotificationClick = async (
    notification: NotificationResponseDto,
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
    const senderUsername = notification.sender.username;
    if (senderUsername === loggedInUsername) {
      navigate(`/userprofile/${senderUsername}`);
    } else {
      navigate(`/searcheduserprofile/${senderUsername}`);
    }
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
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
              <h2 className="mb-2 text-lg font-semibold text-destructive">
                Error Loading Notifications
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                We couldn't retrieve your notifications. Please check your
                network connection and try again.
              </p>
              <Button
                onClick={refetchNotifications}
                className="w-full flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Try Again
              </Button>
            </div>
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
                        <Avatar className="size-11 ring-1 ring-border">
                          <AvatarImage
                            src={notification.sender.profilePictureUrl}
                            alt={notification.sender.username}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-muted font-semibold uppercase text-muted-foreground">
                            {notification.sender.username.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-background",
                            details.bgColor,
                          )}
                        >
                          {details.icon}
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
