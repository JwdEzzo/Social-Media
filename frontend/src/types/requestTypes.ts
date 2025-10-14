export interface CreatePostRequestDto {
  description: string;
  imageUrl: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignUpRequestDto {
  email: string;
  username: string;
  password: string;
}

export interface UpdateCredentialsRequestDto {
  email: string;
  username: string;
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequestDto {
  bioText: string;
  profilePictureUrl: string;
}

export interface WriteCommentRequestDto {
  content: string;
  postId: number;
}
