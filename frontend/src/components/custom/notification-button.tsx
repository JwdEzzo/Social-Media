import React from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { useGetUnreadNotificationCountQuery } from "@/api/notifications/notificationApi";

const NotificationButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>((props, ref) => {
  const { data: unreadNotificationCount } =
    useGetUnreadNotificationCountQuery();

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className="relative rounded-full border-transparent bg-transparent shadow-none dark:border-transparent dark:bg-transparent"
      {...props}
    >
      <Bell className="h-5 w-5" />
      {unreadNotificationCount !== undefined && unreadNotificationCount > 0 && (
        <>
          <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] animate-ping rounded-full bg-red-400/50" />
          <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
          </span>
        </>
      )}
    </Button>
  );
});

NotificationButton.displayName = "NotificationButton";

export default NotificationButton;
