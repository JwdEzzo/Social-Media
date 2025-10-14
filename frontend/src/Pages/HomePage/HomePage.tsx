import { useGetPostsExcludingCurrentUserQuery } from "@/api/posts/postApi";
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
import { openPostModal, closePostModal } from "@/slices/viewPostSlice";
import type { RootState } from "@/store/store";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import PostCard from "../PostPages/HomePagePostCard";
import {
  useGetPostLikeCountQuery,
  useIsPostLikedQuery,
  useTogglePostLikeMutation,
} from "@/api/posts/postLikesApi";

function HomePage() {
  const dispatch = useDispatch();

  const { isOpen: isViewModalOpen, selectedPostId } = useSelector(
    (state: RootState) => state.viewPostModal
  );

  // Get logged-in username (string)
  const { username: loggedInUsername } = useAuth();

  // Get logged-in USER object
  const { data: loggedInUser } = useGetUserByUsernameQuery(
    loggedInUsername || ""
  );

  const {
    data: apiPosts,
    isLoading: isPostsLoading,
    isError: isPostsError,
    refetch: refetchPosts,
  } = useGetPostsExcludingCurrentUserQuery();

  const [togglePostLike, { isLoading: isTogglingPostLike }] =
    useTogglePostLikeMutation();

  async function handleToggleLike(postId: number) {
    try {
      await togglePostLike(postId).unwrap();
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  // Open modal for selected post
  function handleViewModal(postId: number) {
    dispatch(openPostModal(postId));
  }

  // Close modal
  function handleCloseViewModal() {
    dispatch(closePostModal());
  }

  // Loading state
  if (isPostsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isPostsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">
            Error Loading Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Failed to load posts
          </p>
          <Button onClick={refetchPosts}>
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
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
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8" />
              <h1 className="text-4xl tracking-tight font-[GreatVibes] bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Social Media
              </h1>
            </div>
            <ModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-10 bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col items-center">
          <div className="flex flex-col items-center justify-center max-w-2xl w-full px-4 space-y-4">
            {/* Map over posts - now using PostCard component */}
            {apiPosts?.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onViewComments={handleViewModal}
                handleToggleLike={handleToggleLike}
                isTogglingPostLike={isTogglingPostLike}
              />
            ))}
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
            handleToggleLike={handleToggleLike}
            isTogglingPostLike={isTogglingPostLike}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default HomePage;
