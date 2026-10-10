import {
  useGetLatest3NotificationsQuery,
  useMarkAllAsReadMutation,
} from "@/api/notifications/notificationApi";
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
import { cn } from "@/utils/errors";
import { Button } from "../ui/button";
import { formatTimeAgo } from "@/utils/helpers";

function NotificationDropdown() {
  const { data: latest3Notifications, isLoading } =
    useGetLatest3NotificationsQuery();
  const navigate = useNavigate();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const getNotificationDetails = (type: NotificationType) => {
    switch (type) {
      case NotificationType.POST_LIKE:
        return {
          message: "liked your post",
          icon: <Heart className="size-2.5 fill-current text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-950/50",
        };
      case NotificationType.COMMENT_LIKE:
        return {
          message: "liked your comment",
          icon: <Heart className="size-2.5 fill-current text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-950/50",
        };
      case NotificationType.REPLY_LIKE:
        return {
          message: "liked your reply",
          icon: <Heart className="size-2.5 fill-current text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-950/50",
        };
      case NotificationType.COMMENT:
        return {
          message: "commented on your post",
          icon: (
            <MessageCircle className="size-2.5 fill-current text-blue-500" />
          ),
          bgColor: "bg-blue-100 dark:bg-blue-950/50",
        };
      case NotificationType.REPLY:
        return {
          message: "replied to your comment",
          icon: (
            <MessageCircle className="size-2.5 fill-current text-purple-500" />
          ),
          bgColor: "bg-purple-100 dark:bg-purple-950/50",
        };
      case NotificationType.FOLLOW:
        return {
          message: "started following you",
          icon: (
            <UserPlus className="size-2.5 text-green-600 dark:text-green-400" />
          ),
          bgColor: "bg-green-100 dark:bg-green-950/50",
        };
      case NotificationType.FOLLOW_REQUEST_SENT:
        return {
          message: "sent you a follow request",
          icon: (
            <UserPlus className="size-2.5 text-yellow-600 dark:text-yellow-400" />
          ),
          bgColor: "bg-yellow-100 dark:bg-yellow-950/50",
        };
      case NotificationType.FOLLOW_REQUEST_ACCEPTED:
        return {
          message: "accepted your follow request",
          icon: (
            <UserPlus className="size-2.5 text-indigo-600 dark:text-indigo-400" />
          ),
          bgColor: "bg-indigo-100 dark:bg-indigo-950/50",
        };
      default:
        return {
          message: "interacted with you",
          icon: <BellOff className="size-2.5 text-muted-foreground" />,
          bgColor: "bg-muted",
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
        className="w-[min(92vw,360px)] rounded-xl p-2 shadow-lg"
      >
        <DropdownMenuLabel className="flex items-center justify-between gap-3 px-2 pt-1.5 pb-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold text-foreground">
              Notifications
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              Recent activity on your account
            </span>
          </div>
          <Button
            onClick={() => markAllAsRead()}
            variant="ghost"
            size="sm"
            className="h-7 cursor-pointer px-2 text-xs font-semibold text-sky-500 hover:bg-accent hover:text-sky-600 dark:hover:text-sky-400"
          >
            Mark all as read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="-mx-2 my-1" />

        {isLoading ? (
          <div className="flex flex-col gap-3 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !latest3Notifications || latest3Notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-border">
              <BellOff className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              All caught up!
            </p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              No new notifications have arrived yet.
            </p>
          </div>
        ) : (
          <div className="flex max-h-[300px] flex-col gap-0.5 overflow-y-auto">
            {latest3Notifications.slice(0, 3).map((notification) => {
              const details = getNotificationDetails(
                notification.notificationType,
              );
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors focus:bg-accent",
                    !notification.isRead && "bg-sky-500/5 dark:bg-sky-500/10",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-9 ring-1 ring-border">
                      <AvatarImage
                        src={notification.sender.profilePictureUrl}
                        alt={notification.sender.username}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-muted text-xs font-semibold uppercase text-muted-foreground">
                        {notification.sender.username.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -right-1 -bottom-1 flex size-[18px] items-center justify-center rounded-full border-2 border-popover",
                        details.bgColor,
                      )}
                    >
                      {details.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <p className="break-words text-[13px] leading-snug text-foreground">
                      <span className="mr-1 font-semibold">
                        {notification.sender.username}
                      </span>
                      {details.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <span className="ml-auto size-2 shrink-0 rounded-full bg-sky-500" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator className="-mx-2 my-1" />
        <div className="p-1">
          <button
            onClick={() => navigate("/notifications")}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span>View All Notifications</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationDropdown;
