import { useGetLatest3NotificationsQuery } from "@/api/notifications/notificationApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import NotificationButton from "./notification-button";
import { NotificationType } from "@/types/enums";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import {
  Heart,
  MessageCircle,
  UserPlus,
  BellOff,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

function NotificationDropdown() {
  const { data: latest3Notifications, isLoading } =
    useGetLatest3NotificationsQuery();
  const navigate = useNavigate();

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
    } catch (e) {
      console.log("Error formatting date: ", e);
    }
  };

  const getNotificationDetails = (type: NotificationType) => {
    switch (type) {
      case NotificationType.POST_LIKE:
        return {
          message: "liked your post",
          icon: <Heart className="h-2 w-2 fill-current text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-950/50",
        };
      case NotificationType.COMMENT_LIKE:
        return {
          message: "liked your comment",
          icon: <Heart className="h-2 w-2 fill-current text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-950/50",
        };
      case NotificationType.REPLY_LIKE:
        return {
          message: "liked your reply",
          icon: <Heart className="h-2 w-2 fill-current text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-950/50",
        };
      case NotificationType.COMMENT:
        return {
          message: "commented on your post",
          icon: (
            <MessageCircle className="h-2 w-2 fill-current text-blue-500" />
          ),
          bgColor: "bg-blue-100 dark:bg-blue-950/50",
        };
      case NotificationType.REPLY:
        return {
          message: "replied to your comment",
          icon: (
            <MessageCircle className="h-2 w-2 fill-current text-purple-500" />
          ),
          bgColor: "bg-purple-100 dark:bg-purple-950/50",
        };
      case NotificationType.FOLLOW:
        return {
          message: "started following you",
          icon: (
            <UserPlus className="h-2 w-2 text-green-600 dark:text-green-400" />
          ),
          bgColor: "bg-green-100 dark:bg-green-950/50",
        };
      case NotificationType.FOLLOW_REQUEST_SENT:
        return {
          message: "sent you a follow request",
          icon: (
            <UserPlus className="h-2 w-2 text-yellow-600 dark:text-yellow-400" />
          ),
          bgColor: "bg-yellow-100 dark:bg-yellow-950/50",
        };
      case NotificationType.FOLLOW_REQUEST_ACCEPTED:
        return {
          message: "accepted your follow request",
          icon: (
            <UserPlus className="h-2 w-2 text-indigo-600 dark:text-indigo-400" />
          ),
          bgColor: "bg-indigo-100 dark:bg-indigo-950/50",
        };
      default:
        return {
          message: "interacted with you",
          icon: <BellOff className="h-2 w-2 text-gray-500" />,
          bgColor: "bg-gray-100 dark:bg-gray-950/50",
        };
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NotificationButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[320px] md:w-[380px] p-2 dark:bg-gray-950 dark:border-gray-800 shadow-2xl rounded-xl transition-all duration-200"
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Notifications
          </span>
          <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">
            Recent activity on your account
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !latest3Notifications || latest3Notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-3">
              <BellOff className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              All caught up!
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">
              No new notifications have arrived yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
            {latest3Notifications.slice(0, 3).map((notification) => {
              const details = getNotificationDetails(
                notification.notificationType,
              );
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-lg transition-all duration-200 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-900",
                    !notification.isRead &&
                      "bg-purple-500/5 dark:bg-purple-500/10",
                  )}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={notification.sender.profilePictureUrl}
                        alt={notification.sender.username}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold text-xs uppercase">
                        {notification.sender.username.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full p-[3px] border border-white dark:border-gray-950",
                        details.bgColor,
                      )}
                    >
                      {details.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <p className="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 break-words">
                      <span className="font-bold text-gray-900 dark:text-white mr-1">
                        {notification.sender.username}
                      </span>
                      {details.message}
                    </p>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse mt-3 ml-auto" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />
        <div className="p-1">
          <button
            onClick={() => navigate("/notifications")}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>View All Notifications</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationDropdown;
