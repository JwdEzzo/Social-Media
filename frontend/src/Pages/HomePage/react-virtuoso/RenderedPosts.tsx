import type { GetPostResponseDto } from "@/types/responseTypes";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";
import HomePagePostCard from "../HomePagePostCard";

interface HomePagePostCardProps {
  post: GetPostResponseDto;
  onViewComments: (postId: number) => void;
  handleTogglePostLike: (postId: number) => void;
  isTogglingPostLike: boolean;
  handleToggleSavePost: (postId: number) => void;
  isTogglingSavePost: boolean;
}

function RenderedPosts() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [homePagePostCards, _setHomePagePostCards] = useState<
    HomePagePostCardProps[]
  >([]);

  return (
    <div>
      <Virtuoso
        data={homePagePostCards}
        itemContent={(index) => (
          <HomePagePostCard
            post={homePagePostCards[index].post}
            onViewComments={homePagePostCards[index].onViewComments}
            handleTogglePostLike={homePagePostCards[index].handleTogglePostLike}
            isTogglingPostLike={homePagePostCards[index].isTogglingPostLike}
            handleToggleSavePost={homePagePostCards[index].handleToggleSavePost}
            isTogglingSavePost={homePagePostCards[index].isTogglingSavePost}
          />
        )}
      />
    </div>
  );
}

export default RenderedPosts;
