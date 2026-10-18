import { NotificationType } from "@/types/enums";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

interface NotificationDetails {
  // Follows the sender's username, e.g. "<username> liked your post"
  message: string;
  // Badge icon on the sender's avatar; callers add the size class
  icon: LucideIcon;
  iconClassName: string;
  // Badge background behind the icon
  bgColor: string;
}

const likeDetails = {
  icon: Heart,
  iconClassName: "fill-current text-red-500",
  bgColor: "bg-red-100 dark:bg-red-950/50",
};

const NOTIFICATION_DETAILS: Record<NotificationType, NotificationDetails> = {
  [NotificationType.POST_LIKE]: { message: "liked your post", ...likeDetails },
  [NotificationType.COMMENT_LIKE]: {
    message: "liked your comment",
    ...likeDetails,
  },
  [NotificationType.REPLY_LIKE]: {
    message: "liked your reply",
    ...likeDetails,
  },
  [NotificationType.COMMENT]: {
    message: "commented on your post",
    icon: MessageCircle,
    iconClassName: "fill-current text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-950/50",
  },
  [NotificationType.REPLY]: {
    message: "replied to your comment",
    icon: MessageCircle,
    iconClassName: "fill-current text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-950/50",
  },
  [NotificationType.FOLLOW]: {
    message: "started following you",
    icon: UserPlus,
    iconClassName: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950/50",
  },
  [NotificationType.FOLLOW_REQUEST_SENT]: {
    message: "sent you a follow request",
    icon: UserPlus,
    iconClassName: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-950/50",
  },
  [NotificationType.FOLLOW_REQUEST_ACCEPTED]: {
    message: "accepted your follow request",
    icon: UserPlus,
    iconClassName: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-950/50",
  },
};

// For a type the frontend doesn't know yet (e.g. one added on the backend)
const FALLBACK_DETAILS: NotificationDetails = {
  message: "interacted with you",
  icon: Bell,
  iconClassName: "text-muted-foreground",
  bgColor: "bg-muted",
};

// Message and badge styling for a notification, shared by the notification page and dropdown.
// Render the badge as <details.icon className={cn("size-3", details.iconClassName)} />.
export function getNotificationDetails(
  type: NotificationType,
): NotificationDetails {
  return NOTIFICATION_DETAILS[type] ?? FALLBACK_DETAILS;
}
