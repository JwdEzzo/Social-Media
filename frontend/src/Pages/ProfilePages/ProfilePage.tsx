import { postApi } from '@/api/posts/postApi';
import { Button } from '@/components/ui/button';
import { Camera, Grid3X3, Heart, MoveLeft, Bookmark, Lock, Edit3, LogOut, Unlock } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreatePostModal from '@/Pages/PostPages/CreatePostModal';
import ViewPost from '@/Pages/PostPages/ViewPost';
import ProfilePagePostCard from '@/Pages/PostPages/ProfilePagePostCard';
import FollowButton from '@/components/custom/follow-button';
import { useProfileLogic } from '@/hooks/useProfilePageHook';

interface ProfilePageProps {
  isOwnProfile: boolean;
}

function ProfilePage({ isOwnProfile }: ProfilePageProps) {
  const { state, actions } = useProfileLogic(isOwnProfile);
  const { profileUser, loggedInUserData, viewMode } = state;

  // Loading state
  if (!state.profileUser || state.isUserLoading) {
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
  if (state.isUserError || state.isPostsError) {
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

  // Conditional rendering based on profile type

  function renderProfilePicture() {
    return (
      <div
        className={`relative ${isOwnProfile ? 'cursor-pointer' : ''}`}
        onClick={isOwnProfile ? actions.navigateToEditProfile : undefined}
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
            <Button onClick={() => actions.navigate(`/home/${state.loggedInUsername}`)} className="cursor-pointer mr-2">
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
                className="w-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                align="start"
              >
                <DropdownMenuLabel className="text-gray-700 dark:text-gray-300 font-bold">
                  {profileUser?.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-white cursor-pointer transition-colors duration-100 ease-in-out"
                    onClick={() => actions.navigate(`/userprofile/${profileUser?.username}/edit-profile`)}
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => actions.navigate(`/userprofile/${profileUser?.username}/edit-credentials`)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                  >
                    Edit Credentials
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                    onClick={() => {
                      if (profileUser?.id) {
                        actions.toggleAccountStatus({ targetUserId: profileUser.id });
                      }
                    }}
                  >
                    {profileUser?.accountStatus === 'PRIVATE' ? 'Set Account to Public' : 'Set Account to Private'}
                    {profileUser?.accountStatus === 'PRIVATE' ? (
                      <Unlock className="ml-2 text-green-400" />
                    ) : (
                      <Lock className="ml-2 text-red-400" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem
                  onClick={actions.handleLogout}
                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 focus:bg-red-100 dark:focus:bg-red-900/30 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-bold">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button onClick={() => actions.navigate(`/home/${state.loggedInUsername}`)} className="cursor-pointer">
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
        <p className="font-light text-sm max-md:text-center">{profileUser?.bioText || 'No bio available'}</p>
      </div>
    );
  }

  function renderCreatePostButton() {
    return (
      isOwnProfile && (
        <div className="flex items-center justify-start max-md:justify-center">
          <Button
            className="bg-black hover:bg-gray-600 dark:bg-white hover:cursor-pointer dark:hover:bg-gray-400 dark:text-black hover:text-white"
            onClick={() => actions.setShowCreatePostModal(true)}
          >
            Create Post
          </Button>
        </div>
      )
    );
  }

  function renderPrivateAccountPlaceholder() {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center  border-gray-200 dark:border-gray-700 mt-2">
        <div className="rounded-full border-2 border-gray-900 dark:border-gray-100 p-4 mb-4">
          <Lock className="h-10 w-10 text-gray-900 dark:text-gray-100" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">This account is private</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Follow this account to see their photos and videos.
        </p>
      </div>
    );
  }

  function renderPostsGrid() {
    if (viewMode === 'posts' && state.isOtherPrivateProfile && state.isFollowStatusLoading) {
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

    if (viewMode === 'posts' && state.isOtherPrivateProfile && !state.isFollowed) {
      return renderPrivateAccountPlaceholder();
    }

    if (state.isPostsLoading && viewMode === 'posts') {
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

    if (viewMode === 'posts' && state.sortedPosts) {
      return (
        <div className="grid grid-cols-3 gap-1 mt-6">
          {state.sortedPosts.map((post) => (
            <div key={post.id} className="group relative aspect-square">
              <ProfilePagePostCard post={post} />
            </div>
          ))}
        </div>
      );
    }

    if (viewMode === 'liked') {
      if (state.sortedLikedPosts) {
        return (
          <div className="grid grid-cols-3 gap-1 mt-6">
            {state.sortedLikedPosts.map((post) => (
              <div key={post.id} className="group relative aspect-square">
                <ProfilePagePostCard post={post} />
              </div>
            ))}
          </div>
        );
      } else {
        return <div className="col-span-full text-center py-8 text-gray-500">No liked posts yet</div>;
      }
    }

    if (viewMode === 'saved') {
      if (state.sortedSavedPosts) {
        return (
          <div className="grid grid-cols-3 gap-1 mt-6">
            {state.sortedSavedPosts.map((post) => (
              <div key={post.id} className="group relative aspect-square">
                <ProfilePagePostCard post={post} />
              </div>
            ))}
          </div>
        );
      } else {
        return <div className="col-span-full text-center py-8 text-gray-500">No saved posts yet</div>;
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
                  <div className="md:flex gap-2 ">
                    <h1 className="text-2xl font-bold md:text-center">{profileUser.username}</h1>
                    {!isOwnProfile ? (
                      <FollowButton
                        username={profileUser.username}
                        onFollowToggled={() =>
                          actions.dispatch(postApi.util.invalidateTags([{ type: 'Post', id: 'LIST' }]))
                        }
                      />
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
                  <div className="font-bold text-xl">{state.stats.postCount || 0}</div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Posts</p>
                </div>

                {/* Number of Followers */}
                <div
                  className="text-center hover:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1 rounded-md cursor-pointer transition-all"
                  onClick={actions.navigateToFollowers}
                >
                  <div className="font-bold text-xl">{state.stats.followerCount || 0}</div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs tracking-wide">Followers</p>
                </div>

                {/* Number of Following */}
                <div
                  className="text-center hover:bg-gray-800 px-3 py-1 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-all"
                  onClick={actions.navigateToFollowing}
                >
                  <div className="font-bold text-xl">{state.stats.followingCount || 0}</div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Following</p>
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
            onClick={() => actions.setViewMode('posts')}
            className={`flex items-center gap-2 py-4 px-6 transition-colors cursor-pointer flex-1 justify-center md:flex-none md:justify-start
        ${
          viewMode === 'posts'
            ? 'border-black dark:border-white text-black dark:text-white font-semibold border-b-2'
            : ' text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
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
                onClick={() => actions.setViewMode('liked')}
                className={`flex items-center gap-2 py-4 px-6 transition-colors flex-1 justify-center md:flex-none md:justify-start
            ${
              viewMode === 'liked'
                ? 'border-black dark:border-white text-black dark:text-white font-semibold border-b-2'
                : ' text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
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
                onClick={() => actions.setViewMode('saved')}
                className={`flex items-center gap-2 py-4 px-6 transition-colors flex-1 justify-center md:flex-none md:justify-start
            ${
              viewMode === 'saved'
                ? 'border-black dark:border-white text-black dark:text-white font-semibold border-b-2'
                : ' text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
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
              onClick={() => actions.setViewMode('liked')}
              className={`flex items-center gap-2 py-4 px-6 transition-colors flex-1 justify-center md:flex-none md:justify-start
            ${
              viewMode === 'liked'
                ? 'border-black dark:border-white text-black dark:text-white font-semibold border-b-2'
                : ' text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
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
        <CreatePostModal isOpen={state.showCreatePostModal} onClose={() => actions.setShowCreatePostModal(false)} />
      )}

      {/* View Post Modal */}
      <ViewPost
        isOpen={state.isViewModalOpen}
        handleCloseViewModal={actions.handleCloseViewModal}
        selectedPostId={state.selectedPostId}
        loggedInUser={loggedInUserData}
        handleTogglePostLike={actions.handleTogglePostLike}
        isTogglingPostLike={state.isTogglingPostLike}
        handleToggleSavePost={actions.handleToggleSavePost}
        isTogglingSavePost={state.isTogglingSavePost}
      />
    </div>
  );
}

export default ProfilePage;
