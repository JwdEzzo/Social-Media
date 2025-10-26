export interface LoginResponse {
  token: string;
  username: string;
  message: string;
}

export interface GetUserResponseDto {
  id: number;
  email: string;
  username: string;
  bioText: string;
  profilePictureUrl: string;
  createdAt: string;
  updatedAt: string;
  posts: GetPostResponseDto[];
}

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

export interface GetCommentResponseDto {
  id: number;
  content: string;
  createdAt: string;
  appUser: GetUserResponseDto;
}

export interface GetReplyResponseDto {
  id: number;
  content: string;
  createdAt: string;
  appUser: GetUserResponseDto;
}
