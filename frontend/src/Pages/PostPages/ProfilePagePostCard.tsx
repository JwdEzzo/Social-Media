import { useGetPostCommentCountQuery } from "@/api/comments/commentApi";
import { useGetPostLikeCountQuery } from "@/api/posts/postLikesApi";
import { openPostModal } from "@/slices/viewPostSlice";
import type { GetPostResponse } from "@/types/response-types";
import { Heart, MessageCircle } from "lucide-react";
import { useDispatch } from "react-redux";

interface ProfilePagePostCardProps {
  post: GetPostResponse;
}

function ProfilePagePostCard({ post }: ProfilePagePostCardProps) {
  const { data: postLikeCount } = useGetPostLikeCountQuery(post.id);
  const { data: postCommentCount } = useGetPostCommentCountQuery(post.id);
  const dispatch = useDispatch();

  // ViewPostModal locks page scrolling itself while open
  function handleOpenModalClick() {
    dispatch(openPostModal(post.id));
  }

  return (
    <div
      key={post.id}
      className="group relative aspect-square cursor-pointer overflow-hidden bg-muted"
      onClick={handleOpenModalClick}
    >
      <img
        src={post.imageUrl}
        alt={`Post ${post.description}`}
        className="size-full object-cover"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex gap-6 font-bold text-white">
          <div className="flex items-center gap-1.5">
            <Heart className="size-5 fill-white text-white" />
            <span className="text-base">{postLikeCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="size-5 -scale-x-100 fill-white text-white" />
            <span className="text-base">{postCommentCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePagePostCard;
