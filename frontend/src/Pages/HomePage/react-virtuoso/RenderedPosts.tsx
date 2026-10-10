import type { GetPostResponse } from "@/types/response-types";
import { Virtuoso } from "react-virtuoso";
import HomePagePostCard from "../HomePagePostCard";

interface RenderedPostsProps {
  posts: GetPostResponse[];
  onViewComments: (postId: number) => void;
  handleTogglePostLike: (postId: number) => void;
  isTogglingPostLike: boolean;
  handleToggleSavePost: (postId: number) => void;
  isTogglingSavePost: boolean;
  // Infinite scroll: called when the last post is rendered, e.g. to fetch the next page
  onEndReached?: () => void;
  isFetchingMore?: boolean;
}

interface FooterContext {
  isFetchingMore?: boolean;
}

// Defined outside the component so Virtuoso doesn't remount it on every render;
// it reads isFetchingMore through Virtuoso's context prop instead of a closure.
function Footer({ context }: { context?: FooterContext }) {
  if (!context?.isFetchingMore) return null;
  return (
    <div className="flex justify-center py-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  );
}

//  We pass the props of the HomePagePostCard component to the RenderedPosts Component which then passes them to the HomePagePostCard component in the virtuoso component
function RenderedPosts({
  posts,
  onViewComments,
  handleTogglePostLike,
  isTogglingPostLike,
  handleToggleSavePost,
  isTogglingSavePost,
  onEndReached,
  isFetchingMore,
}: RenderedPostsProps) {
  return (
    <div className="!h-full !w-full">
      <Virtuoso<GetPostResponse, FooterContext>
        useWindowScroll
        data={posts}
        endReached={onEndReached}
        context={{ isFetchingMore }}
        components={{ Footer }}
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
