import {
  useGetFollowingPostsByUserIdInfiniteQuery,
  useGetPostsExcludingCurrentUserInfiniteQuery,
} from "@/api/posts/postApi";
import { useAuth } from "@/auth/useAuth";
import { ModeToggle } from "@/components/ModeToggle";
import { RotateCcw } from "lucide-react";
import ViewPost from "../PostPages/ViewPost";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import AppSidebar from "./AppSidebar";
import { useDispatch, useSelector } from "react-redux";
import {
  openPostModal,
  closePostModal,
  saveHomePageScrollPosition,
} from "@/slices/viewPostSlice";
import type { RootState } from "@/store/store";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import { useTogglePostLikeMutation } from "@/api/posts/postLikesApi";
import { CardTitle } from "@/components/ui/card";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTogglePostSaveMutation } from "@/api/posts/postSavesApi";
import RenderedPosts from "./react-virtuoso/RenderedPosts";
import NotificationDropdown from "@/components/custom/notification-dropdown";
import { usePagedList } from "@/hooks/usePagedList";

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

  // Get logged-in username (string)
  const { username: loggedInUsername } = useAuth();

  // Get logged-in USER object
  const { data: loggedInUser } = useGetUserByUsernameQuery(
    loggedInUsername || "",
  );

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

  const [togglePostLike, { isLoading: isTogglingPostLike }] =
    useTogglePostLikeMutation();

  const [toggleSave, { isLoading: isTogglingSavePost }] =
    useTogglePostSaveMutation();

  // Toggle post like
  // No Post tag invalidation needed: like state/count live in postLikesApi, which the
  // mutation already invalidates. Invalidating 'Post' here would refetch every loaded feed page.
  const handleTogglePostLike = useCallback(
    async (postId: number) => {
      try {
        await togglePostLike(postId).unwrap();
      } catch (error) {
        console.log("Error: ", error);
      }
    },
    [togglePostLike],
  );

  // Toggle post save (same reasoning: postSavesApi owns the saved state)
  const handleToggleSavePost = useCallback(
    async (postId: number) => {
      try {
        await toggleSave(postId).unwrap();
      } catch (error) {
        console.log("Error: ", error);
      }
    },
    [toggleSave],
  );

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Navbar */}
        <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-3 sm:px-4">
            <SidebarTrigger className="size-9 rounded-full" />
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
                handleTogglePostLike={handleTogglePostLike}
                isTogglingPostLike={isTogglingPostLike}
                handleToggleSavePost={handleToggleSavePost}
                isTogglingSavePost={isTogglingSavePost}
                onEndReached={loadMoreForYouPosts}
                isFetchingMore={isFetchingMoreForYouPosts}
              />
            ) : (
              <RenderedPosts
                posts={followingPosts}
                onViewComments={handleViewModal}
                handleTogglePostLike={handleTogglePostLike}
                isTogglingPostLike={isTogglingPostLike}
                handleToggleSavePost={handleToggleSavePost}
                isTogglingSavePost={isTogglingSavePost}
                onEndReached={loadMoreFollowingPosts}
                isFetchingMore={isFetchingMoreFollowingPosts}
              />
            )}
          </div>

          {/* View Post Modal */}
          {/* // In both ProfilePage and HomePage, we have the ViewPost.tsx as a child component.
          // We call the state from Redux store in both components
          // We then pass them as props to the ViewPost component */}
          <ViewPost
            isOpen={isViewModalOpen}
            handleCloseViewModal={handleCloseViewModal}
            selectedPostId={selectedPostId}
            loggedInUser={loggedInUser}
            handleTogglePostLike={handleTogglePostLike}
            isTogglingPostLike={isTogglingPostLike}
            handleToggleSavePost={handleToggleSavePost}
            isTogglingSavePost={isTogglingSavePost}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default HomePage;
