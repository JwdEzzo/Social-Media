import { useMarkOneAsReadMutation } from "@/api/notifications/notificationApi";
import { useNavigateToProfile } from "@/hooks/useNavigateToProfile";
import type { NotificationResponse } from "@/types/response-types";

/**
 * Returns the click handler for a notification, shared by the Notifications page and
 * the bell dropdown: marks it read (if it isn't already), then opens the sender's profile.
 */
export function useOpenNotification() {
  const navigateToProfile = useNavigateToProfile();
  const [markOneAsRead] = useMarkOneAsReadMutation();

  return async function openNotification(
    notification: NotificationResponse,
  ): Promise<void> {
    if (!notification.isRead) {
      try {
        await markOneAsRead(notification.id).unwrap();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    navigateToProfile(notification.sender.username);
  };
}
