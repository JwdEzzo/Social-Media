import type { GetPostResponseDto } from "@/types/responseTypes";
import { Virtuoso } from "react-virtuoso";
import HomePagePostCard from "../HomePagePostCard";

interface RenderedPostsProps {
  posts: GetPostResponseDto[];
  onViewComments: (postId: number) => void;
  handleTogglePostLike: (postId: number) => void;
  isTogglingPostLike: boolean;
  handleToggleSavePost: (postId: number) => void;
  isTogglingSavePost: boolean;
}

//  We pass the props of the HomePagePostCard component to the RenderedPosts Component which then passes them to the HomePagePostCard component in the virtuoso component
function RenderedPosts({
  posts,
  onViewComments,
  handleTogglePostLike,
  isTogglingPostLike,
  handleToggleSavePost,
  isTogglingSavePost,
}: RenderedPostsProps) {
  return (
    <div className="!h-full !w-full">
      <Virtuoso
        useWindowScroll
        data={posts}
        itemContent={(index) => {
          const post = posts[index];
          return (
            <div className="mb-4">
              {" "}
              {/* Add margin bottom */}
              <HomePagePostCard
                key={post.id}
                post={post}
                onViewComments={onViewComments}
                handleTogglePostLike={handleTogglePostLike}
                isTogglingPostLike={isTogglingPostLike}
                handleToggleSavePost={handleToggleSavePost}
                isTogglingSavePost={isTogglingSavePost}
              />
            </div>
          );
        }}
      />
    </div>
  );
}
export default RenderedPosts;
