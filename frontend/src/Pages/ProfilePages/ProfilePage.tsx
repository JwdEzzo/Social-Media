import { postApi } from "@/api/posts/postApi";
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
import { ModeToggle } from "@/components/ModeToggle";
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
import ProfilePagePostCard from "@/Pages/PostPages/ProfilePagePostCard";
import FollowButton from "@/components/custom/follow-button";
import { useProfileLogic } from "@/hooks/useProfilePageHook";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import type { GetPostResponse } from "@/types/response-types";

interface ProfilePageProps {
  isOwnProfile: boolean;
}

function ProfilePage({ isOwnProfile }: ProfilePageProps) {
  const { state, actions } = useProfileLogic(isOwnProfile);
  const { profileUser, loggedInUserData, viewMode } = state;

  // Loading state
  if (!state.profileUser || state.isUserLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Error states
  if (state.isUserError || state.isPostsError) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-1 text-lg font-semibold text-destructive">Error</h2>
          <p className="text-sm text-muted-foreground">
            Could not load profile
          </p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // User not found
  if (!profileUser) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-1 text-lg font-semibold">User Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The requested user does not exist
          </p>
        </div>
      </div>
    );
  }

  // Conditional rendering based on profile type

  function renderProfilePicture() {
    return (
      <div
        className={`group/avatar relative shrink-0 ${isOwnProfile ? "cursor-pointer" : ""}`}
        onClick={isOwnProfile ? actions.navigateToEditProfile : undefined}
      >
        <div className="size-24 overflow-hidden rounded-full border border-border bg-muted sm:size-36">
          <img
            src={profileUser?.profilePictureUrl}
            alt={profileUser?.username}
            className="w-full h-full object-cover"
          />
        </div>
        {isOwnProfile && (
          <button className="absolute right-1 bottom-1 rounded-full border-2 border-background bg-foreground p-1.5 shadow-sm transition-transform group-hover/avatar:scale-110 sm:right-2 sm:bottom-2">
            <Camera className="size-3.5 text-background" />
          </button>
        )}
      </div>
    );
  }

  function renderActionButtons() {
    return (
      <div className="flex flex-wrap items-center gap-2 max-md:justify-center">
        {isOwnProfile ? (
          <div>
            <Button
              onClick={() =>
                actions.navigate(`/home/${state.loggedInUsername}`)
              }
              className="mr-2 h-8 cursor-pointer rounded-lg border-0 bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-none hover:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/80"
            >
              <MoveLeft className="size-4" />
              Home Page
            </Button>
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
              <DropdownMenuContent className="w-56 rounded-lg" align="start">
                <DropdownMenuLabel className="truncate font-semibold">
                  {profileUser?.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      actions.navigate(
                        `/userprofile/${profileUser?.username}/edit-profile`,
                      )
                    }
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      actions.navigate(
                        `/userprofile/${profileUser?.username}/edit-credentials`,
                      )
                    }
                    className="cursor-pointer"
                  >
                    Edit Credentials
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (profileUser?.id) {
                        actions.toggleAccountStatus({
                          targetUserId: profileUser.id,
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
          <Button
            onClick={() => actions.navigate(`/home/${state.loggedInUsername}`)}
            className="h-8 cursor-pointer rounded-lg border-0 bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-none hover:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/80"
          >
            <MoveLeft className="size-4" />
            Home Page
          </Button>
        )}
        <ModeToggle />
      </div>
    );
  }

  function renderBio() {
    return (
      <div className="max-w-md text-left">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground max-md:text-center">
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
            className="h-8 cursor-pointer rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white shadow-none hover:bg-sky-600"
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
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 rounded-full border-2 border-foreground p-4">
          <Lock className="size-10 text-foreground" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          This account is private
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Follow this account to see their photos and videos.
        </p>
      </div>
    );
  }

  function renderPostsGrid() {
    if (
      viewMode === "posts" &&
      state.isOtherPrivateProfile &&
      state.isFollowStatusLoading
    ) {
      return (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
          {[...Array(9)].map((_, index) => (
            <div
              key={`loading-${index}`}
              className="relative flex aspect-square items-center justify-center bg-muted"
            >
              <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"></div>
            </div>
          ))}
        </div>
      );
    }

    if (
      viewMode === "posts" &&
      state.isOtherPrivateProfile &&
      !state.isFollowed
    ) {
      return renderPrivateAccountPlaceholder();
    }

    if (state.isPostsLoading && viewMode === "posts") {
      return (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
          {[...Array(9)].map((_, index) => (
            <div
              key={`loading-${index}`}
              className="relative flex aspect-square items-center justify-center bg-muted"
            >
              <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"></div>
            </div>
          ))}
        </div>
      );
    }

    if (viewMode === "posts") {
      return renderGrid(state.sortedPosts);
    }

    if (viewMode === "liked") {
      if (state.sortedLikedPosts.length > 0) {
        return renderGrid(state.sortedLikedPosts);
      } else {
        return (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            No liked posts yet
          </div>
        );
      }
    }

    if (viewMode === "saved") {
      if (state.sortedSavedPosts.length > 0) {
        return renderGrid(state.sortedSavedPosts);
      } else {
        return (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            No saved posts yet
          </div>
        );
      }
    }

    return null;
  }

  // Post grid for the active tab; the trigger loads that tab's next page when scrolled into view
  function renderGrid(posts: GetPostResponse[]) {
    return (
      <>
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
          {posts.map((post) => (
            <div key={post.id} className="group relative aspect-square">
              <ProfilePagePostCard post={post} />
            </div>
          ))}
        </div>
        <LoadMoreTrigger
          hasNextPage={state.pagination.hasNextPage}
          isFetchingNextPage={state.pagination.isFetchingNextPage}
          onLoadMore={state.pagination.loadMore}
        />
      </>
    );
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Profile Header */}
      <div className="bg-background">
        <div className="mx-auto max-w-4xl px-4 pt-8 pb-6 sm:pt-10">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-16 md:px-8">
            {/* Profile Picture */}
            {renderProfilePicture()}

            {/* Profile Info */}
            <div className="w-full min-w-0 flex-1 text-center md:text-left">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    <h1 className="text-xl font-medium tracking-tight sm:text-2xl">
                      {profileUser.username}
                    </h1>
                    {!isOwnProfile ? (
                      <FollowButton
                        username={profileUser.username}
                        onFollowToggled={() =>
                          actions.dispatch(
                            postApi.util.invalidateTags([
                              { type: "Post", id: "LIST" },
                            ]),
                          )
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

              {/* Create Post Button */}
              {renderCreatePostButton()}
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="mx-auto max-w-4xl pb-10 sm:px-4">
        <div className="flex border-t border-border">
          <div
            onClick={() => actions.setViewMode("posts")}
            className={`-mt-px flex flex-1 cursor-pointer items-center justify-center gap-2 border-t py-3 text-xs font-semibold transition-colors
        ${
          viewMode === "posts"
            ? "border-foreground text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
          >
            <button className="cursor-pointer rounded-sm tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
              <div className="flex cursor-pointer items-center gap-1.5">
                <Grid3X3 className="size-3.5 sm:size-4" />
                <span>Posts</span>
              </div>
            </button>
          </div>

          {isOwnProfile ? (
            <>
              <div
                onClick={() => actions.setViewMode("liked")}
                className={`-mt-px flex flex-1 cursor-pointer items-center justify-center gap-2 border-t py-3 text-xs font-semibold transition-colors
            ${
              viewMode === "liked"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
              >
                <button className="cursor-pointer rounded-sm tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  <div className="flex cursor-pointer items-center gap-1.5">
                    <Heart className="size-3.5 sm:size-4" />
                    <span>Likes</span>
                  </div>
                </button>
              </div>
              <div
                onClick={() => actions.setViewMode("saved")}
                className={`-mt-px flex flex-1 cursor-pointer items-center justify-center gap-2 border-t py-3 text-xs font-semibold transition-colors
            ${
              viewMode === "saved"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
              >
                <button className="cursor-pointer rounded-sm tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  <div className="flex cursor-pointer items-center gap-1.5">
                    <Bookmark className="size-3.5 sm:size-4" />
                    <span>Saved</span>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div
              onClick={() => actions.setViewMode("liked")}
              className={`-mt-px flex flex-1 cursor-pointer items-center justify-center gap-2 border-t py-3 text-xs font-semibold transition-colors
            ${
              viewMode === "liked"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            >
              <button className="cursor-pointer rounded-sm tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                <div className="flex cursor-pointer items-center gap-1.5">
                  <Heart className="size-3.5 sm:size-4" />
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
          isOpen={state.showCreatePostModal}
          onClose={() => actions.setShowCreatePostModal(false)}
        />
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
