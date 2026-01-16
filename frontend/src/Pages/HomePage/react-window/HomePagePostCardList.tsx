import { List } from "react-window";
import RowComponent from "./RowComponent";
import type { GetPostResponseDto } from "@/types/responseTypes";

interface HomePagePostCardListProps {
  posts: GetPostResponseDto[];
  onViewComments: (postId: number) => void;
  handleTogglePostLike: (postId: number) => void;
  isTogglingPostLike: boolean;
  handleToggleSavePost: (postId: number) => void;
  isTogglingSavePost: boolean;
}

function HomePagePostCardList({
  posts,
  onViewComments,
  handleTogglePostLike,
  isTogglingPostLike,
  handleToggleSavePost,
  isTogglingSavePost,
}: HomePagePostCardListProps) {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {" "}
      {/* Container with height */}
      <List
        rowComponent={RowComponent}
        rowCount={posts.length}
        rowHeight={300} // Adjust based on your card height
        rowProps={{
          posts,
          onViewComments,
          handleTogglePostLike,
          isTogglingPostLike,
          handleToggleSavePost,
          isTogglingSavePost,
        }}
      />
    </div>
  );
}

export default HomePagePostCardList;
