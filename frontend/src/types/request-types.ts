// ================ POST =================
export interface CreatePostRequestDto {
  description: string;
  imageUrl: string;
}

export interface EditPostWithUrlRequestDto {
  description: string;
  imageUrl: string;
}

export interface EditPostWithUploadRequestDto {
  description: string;
  image: File;
}

// ================ SIGN UP =================
export interface SignUpRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// =============== UPDATE USER =================
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

// =============== COMMENTS =================
export interface WriteCommentRequestDto {
  content: string;
  postId: number;
}

// =============== REPLIES =================
export interface WriteReplyRequestDto {
  content: string;
  commentId: number;
}
