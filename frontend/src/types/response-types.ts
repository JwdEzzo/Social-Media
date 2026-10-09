import type { AccountStatus, NotificationType } from "@/types/enums";

// ================ LOGIN =================
export interface LoginResponse {
  token: string;
  username: string;
}

// =============== USER =================
export interface GetUserResponseDto {
  id: number;
  email: string;
  username: string;
  bioText: string;
  profilePictureUrl: string;
  createdAt: string;
  updatedAt: string;
  accountStatus: AccountStatus;
  posts: GetPostResponseDto[];
}

export interface SearchUserResponseDto {
  id: number;
  username: string;
  bioText: string;
  profilePictureUrl: string;
}

export interface SignUpResponse {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

// ================ POST =================
export interface GetPostResponseDto {
  id: number;
  username: string;
  profilePictureUrl: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  comments: GetCommentResponseDto[];
}

// ================ COMMENTS =================
export interface GetCommentResponseDto {
  id: number;
  content: string;
  createdAt: string;
  appUser: GetUserResponseDto;
}

// ================ REPLIES =================
export interface GetReplyResponseDto {
  id: number;
  content: string;
  createdAt: string;
  appUser: GetUserResponseDto;
}

// ================ FOLLOW =================
export interface FollowRequestResponseDto {
  requestId: number;
  requesterUsername: string;
  requesterProfilePictureUrl: string | null;
  targetUsername: string;
  targetProfilePictureUrl: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
}

// ================ NOTIFICATIONS =================
export interface NotificationResponseDto {
  id: number;
  sender: GetUserResponseDto;
  notificationType: NotificationType;
  entityId: number;
  isRead: boolean;
  createdAt: string;
}
