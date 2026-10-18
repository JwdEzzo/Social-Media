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
import UserAvatar from "./user-avatar";
import { Skeleton } from "../ui/skeleton";
import { BellOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/errors";
import { Button } from "../ui/button";
import { formatTimeAgo } from "@/utils/helpers";
import { getNotificationDetails } from "@/utils/notification-details";

function NotificationDropdown() {
  const { data: latest3Notifications, isLoading } =
    useGetLatest3NotificationsQuery(undefined, {
      refetchOnFocus: true,
    });
  const navigate = useNavigate();
  const [markAllAsRead] = useMarkAllAsReadMutation();

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
                    <UserAvatar
                      src={notification.sender.profilePictureUrl}
                      alt={notification.sender.username}
                      className="size-9 rounded-full object-cover ring-1 ring-border"
                    />
                    <span
                      className={cn(
                        "absolute -right-1 -bottom-1 flex size-[18px] items-center justify-center rounded-full border-2 border-popover",
                        details.bgColor,
                      )}
                    >
                      <details.icon
                        className={cn("size-2.5", details.iconClassName)}
                      />
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
