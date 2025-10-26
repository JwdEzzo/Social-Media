import { useAuth } from "@/auth/useAuth";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Camera, Edit3, Grid3X3, Heart, LogOut, MoveLeft } from "lucide-react";
import CreatePostModal from "@/Pages/PostPages/CreatePostModal";
import { useState } from "react";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import {
  useGetPostsByUsernameQuery,
  useGetPostsCountQuery,
  useGetPostsLikedByCurrentUserQuery,
} from "@/api/posts/postApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/auth/authSlice";
import ProfilePagePostCard from "../PostPages/ProfilePagePostCard";
import ViewPost from "../PostPages/ViewPost";
import type { RootState } from "@/store/store";
import { closePostModal } from "@/slices/viewPostSlice";
import { useTogglePostLikeMutation } from "@/api/posts/postLikesApi";
import {
  useGetFollowerCountQuery,
  useGetFollowingCountQuery,
} from "@/api/followers/followApi";

function ProfilePage() {
  const { username: loggedInUsername } = useAuth();
  const [showCreatePostModal, setShowCreatePostModal] =
    useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"posts" | "liked">("posts"); // Add this state

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function sortPostsByIdDesc<T extends { id: number }>(a: T, b: T) {
    if (!posts) return [];
    return [...posts].sort((a, b) => b.id - a.id);
  }

  // Get modal state from Redux store
  // In both ProfilePage and HomePage, we have the ViewPost.tsx as a child component.
  // We call the state from Redux store in both components
  // We then pass them as props to the ViewPost component
  const { isOpen: isViewModalOpen, selectedPostId } = useSelector(
    (state: RootState) => state.viewPostModal
  );

  const {
    data: loggedInUser,
    isLoading,
    isError,
  } = useGetUserByUsernameQuery(loggedInUsername!, {
    skip: !loggedInUsername,
  });

  const { data: posts, isLoading: isPostsLoading } = useGetPostsByUsernameQuery(
    loggedInUsername!
  );

  const [togglePostLike, { isLoading: isTogglingPostLike }] =
    useTogglePostLikeMutation();

  const { data: getFollowerCount } = useGetFollowerCountQuery(
    loggedInUsername!
  );

  const { data: getFollowingCount } = useGetFollowingCountQuery(
    loggedInUsername!
  );

  const { data: postCount } = useGetPostsCountQuery(loggedInUsername!);

  const { data: likedPosts } = useGetPostsLikedByCurrentUserQuery();

  const sortedPosts = posts
    ? [...posts].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  const sortedLikedPosts = likedPosts
    ? [...likedPosts].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  async function handleTogglePostLike(postId: number) {
    try {
      await togglePostLike(postId).unwrap();
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  function handleCloseViewModal() {
    dispatch(closePostModal());
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-100 rounded-lg">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-red-500">Could not load profile</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold">User Not Found</h2>
          <p>The requested user does not exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture */}
            <div
              className="relative"
              onClick={() =>
                navigate(`/userprofile/${loggedInUser.username}/edit-profile`)
              }
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={loggedInUser.profilePictureUrl}
                  alt={loggedInUser.username}
                  className="w-full h-full object-cover"
                />
              </div>

              <button className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {loggedInUser.username}
                  </h1>
                  <div className="text-left max-w-md">
                    <p className="font-light text-sm max-md:text-center">
                      {loggedInUser.bioText || "No bio available"}
                    </p>
                  </div>
                </div>

                {/* Dropdown Menu, Edit username or credentials */}
                <div className="flex gap-2 max-md:justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="cursor-pointer">
                        {" "}
                        <Edit3 className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                      align="start"
                    >
                      <DropdownMenuLabel className="text-gray-700 dark:text-gray-300 font-bold">
                        {loggedInUser.username}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-white cursor-pointer transition-colors duration-100 ease-in-out"
                          onClick={() =>
                            navigate(
                              `/userprofile/${loggedInUser.username}/edit-profile`
                            )
                          }
                        >
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(
                              `/userprofile/${loggedInUser.username}/edit-credentials`
                            )
                          }
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                          //
                        >
                          Edit Credentials
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 focus:bg-red-100 dark:focus:bg-red-900/30 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span className="font-bold">Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ModeToggle />
                  <Button
                    onClick={() => navigate(`/home/${loggedInUsername}`)}
                    className="cursor-pointer"
                  >
                    <MoveLeft className="hover:bg-gray-200 dark:hover:bg-gray-700 "></MoveLeft>
                    Home Page
                  </Button>
                </div>
              </div>

              {/* User Stats - Following, Followers */}
              <div className="flex gap-4 mb-4 items-center justify-center md:justify-start transition-colors">
                {/* Number of Posts */}
                <div className="text-center hover:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1 rounded-md cursor-pointer transition-all">
                  <div className="font-bold text-xl">{postCount || 0}</div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Posts
                  </p>
                </div>

                {/* Number of Followers */}
                <div
                  className="text-center hover:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1 rounded-md cursor-pointer transition-all"
                  onClick={() =>
                    navigate(`/userprofile/${loggedInUsername}/followers`)
                  }
                >
                  <div className="font-bold text-xl">
                    {getFollowerCount || 0}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs  tracking-wide">
                    Followers
                  </p>
                </div>

                {/* Number of Following */}
                <div
                  className="text-center hover:bg-gray-800 px-3 py-1 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-all"
                  onClick={() =>
                    navigate(`/userprofile/${loggedInUsername}/following`)
                  }
                  //
                >
                  <div className="font-bold text-xl ">
                    {getFollowingCount || 0}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs ">
                    Following
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-start max-md:justify-center">
                <Button
                  className="bg-black hover:bg-gray-600 dark:bg-white hover:cursor-pointer dark:hover:bg-gray-400 dark:text-black hover:text-white"
                  onClick={() => setShowCreatePostModal(true)}
                >
                  Create Post
                </Button>
              </div>
              {/* Bio */}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 md:justify-start md:items-stretch">
          <div
            onClick={() => setViewMode("posts")}
            className={`flex items-center gap-2 py-4 px-6  transition-colors cursor-pointer flex-1 justify-center md:flex-none md:justify-start
        ${
          viewMode === "posts"
            ? "border-black dark:border-white text-black dark:text-white font-semibold border-b-2"
            : " text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
          >
            <button>
              <div className="flex items-center gap-2 cursor-pointer ">
                <Grid3X3 className="h-5 w-5" />
                <span>Posts</span>
              </div>
            </button>
          </div>
          <div
            onClick={() => setViewMode("liked")}
            className={`flex items-center gap-2 py-4 px-6 transition-colors flex-1 justify-center md:flex-none md:justify-start
        ${
          viewMode === "liked"
            ? "border-black dark:border-white text-black dark:text-white font-semibold border-b-2"
            : " text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
          >
            <button>
              <div className="flex items-center gap-2 cursor-pointer">
                <Heart className="h-5 w-5 " />
                <span>Likes</span>
              </div>
            </button>
          </div>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-3 gap-1 mt-6">
          {isPostsLoading && viewMode === "posts" ? (
            [...Array(9)].map((_, index) => (
              <div
                key={`loading-${index}`}
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded relative flex items-center justify-center"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ))
          ) : viewMode === "posts" && posts ? (
            sortedPosts.map((post) => (
              <div key={post.id} className="group relative aspect-square">
                <ProfilePagePostCard post={post} />
              </div>
            ))
          ) : viewMode === "liked" && likedPosts ? (
            sortedLikedPosts.map((post) => (
              <div key={post.id} className="group relative aspect-square">
                <ProfilePagePostCard post={post} />
              </div>
            ))
          ) : viewMode === "liked" ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No liked posts yet
            </div>
          ) : null}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
      />

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
    </div>
  );
}

export default ProfilePage;
