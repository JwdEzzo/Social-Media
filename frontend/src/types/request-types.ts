// ================ POST =================
export interface EditPostWithUploadRequestDto {
  description: string;
  // Omit to keep the post's current image
  image?: File;
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
