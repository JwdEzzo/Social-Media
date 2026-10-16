// ================ POST =================
export interface EditPostWithUploadRequest {
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
export interface UpdateCredentialsRequest {
  email: string;
  username: string;
  oldPassword: string;
  newPassword: string;
}

// =============== COMMENTS =================
export interface WriteCommentRequest {
  content: string;
  postId: number;
}

// =============== REPLIES =================
export interface WriteReplyRequest {
  content: string;
  commentId: number;
}

// =============== SEARCH =================
export interface CreateSearchRequest {
  searchTerm: string;
}
