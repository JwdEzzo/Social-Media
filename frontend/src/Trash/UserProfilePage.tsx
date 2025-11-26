import {
  useGetFollowerCountQuery,
  useGetFollowingCountQuery,
} from "@/api/followers/followApi";
import {
  useGetPostsByUsernameQuery,
  useGetPostsCountQuery,
} from "@/api/posts/postApi";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Camera, Grid3X3, Heart, MoveLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ProfilePagePostCard from "@/Pages/PostPages/ProfilePagePostCard";
import { useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";

function UserProfilePage() {
  const navigate = useNavigate();
  const { username: loggedInUsername } = useAuth();
  const { searchedUsername } = useParams<{ searchedUsername: string }>();
  const [viewMode, setViewMode] = useState<"posts" | "liked">("posts");
  const {
    data: posts,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useGetPostsByUsernameQuery(searchedUsername!, {
    skip: !searchedUsername,
  });

  const sortedPosts = posts
    ? [...posts].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  const { data: getFollowerCount } = useGetFollowerCountQuery(
    searchedUsername!,
    {
      skip: !searchedUsername,
    }
  );

  const { data: getFollowingCount } = useGetFollowingCountQuery(
    searchedUsername!,
    {
      skip: !searchedUsername,
    }
  );

  const { data: postCount } = useGetPostsCountQuery(searchedUsername!, {
    skip: !searchedUsername,
  });

  const {
    data: searchedUser,
    isLoading: isSearchedUserLoading,
    isError: isSearchedUserError,
  } = useGetUserByUsernameQuery(searchedUsername!, {
    skip: !searchedUsername,
  });

  if (!searchedUsername) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isSearchedUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isSearchedUserError || isPostsError) {
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

  if (!searchedUser && !isSearchedUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-gray-700 rounded-lg">
          <h2 className="text-xl font-bold">User Not Found</h2>
          <p>The requested user does not exist</p>
        </div>
      </div>
    );
  }
  // Check if the query has completed and still has no data
  if (searchedUsername && !isSearchedUserLoading && !searchedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-gray-700 rounded-lg">
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
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={searchedUser.profilePictureUrl}
                  alt={searchedUser.username}
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
                    {searchedUser.username}
                  </h1>
                  <div className="text-left max-w-md">
                    <p className="font-light text-sm max-md:text-center">
                      {searchedUser.bioText || "No bio available"}
                    </p>
                  </div>
                </div>

                {/* Dropdown Menu, Edit username or credentials */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/home/${loggedInUsername}`)}
                    className="cursor-pointer"
                  >
                    <MoveLeft className="hover:bg-gray-200 dark:hover:bg-gray-700 "></MoveLeft>
                    Home Page
                  </Button>
                  <ModeToggle />
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
                    navigate(`/userprofile/${searchedUsername}/followers`)
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
                    navigate(`/userprofile/${searchedUsername}/following`)
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
            </div>
          </div>
        </div>
      </div>

      {/* Change view between the USER posts and the LIKED Posts */}
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
          {isPostsLoading && viewMode === "posts"
            ? [...Array(9)].map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="aspect-square bg-gray-200 dark:bg-gray-700 rounded relative flex items-center justify-center"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ))
            : viewMode === "posts" && posts
            ? sortedPosts.map((post) => (
                <div key={post.id} className="group relative aspect-square">
                  <ProfilePagePostCard post={post} />
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
