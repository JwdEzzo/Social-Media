import {
  postApi,
  useGetFollowingPostsByUserIdQuery,
  useGetPostsExcludingCurrentUserQuery,
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
import { openPostModal, closePostModal } from "@/slices/viewPostSlice";
import type { RootState } from "@/store/store";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import HomePagePostCard from "@/Pages/HomePage/HomePagePostCard";
import { useTogglePostLikeMutation } from "@/api/posts/postLikesApi";
import { CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useTogglePostSaveMutation } from "@/api/posts/postSavesApi";

function HomePage() {
  //
  const [viewMode, setViewMode] = useState<"For You" | "Following">("For You");
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

  const {
    data: followingPosts,
    isLoading: isFollowingPostsLoading,
    isError: isFollowingPostsError,
  } = useGetFollowingPostsByUserIdQuery();

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
      await toggleSave(postId).unwrap();
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode]);

  // Loading state
  if (isPostsLoading || isFollowingPostsLoading) {
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
  if (isPostsError || isFollowingPostsError) {
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
            <SidebarTrigger className="h-8 w-8" />
            <h1 className="text-4xl tracking-tight font-[GreatVibes] bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Social Media
            </h1>
            <ModeToggle />
          </div>
          {/* FYP Or Following */}
          <div className="flex items-center justify-center text-center transition-colors cursor-pointer">
            <div
              className={`bg-white dark:bg-gray-800 border-t-1 justify-end p-2 flex-1 ${
                viewMode === "For You"
                  ? "dark:border-b-2 dark:border-b-gray-500 border-b-2 border-b-black "
                  : "dark:border-b-2 dark:border-b-gray-800 border-b-2 border-b-white"
              }`}
              onClick={() => setViewMode("For You")}
            >
              <div className="flex mx-auto justify-center text-center gap-10 ">
                <CardTitle className={`text-xl cursor-pointer`}>
                  For You
                </CardTitle>
              </div>
            </div>
            <div
              className={`bg-white dark:bg-gray-800 border-t-1 justify-end p-2 flex-1 ${
                viewMode === "Following"
                  ? "dark:border-b-2 dark:border-b-gray-500 border-b-2 border-b-black"
                  : "dark:border-b-2 dark:border-b-gray-800 border-b-2 border-b-white"
              }`}
              onClick={() => setViewMode("Following")}
            >
              <div className="flex mx-auto justify-center text-center gap-10">
                <CardTitle className={`text-xl cursor-pointer flex-1`}>
                  Following
                </CardTitle>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-10 bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col items-center">
          <div className="flex flex-col items-center justify-center max-w-2xl w-full px-4 space-y-4">
            {/* Map over posts - now using HomePagePostCard component */}
            {viewMode === "For You"
              ? apiPosts?.map((post) => (
                  <HomePagePostCard
                    // refetchPosts={refetchPosts}
                    key={post.id}
                    post={post}
                    onViewComments={handleViewModal}
                    handleTogglePostLike={handleTogglePostLike}
                    isTogglingPostLike={isTogglingPostLike}
                    handleToggleSavePost={handleToggleSavePost}
                    isTogglingSavePost={isTogglingSavePost}
                  />
                ))
              : followingPosts?.map((post) => (
                  <HomePagePostCard
                    // refetchPosts={refetchPosts}
                    key={post.id}
                    post={post}
                    onViewComments={handleViewModal}
                    handleTogglePostLike={handleTogglePostLike}
                    isTogglingPostLike={isTogglingPostLike}
                    handleToggleSavePost={handleToggleSavePost}
                    isTogglingSavePost={isTogglingSavePost}
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
            handleTogglePostLike={handleTogglePostLike}
            isTogglingPostLike={isTogglingPostLike}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default HomePage;

//  onClick={() =>
//                     toggleFollow(post.username)
//                       .unwrap()
//                       .then(() => {
//                         dispatch(
//                           postApi.util.invalidateTags([
//                             { type: "Post", id: "LIST" },
//                           ])
//                         );
//                       })
//                   }
