import { useGetPostLikeCountQuery } from "@/api/posts/postLikesApi";
import { openPostModal } from "@/slices/viewPostSlice";
import type { GetPostResponseDto } from "@/types/responseTypes";
import { Heart, MessageCircle } from "lucide-react";
import { useDispatch } from "react-redux";

interface ProfilePagePostCardProps {
  post: GetPostResponseDto;
}

function ProfilePagePostCard({ post }: ProfilePagePostCardProps) {
  const { data: postLikeCount } = useGetPostLikeCountQuery(post.id);

  const dispatch = useDispatch();

  function handleOpenModalClick() {
    dispatch(openPostModal(post.id));
  }

  return (
    <div
      key={post.id}
      className="relative group aspect-square bg-gray-200 dark:bg-gray-700 rounded overflow-hidden cursor-pointer"
      onClick={handleOpenModalClick}
    >
      <img
        src={post.imageUrl}
        alt={`Post ${post.description}`}
        className="w-full h-full object-cover"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="flex gap-6 text-white font-semibold">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500 dark:text-red-500 dark:fill-red-500 " />
            <span className="text-lg">{postLikeCount || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-500 fill-blue-500 dark:text-blue-500 dark:fill-blue-500" />
            <span className="text-lg">{post.comments_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePagePostCard;
