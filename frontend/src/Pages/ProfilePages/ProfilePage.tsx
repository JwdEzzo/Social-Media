import {
  useGetFollowerCountQuery,
  useGetFollowingCountQuery,
  useIsFollowedQuery,
  useToggleFollowMutation,
} from "@/api/followers/followApi";
import {
  postApi,
  useGetPostsByUsernameQuery,
  useGetPostsCountQuery,
  useGetPostsLikedByCurrentUserQuery,
  useGetPostsSavedByCurrentUserQuery,
} from "@/api/posts/postApi";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Grid3X3,
  Heart,
  MoveLeft,
  Bookmark,
  Edit3,
  LogOut,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { useTogglePostLikeMutation } from "@/api/posts/postLikesApi";
import { useTogglePostSaveMutation } from "@/api/posts/postSavesApi";
import { useDispatch } from "react-redux";
import { logout } from "@/auth/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreatePostModal from "@/Pages/PostPages/CreatePostModal";
import ViewPost from "@/Pages/PostPages/ViewPost";
import type { RootState } from "@/store/store";
import { closePostModal } from "@/slices/viewPostSlice";
import { useSelector } from "react-redux";
import ProfilePagePostCard from "@/Pages/PostPages/ProfilePagePostCard";

interface ProfilePageProps {
  isOwnProfile: boolean;
}

function ProfilePage({ isOwnProfile }: ProfilePageProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username: loggedInUsername } = useAuth();
  const { searchedUsername } = useParams<{ searchedUsername: string }>();
  const [viewMode, setViewMode] = useState<"posts" | "liked" | "saved">(
    "posts"
  );
  const [showCreatePostModal, setShowCreatePostModal] =
    useState<boolean>(false);

  // In both ProfilePage and HomePage, we have the ViewPost.tsx as a child component.
  // We call the state from Redux store in both components
  // We then pass them as props to the ViewPost component
  const { isOpen: isViewModalOpen, selectedPostId } = useSelector(
    (state: RootState) => state.viewPostModal
  );

  // Determine which username to use
  const profileUsername = isOwnProfile ? loggedInUsername : searchedUsername;

  // API Queries
  const {
    data: profileUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetUserByUsernameQuery(profileUsername!, {
    skip: !profileUsername,
  });

  const { data: loggedInUserData } = useGetUserByUsernameQuery(
    loggedInUsername!,
    {
      skip: !loggedInUsername,
    }
  );

  const [toggleFollow] = useToggleFollowMutation();

  const { data: isFollowed } = useIsFollowedQuery(profileUsername!, {
    skip: !profileUsername,
  });

  const {
    data: posts,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useGetPostsByUsernameQuery(profileUsername!, {
    skip: !profileUsername,
  });

  const { data: getFollowerCount } = useGetFollowerCountQuery(
    profileUsername!,
    {
      skip: !profileUsername,
    }
  );

  const { data: getFollowingCount } = useGetFollowingCountQuery(
    profileUsername!,
    {
      skip: !profileUsername,
    }
  );

  const { data: postCount } = useGetPostsCountQuery(profileUsername!, {
    skip: !profileUsername,
  });

  const { data: likedPosts } = useGetPostsLikedByCurrentUserQuery();
  const { data: savedPosts } = useGetPostsSavedByCurrentUserQuery();
  const [togglePostLike, { isLoading: isTogglingPostLike }] =
    useTogglePostLikeMutation();
  const [toggleSave, { isLoading: isTogglingSavePost }] =
    useTogglePostSaveMutation();

  // Sorting logic
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

  const sortedSavedPosts = savedPosts
    ? [...savedPosts].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  // Handlers
  async function handleTogglePostLike(postId: number) {
    if (!isOwnProfile) return;
    try {
      await togglePostLike(postId).unwrap();
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async function handleToggleSavePost(postId: number) {
    if (!isOwnProfile) return;
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

  async function handleFollow() {
    try {
      await toggleFollow(profileUser!.username).unwrap();
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

  // Loading state
  if (!profileUsername || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (isUserError || (isOwnProfile && isPostsError)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-gray-700 rounded-lg">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-red-500">Could not load profile</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // User not found
  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-gray-700 rounded-lg">
          <h2 className="text-xl font-bold">User Not Found</h2>
          <p>The requested user does not exist</p>
        </div>
      </div>
    );
  }

  // Navigation handlers
  function navigateToFollowers() {
    navigate(`/userprofile/${profileUsername}/followers`);
  }

  function navigateToFollowing() {
    navigate(`/userprofile/${profileUsername}/following`);
  }

  function navigateToEditProfile() {
    if (isOwnProfile) {
      navigate(`/userprofile/${profileUser?.username}/edit-profile`);
    }
  }

  // Conditional rendering based on profile type

  function renderProfilePicture() {
    return (
      <div
        className={`relative ${isOwnProfile ? "cursor-pointer" : ""}`}
        onClick={isOwnProfile ? navigateToEditProfile : undefined}
      >
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <img
            src={profileUser?.profilePictureUrl}
            alt={profileUser?.username}
            className="w-full h-full object-cover"
          />
        </div>
        {isOwnProfile && (
          <button className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow">
            <Camera className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
    );
  }

  function renderActionButtons() {
    return (
      <div className="flex gap-2 max-md:justify-center">
        {isOwnProfile ? (
          <div>
            <Button
              onClick={() => navigate(`/home/${loggedInUsername}`)}
              className="cursor-pointer mr-2"
            >
              <MoveLeft className="hover:bg-gray-200 dark:hover:bg-gray-700" />
              Home Page
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                align="start"
              >
                <DropdownMenuLabel className="text-gray-700 dark:text-gray-300 font-bold">
                  {profileUser?.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-white cursor-pointer transition-colors duration-100 ease-in-out"
                    onClick={() =>
                      navigate(
                        `/userprofile/${profileUser?.username}/edit-profile`
                      )
                    }
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(
                        `/userprofile/${profileUser?.username}/edit-credentials`
                      )
                    }
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
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
          </div>
        ) : (
          <Button
            onClick={() => navigate(`/home/${loggedInUsername}`)}
            className="cursor-pointer"
          >
            <MoveLeft className="hover:bg-gray-200 dark:hover:bg-gray-700" />
            Home Page
          </Button>
        )}
        <ModeToggle />
      </div>
    );
  }

  function renderBio() {
    return (
      <div className="text-left max-w-md">
        <p className="font-light text-sm max-md:text-center">
          {profileUser?.bioText || "No bio available"}
        </p>
      </div>
    );
  }

  function renderCreatePostButton() {
    return (
      isOwnProfile && (
        <div className="flex items-center justify-start max-md:justify-center">
          <Button
            className="bg-black hover:bg-gray-600 dark:bg-white hover:cursor-pointer dark:hover:bg-gray-400 dark:text-black hover:text-white"
            onClick={() => setShowCreatePostModal(true)}
          >
            Create Post
          </Button>
        </div>
      )
    );
  }

  function renderPostsGrid() {
    if (isPostsLoading && viewMode === "posts") {
      return (
        <div className="grid grid-cols-3 gap-1 mt-6">
          {[...Array(9)].map((_, index) => (
            <div
              key={`loading-${index}`}
              className="aspect-square bg-gray-200 dark:bg-gray-700 rounded relative flex items-center justify-center"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ))}
        </div>
      );
    }

    if (viewMode === "posts" && posts) {
      return (
        <div className="grid grid-cols-3 gap-1 mt-6">
          {sortedPosts.map((post) => (
            <div key={post.id} className="group relative aspect-square">
              <ProfilePagePostCard post={post} />
            </div>
          ))}
        </div>
      );
    }

    if (viewMode === "liked") {
      if (likedPosts) {
        return (
          <div className="grid grid-cols-3 gap-1 mt-6">
            {sortedLikedPosts.map((post) => (
              <div key={post.id} className="group relative aspect-square">
                <ProfilePagePostCard post={post} />
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div className="col-span-full text-center py-8 text-gray-500">
            No liked posts yet
          </div>
        );
      }
    }

    if (viewMode === "saved") {
      if (savedPosts) {
        return (
          <div className="grid grid-cols-3 gap-1 mt-6">
            {sortedSavedPosts.map((post) => (
              <div key={post.id} className="group relative aspect-square">
                <ProfilePagePostCard post={post} />
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div className="col-span-full text-center py-8 text-gray-500">
            No saved posts yet
          </div>
        );
      }
    }

    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture */}
            {renderProfilePicture()}

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <div className="flex gap-2 ">
                    <h1 className="text-2xl font-bold">
                      {profileUser.username}
                    </h1>
                    {!isOwnProfile ? (
                      <Button
                        className={`${
                          isFollowed
                            ? "fill-current text-white-500 text-white dark:text-white-500 bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-900 "
                            : ""
                        }`}
                        onClick={handleFollow}
                        //
                      >
                        {isFollowed ? "Following" : "Follow"}
                      </Button>
                    ) : null}
                  </div>
                  {renderBio()}
                </div>

                {/* Action Buttons */}
                {renderActionButtons()}
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
                  onClick={navigateToFollowers}
                >
                  <div className="font-bold text-xl">
                    {getFollowerCount || 0}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs tracking-wide">
                    Followers
                  </p>
                </div>

                {/* Number of Following */}
                <div
                  className="text-center hover:bg-gray-800 px-3 py-1 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-all"
                  onClick={navigateToFollowing}
                >
                  <div className="font-bold text-xl">
                    {getFollowingCount || 0}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Following
                  </p>
                </div>
              </div>

              {/* Create Post Button */}
              {renderCreatePostButton()}
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 md:justify-start md:items-stretch">
          <div
            onClick={() => setViewMode("posts")}
            className={`flex items-center gap-2 py-4 px-6 transition-colors cursor-pointer flex-1 justify-center md:flex-none md:justify-start
        ${
          viewMode === "posts"
            ? "border-black dark:border-white text-black dark:text-white font-semibold border-b-2"
            : " text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
          >
            <button>
              <div className="flex items-center gap-2 cursor-pointer">
                <Grid3X3 className="h-5 w-5" />
                <span>Posts</span>
              </div>
            </button>
          </div>

          {isOwnProfile ? (
            <>
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
              <div
                onClick={() => setViewMode("saved")}
                className={`flex items-center gap-2 py-4 px-6 transition-colors flex-1 justify-center md:flex-none md:justify-start
            ${
              viewMode === "saved"
                ? "border-black dark:border-white text-black dark:text-white font-semibold border-b-2"
                : " text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
              >
                <button>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Bookmark className="h-5 w-5 " />
                    <span>Saved</span>
                  </div>
                </button>
              </div>
            </>
          ) : (
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
          )}
        </div>

        {/* Posts Grid */}
        {renderPostsGrid()}
      </div>

      {/* Create Post Modal */}
      {isOwnProfile && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
        />
      )}

      {/* View Post Modal */}
      <ViewPost
        isOpen={isViewModalOpen}
        handleCloseViewModal={handleCloseViewModal}
        selectedPostId={selectedPostId}
        loggedInUser={loggedInUserData}
        handleTogglePostLike={handleTogglePostLike}
        isTogglingPostLike={isTogglingPostLike}
        handleToggleSavePost={handleToggleSavePost}
        isTogglingSavePost={isTogglingSavePost}
      />
    </div>
  );
}

export default ProfilePage;
