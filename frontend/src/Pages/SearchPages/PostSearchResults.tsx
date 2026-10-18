import { useGetPostsExcludingCurrentUserInfiniteQuery } from "@/api/posts/postApi";
import { useGetPostsByDescriptionInfiniteQuery } from "@/api/search/searchApi";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import LoadingPostTiles from "@/components/custom/loading-post-tiles";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePagedList } from "@/hooks/usePagedList";
import ProfilePagePostCard from "@/Pages/PostPages/ProfilePagePostCard";
import ViewPostModal from "@/Pages/PostPages/ViewPostModal";
import { closePostModal } from "@/slices/viewPostSlice";
import type { RootState } from "@/store/store";
import { RotateCcw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

interface PostSearchResultsProps {
  query: string;
}

// Posts tab of the search page: explore posts while the query is empty, otherwise
// the posts whose description matches. Clicking a tile opens the ViewPostModal.
function PostSearchResults({ query }: PostSearchResultsProps) {
  const dispatch = useDispatch();
  const { loggedInUser } = useCurrentUser();

  const { isOpen: isViewModalOpen, selectedPostId } = useSelector(
    (state: RootState) => state.viewPostModal,
  );

  // Explore posts, shown while the search box is empty
  const explorePostsQuery = useGetPostsExcludingCurrentUserInfiniteQuery(
    undefined,
    { skip: !!query },
  );
  const explorePosts = usePagedList(explorePostsQuery);

  // Search results, shown once there's a query
  const searchedPostsQuery = useGetPostsByDescriptionInfiniteQuery(query, {
    skip: !query,
  });
  const searchedPosts = usePagedList(searchedPostsQuery);

  const isSearching = !!query;
  const activeQuery = isSearching ? searchedPostsQuery : explorePostsQuery;
  const activeList = isSearching ? searchedPosts : explorePosts;

  function handleCloseViewModal() {
    dispatch(closePostModal());
  }

  // Loading State: placeholder tiles while the first page loads
  if (activeList.isLoadingFirstPage) {
    return (
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
        <LoadingPostTiles />
      </div>
    );
  }

  // Error State: message with a retry button
  if (activeQuery.isError) {
    return (
      <div className="py-16 text-center">
        <p className="text-base font-semibold text-foreground">
          {isSearching ? "Couldn't load search results" : "Couldn't load posts"}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => activeQuery.refetch()}
        >
          <RotateCcw className="size-4" /> Try Again
        </Button>
      </div>
    );
  }

  // Empty State: the search matched nothing
  if (isSearching && activeList.items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No posts found for "{query}"
      </p>
    );
  }

  // Loaded State: posts grid plus infinite-scroll trigger
  return (
    <>
      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
        {activeList.items.map((post) => (
          <ProfilePagePostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More Trigger: fetches the next page when scrolled into view */}
      <LoadMoreTrigger
        hasNextPage={activeList.hasNextPage}
        isFetchingNextPage={activeList.isFetchingNextPage}
        onLoadMore={activeList.loadMore}
      />

      {/* View Post Modal: opens when a post tile is clicked */}
      <ViewPostModal
        isOpen={isViewModalOpen}
        handleCloseViewModal={handleCloseViewModal}
        selectedPostId={selectedPostId}
        loggedInUser={loggedInUser}
      />
    </>
  );
}

export default PostSearchResults;
