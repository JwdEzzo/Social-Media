import {
  useGetAllNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkOneAsReadMutation,
} from "@/api/notifications/notificationApi";
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

  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
    refetch: refetchNotifications,
  } = useGetAllNotificationsQuery();

  const hasUnread = notifications?.some((n) => !n.isRead) ?? false;

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
          icon: <Bell className="h-3 w-3 text-gray-500" />,
          bgColor: "bg-gray-100 dark:bg-gray-950/50",
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
      <div className="min-h-screen dark:bg-gray-900 bg-gray-50 transition-colors">
        <NavigateBack />
        <main className="flex-1 py-10 bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
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
      <div className="min-h-screen dark:bg-gray-900 bg-gray-50 transition-colors">
        <NavigateBack />
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center justify-between p-4"></div>
        </header>
        <main className="flex-1 py-10 bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 max-w-sm">
              <h2 className="text-xl font-bold text-red-500 mb-2">
                Error Loading Notifications
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
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
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 transition-colors">
      <NavigateBack />
      {/* Main Content */}
      <main className="flex-1 py-10 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header section with count and mark as read */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Notifications
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Stay updated on recent likes, comments, and follows.
              </p>
            </div>
            {hasUnread && (
              <Button
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400 font-semibold cursor-pointer"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark all as read</span>
              </Button>
            )}
          </div>

          {/* List details */}
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center px-4">
              <div className="h-16 w-16 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mb-4 select-none">
                <BellOff className="h-8 w-8 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                All caught up!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px]">
                You have no notifications yet. Interaction activity will be
                displayed here as it happens.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const details = getNotificationDetails(
                  notification.notificationType,
                );
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border flex items-center justify-between gap-4 group",
                      notification.isRead
                        ? "border-gray-200 dark:border-gray-700"
                        : "border-purple-300 dark:border-purple-900 bg-purple-500/[0.03] dark:bg-purple-500/[0.05] border-l-4 border-l-purple-600 dark:border-l-purple-500",
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar container with relative badge placement */}
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={notification.sender.profilePictureUrl}
                            alt={notification.sender.username}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold uppercase">
                            {notification.sender.username.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full p-1 border-2 border-white dark:border-gray-800 shadow-sm",
                            details.bgColor,
                          )}
                        >
                          {details.icon}
                        </span>
                      </div>

                      {/* Text descriptions */}
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <p className="text-sm text-gray-700 dark:text-gray-300 break-words leading-snug">
                          <span className="font-bold text-gray-900 dark:text-white mr-1 hover:underline">
                            {notification.sender.username}
                          </span>
                          {details.message}
                        </p>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Right hand action / unread dots */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.isRead && (
                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse" />
                      )}
                      <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-4px] group-hover:translate-x-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default NotificationPage;
