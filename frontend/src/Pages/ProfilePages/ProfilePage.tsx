import { Button } from "@/components/ui/button";
import {
  Camera,
  Grid3X3,
  Heart,
  MoveLeft,
  Bookmark,
  Lock,
  Edit3,
  LogOut,
  Unlock,
} from "lucide-react";
import { ModeToggle } from "@/components/theme/ModeToggle";
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
import ViewPostModal from "@/Pages/PostPages/ViewPostModal";
import FollowButton from "@/components/custom/follow-button";
import { useProfileLogic } from "@/hooks/useProfilePageHook";
import UserAvatar from "@/components/custom/user-avatar";
import ProfileTab from "@/components/custom/profile-tab";
import {
  FullPageLoading,
  FullPageStatus,
} from "@/components/custom/status-card";
import ProfilePostsSection from "@/components/custom/profile-posts-section";

interface ProfilePageProps {
  isOwnProfile: boolean;
}

function ProfilePage({ isOwnProfile }: ProfilePageProps) {
  const { state, actions } = useProfileLogic(isOwnProfile);
  const { profileUser, viewMode } = state;

  // Posts section: which list the active tab shows, and which state it's in
  const isPostsTab = viewMode === "posts";

  const postsByTab = {
    posts: state.sortedPosts,
    liked: state.sortedLikedPosts,
    saved: state.sortedSavedPosts,
  };

  const activePosts = postsByTab[viewMode];

  // Someone else's private account: wait for follow status, then hide posts unless followed
  const isCheckingFollowStatus =
    isPostsTab && state.isOtherPrivateProfile && state.isFollowStatusLoading;

  const isPrivateAndNotFollowed =
    isPostsTab &&
    state.isOtherPrivateProfile &&
    !state.isFollowed &&
    !isCheckingFollowStatus;

  const isLoadingPosts =
    isCheckingFollowStatus ||
    (isPostsTab && state.isPostsLoading && !isPrivateAndNotFollowed);

  // Liked/Saved show an empty message; the Posts tab just shows an empty grid
  const isEmptyLikedOrSaved = !isPostsTab && activePosts.length === 0;

  // Loading state
  if (state.isUserLoading) {
    return <FullPageLoading label="Loading profile..." />;
  }

  // User not found (404)
  if (state.isUserNotFound) {
    return (
      <FullPageStatus
        title="User Not Found"
        message="The requested user does not exist"
      />
    );
  }

  // Error states (network, 500, etc.)
  if (state.isUserError || state.isPostsError) {
    return (
      <FullPageStatus
        isError
        title="Error"
        message="Could not load profile"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // No user and no request made (query skipped because there's no username)
  if (!profileUser) {
    return (
      <FullPageStatus
        title="User Not Found"
        message="The requested user does not exist"
      />
    );
  }

  return (
    // Page Container
    <div className="min-h-svh bg-background">
      {/* Profile Header */}
      <div className="bg-background">
        <div className="mx-auto max-w-4xl px-4 pt-8 pb-6 sm:pt-10">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-16 md:px-8">
            {/* Profile Picture: clicking your own opens Edit Profile */}
            <div
              className={`group/avatar relative shrink-0 ${isOwnProfile ? "cursor-pointer" : ""}`}
              onClick={isOwnProfile ? actions.navigateToEditProfile : undefined}
            >
              <div className="size-24 overflow-hidden rounded-full border border-border bg-muted sm:size-36">
                <UserAvatar
                  src={profileUser?.profilePictureUrl}
                  alt={profileUser?.username}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Camera Badge: own profile only */}
              {isOwnProfile && (
                <button className="absolute right-1 bottom-1 rounded-full border-2 border-background bg-foreground p-1.5 shadow-sm transition-transform group-hover/avatar:scale-110 sm:right-2 sm:bottom-2">
                  <Camera className="size-3.5 text-background" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="w-full min-w-0 flex-1 text-center md:text-left">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  {/* Username + Follow Button (other profiles, logged in only) */}
                  <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    <h1 className="text-xl font-medium tracking-tight sm:text-2xl">
                      {profileUser.username}
                    </h1>
                    {!isOwnProfile && state.loggedInUsername ? (
                      <FollowButton username={profileUser.username} />
                    ) : null}
                  </div>

                  {/* Bio */}
                  <div className="max-w-md text-left">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground max-md:text-center">
                      {profileUser?.bioText || "No bio available"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 max-md:justify-center">
                  {isOwnProfile ? (
                    // Own Profile: Home Page button + Settings dropdown
                    <div>
                      {/* Home Page Button */}
                      <Button
                        onClick={() =>
                          actions.navigate(`/home/${state.loggedInUsername}`)
                        }
                        className="mr-2 h-8 cursor-pointer rounded-lg border-0 bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-none hover:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/80"
                      >
                        <MoveLeft className="size-4" />
                        Home Page
                      </Button>

                      {/* Settings Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-8 cursor-pointer rounded-lg border-0 bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-none hover:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/80"
                          >
                            <Edit3 className="size-4" />
                            Settings
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-56 rounded-lg"
                          align="start"
                        >
                          <DropdownMenuLabel className="truncate font-semibold">
                            {profileUser?.username}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuGroup>
                            {/* Edit Profile */}
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() =>
                                actions.navigate("/me/edit-profile")
                              }
                            >
                              Edit Profile
                            </DropdownMenuItem>

                            {/* Edit Credentials */}
                            <DropdownMenuItem
                              onClick={() =>
                                actions.navigate("/me/edit-credentials")
                              }
                              className="cursor-pointer"
                            >
                              Edit Credentials
                            </DropdownMenuItem>

                            {/* Public / Private Toggle */}
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                if (profileUser?.username) {
                                  actions.toggleAccountStatus({
                                    username: profileUser.username,
                                  });
                                }
                              }}
                            >
                              {profileUser?.accountStatus === "PRIVATE"
                                ? "Set Account to Public"
                                : "Set Account to Private"}
                              {profileUser?.accountStatus === "PRIVATE" ? (
                                <Unlock className="ml-auto text-muted-foreground" />
                              ) : (
                                <Lock className="ml-auto text-muted-foreground" />
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator className="my-1" />

                          {/* Log Out */}
                          <DropdownMenuItem
                            onClick={actions.handleLogout}
                            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <LogOut className="text-destructive" />
                            <span className="font-semibold">Log out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    // Other Profile: Home Page button only
                    <Button
                      onClick={() =>
                        actions.navigate(`/home/${state.loggedInUsername}`)
                      }
                      className="h-8 cursor-pointer rounded-lg border-0 bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-none hover:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/80"
                    >
                      <MoveLeft className="size-4" />
                      Home Page
                    </Button>
                  )}

                  {/* Light / Dark Mode Toggle */}
                  <ModeToggle />
                </div>
              </div>

              {/* User Stats - Posts, Followers, Following */}
              <div className="mb-5 flex items-center justify-center gap-2 border-y border-border py-2 md:justify-start md:gap-6 md:border-0 md:py-0">
                {/* Number of Posts */}
                <div className="flex-1 cursor-pointer rounded-md px-3 py-1 text-center transition-colors hover:bg-accent md:flex-none">
                  <div className="text-base font-semibold">
                    {state.stats.postCount || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>

                {/* Number of Followers */}
                <div
                  className="flex-1 cursor-pointer rounded-md px-3 py-1 text-center transition-colors hover:bg-accent md:flex-none"
                  onClick={actions.navigateToFollowers}
                >
                  <div className="text-base font-semibold">
                    {state.stats.followerCount || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>

                {/* Number of Following */}
                <div
                  className="flex-1 cursor-pointer rounded-md px-3 py-1 text-center transition-colors hover:bg-accent md:flex-none"
                  onClick={actions.navigateToFollowing}
                >
                  <div className="text-base font-semibold">
                    {state.stats.followingCount || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>

              {/* Create Post Button: own profile only */}
              {isOwnProfile && (
                <div className="flex items-center justify-start max-md:justify-center">
                  <Button
                    className="h-8 cursor-pointer rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white shadow-none hover:bg-sky-600"
                    onClick={() => actions.setShowCreatePostModal(true)}
                  >
                    Create Post
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs + Posts Section */}
      <div className="mx-auto max-w-4xl pb-10 sm:px-4">
        {/* View Mode Tabs: Posts / Likes / Saved. Likes and Saved are your own
            lists, so they only show on your own profile */}
        <div className="flex border-t border-border">
          <ProfileTab
            label="Posts"
            icon={Grid3X3}
            isActive={viewMode === "posts"}
            onSelect={() => actions.setViewMode("posts")}
          />
          {isOwnProfile && (
            <>
              <ProfileTab
                label="Likes"
                icon={Heart}
                isActive={viewMode === "liked"}
                onSelect={() => actions.setViewMode("liked")}
              />
              <ProfileTab
                label="Saved"
                icon={Bookmark}
                isActive={viewMode === "saved"}
                onSelect={() => actions.setViewMode("saved")}
              />
            </>
          )}
        </div>

        {/* Posts Section: content for the active tab */}
        <ProfilePostsSection
          posts={activePosts}
          isLoading={isLoadingPosts}
          isPrivate={isPrivateAndNotFollowed}
          isEmpty={isEmptyLikedOrSaved}
          emptyMessage={
            viewMode === "liked" ? "No liked posts yet" : "No saved posts yet"
          }
          pagination={state.pagination}
        />
      </div>

      {/* Create Post Modal: own profile only */}
      {isOwnProfile && (
        <CreatePostModal
          isOpen={state.showCreatePostModal}
          onClose={() => actions.setShowCreatePostModal(false)}
        />
      )}

      {/* View Post Modal: opens when a post tile is clicked */}
      <ViewPostModal />
    </div>
  );
}

export default ProfilePage;

// const activePosts =
//   viewMode === "posts"            // Question 1: is the Posts tab active?
//     ? state.sortedPosts           //   yes → use the user's own posts
//     : viewMode === "liked"        //   no  → Question 2: is the Liked tab active?
//       ? state.sortedLikedPosts    //           yes → use liked posts
//       : state.sortedSavedPosts;   //           no  → only "saved" is left
