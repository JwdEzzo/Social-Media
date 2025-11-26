import { useSearchParams } from "react-router-dom";
import { useGetPostsByDescriptionQuery } from "@/api/posts/postApi";
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
import HomePagePostCard from "@/Pages/HomePage/HomePagePostCard";
import { useTogglePostLikeMutation } from "@/api/posts/postLikesApi";
import { useTogglePostSaveMutation } from "@/api/posts/postSavesApi";
import ViewPost from "@/Pages/PostPages/ViewPost";
import { postApi } from "@/api/posts/postApi";
import AppSidebar from "@/Pages/HomePage/AppSidebar";

function SearchPostPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const dispatch = useDispatch();

  const { isOpen: isViewModalOpen, selectedPostId } = useSelector(
    (state: RootState) => state.viewPostModal
  );

  const { username: loggedInUsername } = useAuth();

  const { data: loggedInUser } = useGetUserByUsernameQuery(
    loggedInUsername || ""
  );

  // This will now only run when searchQuery is provided
  const {
    data: searchedPosts,
    isLoading: isSearchedPostsLoading,
    isError: isSearchedPostsError,
    refetch: refetchSearchedPosts,
  } = useGetPostsByDescriptionQuery(searchQuery, {
    skip: !searchQuery, // Don't run the query if searchQuery is empty
  });

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
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
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
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-red-500 mb-4">
                Error Loading Search Results
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Failed to search for "{searchQuery}"
              </p>
              <Button onClick={() => refetchSearchedPosts()}>
                <RotateCcw className="mr-2 h-4 w-4" /> Try Again
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
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <SidebarTrigger className="h-8 w-8" />
            <h1 className="text-4xl tracking-tight font-[GreatVibes] bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Social Media
            </h1>
            <ModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-10 bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col items-center">
          <div className="flex flex-col items-center justify-center max-w-2xl w-full px-4 space-y-4">
            {/* Search Header */}
            <div className="w-full mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Search Results
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Showing results for:{" "}
                <span className="font-semibold">"{searchQuery}"</span>
              </p>
              {searchedPosts && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {searchedPosts.length}{" "}
                  {searchedPosts.length === 1 ? "post" : "posts"} found
                </p>
              )}
            </div>

            {/* Search Results */}
            {searchedPosts && searchedPosts.length > 0 ? (
              searchedPosts.map((post) => (
                <HomePagePostCard
                  key={post.id}
                  post={post}
                  onViewComments={handleViewModal}
                  handleTogglePostLike={handleTogglePostLike}
                  isTogglingPostLike={isTogglingPostLike}
                  handleToggleSavePost={handleToggleSavePost}
                  isTogglingSavePost={isTogglingSavePost}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No posts found matching "{searchQuery}"
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
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
