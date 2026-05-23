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
      className="relative transition-all duration-300 hover:scale-105"
      {...props}
    >
      <Bell className="h-5 w-5" />
      {unreadNotificationCount !== undefined && unreadNotificationCount > 0 && (
        <>
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] animate-ping rounded-full bg-red-400/60" />
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-tr from-red-500 to-pink-600 px-1 text-[9px] font-black text-white shadow-md ring-2 ring-white dark:ring-gray-900 transition-transform duration-300">
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
          </span>
        </>
      )}
    </Button>
  );
});

NotificationButton.displayName = "NotificationButton";

export default NotificationButton;
