import type { AccountStatus, NotificationType } from "@/types/enums";

// ================ LOGIN =================
export interface LoginResponse {
  token: string;
  username: string;
}

// =============== USER =================
export interface GetUserResponse {
  id: number;
  email: string;
  username: string;
  bioText: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
  accountStatus: AccountStatus;
  posts: GetPostResponse[];
}

export interface SearchUserResponse {
  id: number;
  username: string;
  bioText: string;
  profilePictureUrl: string | null;
}

export interface SignUpResponse {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

// ================ POST =================
export interface GetPostResponse {
  id: number;
  username: string;
  profilePictureUrl: string | null;
  imageUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  comments: GetCommentResponse[];
}

// ================ COMMENTS =================
export interface GetCommentResponse {
  id: number;
  content: string;
  createdAt: string;
  appUser: GetUserResponse;
}

// ================ REPLIES =================
export interface GetReplyResponse {
  id: number;
  content: string;
  createdAt: string;
  appUser: GetUserResponse;
}

// ================ FOLLOW =================
export interface FollowRequestResponse {
  requestId: number;
  requesterUsername: string;
  requesterProfilePictureUrl: string | null;
  targetUsername: string;
  targetProfilePictureUrl: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
}

// ================ SEARCH =================
export interface GetSearchResponse {
  id: number;
  searchTerm: string;
  createdAt: string;
}

// ================ NOTIFICATIONS =================
export interface NotificationResponse {
  id: number;
  sender: GetUserResponse;
  notificationType: NotificationType;
  entityId: number;
  isRead: boolean;
  createdAt: string;
}
