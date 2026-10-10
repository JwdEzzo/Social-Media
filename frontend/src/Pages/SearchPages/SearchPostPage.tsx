import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { ModeToggle } from "@/components/ModeToggle";
import { RotateCcw } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { openPostModal, closePostModal } from "@/slices/viewPostSlice";
import type { RootState } from "@/store/store";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import { useTogglePostLikeMutation } from "@/api/posts/postLikesApi";
import { useTogglePostSaveMutation } from "@/api/posts/postSavesApi";
import ViewPost from "@/Pages/PostPages/ViewPost";
import {
  postApi,
  useGetPostsByDescriptionInfiniteQuery,
} from "@/api/posts/postApi";
import { usePagedList } from "@/hooks/usePagedList";
import AppSidebar from "@/Pages/HomePage/AppSidebar";
import RenderedPosts from "../HomePage/react-virtuoso/RenderedPosts";

function SearchPostPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const dispatch = useDispatch();

  const { isOpen: isViewModalOpen, selectedPostId } = useSelector(
    (state: RootState) => state.viewPostModal,
  );

  const { username: loggedInUsername } = useAuth();

  const { data: loggedInUser } = useGetUserByUsernameQuery(
    loggedInUsername || "",
  );

  // This will now only run when searchQuery is provided
  const searchedPostsQuery = useGetPostsByDescriptionInfiniteQuery(
    searchQuery,
    {
      skip: !searchQuery, // Don't run the query if searchQuery is empty
    },
  );
  const {
    isLoading: isSearchedPostsLoading,
    isError: isSearchedPostsError,
    refetch: refetchSearchedPosts,
  } = searchedPostsQuery;

  // totalMatches is the server-side count, not just the pages loaded so far
  const {
    items: searchedPosts,
    loadMore: loadMoreSearchedPosts,
    isFetchingNextPage: isFetchingMoreSearchedPosts,
    totalElements: totalMatches,
  } = usePagedList(searchedPostsQuery);

  const [togglePostLike, { isLoading: isTogglingPostLike }] =
    useTogglePostLikeMutation();

  const [toggleSave, { isLoading: isTogglingSavePost }] =
    useTogglePostSaveMutation();

  async function handleTogglePostLike(postId: number) {
    try {
      await togglePostLike(postId)
        .unwrap()
        .then(() => {
          dispatch(postApi.util.invalidateTags([{ type: "Post", id: "LIST" }]));
        });
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async function handleToggleSavePost(postId: number) {
    try {
      await toggleSave(postId)
        .unwrap()
        .then(() => {
          dispatch(postApi.util.invalidateTags([{ type: "Post", id: "LIST" }]));
        });
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  function handleViewModal(postId: number) {
    dispatch(openPostModal(postId));
  }

  function handleCloseViewModal() {
    dispatch(closePostModal());
  }

  // Loading state
  if (isSearchedPostsLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-svh items-center justify-center bg-background px-4">
            <div className="text-center">
              <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                Searching for "{searchQuery}"...
              </p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Error state
  if (isSearchedPostsError) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-svh items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
              <h2 className="mb-2 text-lg font-semibold text-destructive">
                Error Loading Search Results
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Failed to search for "{searchQuery}"
              </p>
              <Button onClick={() => refetchSearchedPosts()}>
                <RotateCcw className="size-4" /> Try Again
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
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
            <ModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col items-center bg-background py-0 sm:py-8">
          <div className="flex w-full max-w-[470px] flex-col items-center justify-center">
            {/* Search Header */}
            <div className="w-full px-4 pt-6 pb-4 sm:px-0 sm:pt-0">
              <h2 className="mb-1 text-xl font-semibold text-foreground">
                Search Results
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing results for:{" "}
                <span className="font-semibold text-foreground">
                  "{searchQuery}"
                </span>
              </p>
              {searchedPosts.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {totalMatches} {totalMatches === 1 ? "post" : "posts"} found
                </p>
              )}
            </div>

            {/* Search Results */}
            {searchedPosts.length > 0 ? (
              <RenderedPosts
                posts={searchedPosts}
                onViewComments={handleViewModal}
                handleTogglePostLike={handleTogglePostLike}
                isTogglingPostLike={isTogglingPostLike}
                handleToggleSavePost={handleToggleSavePost}
                isTogglingSavePost={isTogglingSavePost}
                onEndReached={loadMoreSearchedPosts}
                isFetchingMore={isFetchingMoreSearchedPosts}
              />
            ) : (
              <div className="w-full py-16 text-center">
                <p className="text-base font-semibold text-foreground">
                  No posts found matching "{searchQuery}"
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>

          {/* View Post Modal */}
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

export default SearchPostPage;
