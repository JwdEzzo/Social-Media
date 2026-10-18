import {
  useGetFollowingPostsByUserIdInfiniteQuery,
  useGetPostsExcludingCurrentUserInfiniteQuery,
} from "@/api/posts/postApi";
import { RotateCcw } from "lucide-react";
import ViewPostModal from "@/Pages/PostPages/ViewPostModal";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  openPostModal,
  closePostModal,
  saveHomePageScrollPosition,
} from "@/slices/viewPostSlice";
import type { RootState } from "@/store/store";
import { CardTitle } from "@/components/ui/card";
import { useCallback, useEffect, useRef, useState } from "react";
import RenderedPosts from "./react-virtuoso/RenderedPosts";
import NotificationDropdown from "@/components/custom/notification-dropdown";
import { usePagedList } from "@/hooks/usePagedList";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ModeToggle } from "@/components/theme/ModeToggle";

function HomePage() {
  //
  const [viewMode, setViewMode] = useState<"For You" | "Following">("For You");
  const dispatch = useDispatch();
  const mainRef = useRef<HTMLDivElement>(null);

  const {
    isOpen: isViewModalOpen,
    selectedPostId,
    homePageScrollPosition,
  } = useSelector((state: RootState) => state.viewPostModal);

  const { loggedInUser } = useCurrentUser();

  // Infinite queries: data.pages holds one PagedModel per page fetched so far
  const forYouQuery = useGetPostsExcludingCurrentUserInfiniteQuery();
  const {
    isLoading: isPostsLoading,
    isError: isPostsError,
    refetch: refetchPosts,
  } = forYouQuery;

  const followingQuery = useGetFollowingPostsByUserIdInfiniteQuery();
  const { isLoading: isFollowingPostsLoading, isError: isFollowingPostsError } =
    followingQuery;

  // Flattened posts for Virtuoso, plus loadMore for its endReached
  const {
    items: apiPosts,
    loadMore: loadMoreForYouPosts,
    isFetchingNextPage: isFetchingMoreForYouPosts,
  } = usePagedList(forYouQuery);

  const {
    items: followingPosts,
    loadMore: loadMoreFollowingPosts,
    isFetchingNextPage: isFetchingMoreFollowingPosts,
  } = usePagedList(followingQuery);

  // Open modal for selected post
  const handleViewModal = useCallback(
    (postId: number) => {
      if (mainRef.current) {
        dispatch(saveHomePageScrollPosition(window.scrollY));
      }
      dispatch(openPostModal(postId));
    },
    [dispatch],
  );

  // Close modal
  const handleCloseViewModal = useCallback(() => {
    dispatch(closePostModal({ preserveState: false }));
  }, [dispatch]);

  // Restore HomePage scroll when returning from profile
  useEffect(() => {
    if (selectedPostId && isViewModalOpen && homePageScrollPosition > 0) {
      // Small delay to ensure modal has rendered
      const timer = setTimeout(() => {
        window.scrollTo({ top: homePageScrollPosition, behavior: "instant" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedPostId, isViewModalOpen, homePageScrollPosition]);

  // Re-open modal if returning from profile page
  useEffect(() => {
    if (selectedPostId && !isViewModalOpen) {
      const timer = setTimeout(() => {
        dispatch(openPostModal(selectedPostId));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedPostId, isViewModalOpen, dispatch]);

  useEffect(() => {
    if (isViewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to ensure scrolling is restored
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isViewModalOpen]);

  // Loading state
  if (isPostsLoading || isFollowingPostsLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isPostsError || isFollowingPostsError) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold text-destructive">
            Error Loading Posts
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Failed to load posts
          </p>
          <Button onClick={refetchPosts}>
            <RotateCcw className="size-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-3 sm:px-4">
          {/* Spacer keeps the title where the old sidebar trigger left it */}
          <div className="size-9" />
          <h1 className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text px-1 pb-1 font-['Great_Vibes'] text-4xl leading-tight text-transparent">
            Social Media
          </h1>
          <div className="flex items-center gap-1">
            <NotificationDropdown />
            <ModeToggle />
          </div>
        </div>
        {/* FYP Or Following */}
        <div className="mx-auto flex max-w-[470px] cursor-pointer items-stretch justify-center text-center">
          <div
            className={`flex-1 border-b-2 py-3 transition-colors ${
              viewMode === "For You"
                ? "border-b-foreground text-foreground"
                : "border-b-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setViewMode("For You")}
          >
            <div className="flex justify-center">
              <CardTitle className={`cursor-pointer text-sm font-semibold`}>
                For You
              </CardTitle>
            </div>
          </div>
          <div
            className={`flex-1 border-b-2 py-3 transition-colors ${
              viewMode === "Following"
                ? "border-b-foreground text-foreground"
                : "border-b-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setViewMode("Following")}
          >
            <div className="flex justify-center">
              <CardTitle className={`cursor-pointer text-sm font-semibold`}>
                Following
              </CardTitle>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        ref={mainRef}
        className="flex flex-1 flex-col items-center bg-background py-0 sm:py-8"
      >
        <div className="flex w-full max-w-[470px] flex-col items-center justify-center">
          {/* Map over posts - now using HomePagePostCard component */}
          {viewMode === "For You" ? (
            <RenderedPosts
              posts={apiPosts}
              onViewComments={handleViewModal}
              onEndReached={loadMoreForYouPosts}
              isFetchingMore={isFetchingMoreForYouPosts}
            />
          ) : (
            <RenderedPosts
              posts={followingPosts}
              onViewComments={handleViewModal}
              onEndReached={loadMoreFollowingPosts}
              isFetchingMore={isFetchingMoreFollowingPosts}
            />
          )}
        </div>

        {/* View Post Modal */}
        {/* // In both ProfilePage and HomePage, we have the ViewPostModal.tsx as a child component.
          // We call the state from Redux store in both components
          // We then pass them as props to the ViewPostModal component */}
        <ViewPostModal
          isOpen={isViewModalOpen}
          handleCloseViewModal={handleCloseViewModal}
          selectedPostId={selectedPostId}
          loggedInUser={loggedInUser}
        />
      </main>
    </>
  );
}

export default HomePage;
