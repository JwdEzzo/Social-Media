import { useSearchUsersByUsernameInfiniteQuery } from "@/api/users/userApi";
import { usePagedList } from "@/hooks/usePagedList";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/Pages/HomePage/AppSidebar";
import FollowButton from "@/components/custom/follow-button";
import { useAuth } from "@/auth/useAuth";

function SearchUsersPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const navigate = useNavigate();
  const { username: loggedInUsername } = useAuth();

  const searchedUsersQuery = useSearchUsersByUsernameInfiniteQuery(
    searchQuery,
    {
      skip: !searchQuery,
    },
  );
  const {
    isLoading: isSearchedUserLoading,
    isError: isSearchedUserError,
    refetch: refetchUsers,
  } = searchedUsersQuery;
  const {
    items: users,
    loadMore: loadMoreUsers,
    hasNextPage: hasMoreUsers,
    isFetchingNextPage: isFetchingMoreUsers,
  } = usePagedList(searchedUsersQuery);

  function handleUserClick(username: string) {
    if (username === loggedInUsername) {
      navigate(`/userprofile/${username}`);
    } else {
      navigate(`/searcheduserprofile/${username}`);
    }
  }
  // Loading state
  if (isSearchedUserLoading) {
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
  if (isSearchedUserError) {
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
              <Button onClick={() => refetchUsers()}>
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
        <main className="flex-1 bg-background py-6 sm:py-8">
          <div className="mx-auto max-w-[600px] px-4">
            {/* Search Header */}
            <div className="mb-4">
              <h2 className="mb-1 text-xl font-semibold text-foreground">
                Search Results for "{searchQuery}"
              </h2>
            </div>

            {/* User Results */}
            {users.length > 0 ? (
              <div className="space-y-1">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="cursor-pointer rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <img
                          src={user.profilePictureUrl}
                          alt={user.username}
                          className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {user.username}
                          </p>
                          {user.bioText && (
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {user.bioText}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {loggedInUsername !== user.username && (
                          <FollowButton username={user.username} />
                        )}
                        <Button
                          variant="outline"
                          className="h-8 rounded-lg px-3 text-sm font-semibold"
                          onClick={() => handleUserClick(user.username)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <LoadMoreTrigger
                  hasNextPage={hasMoreUsers}
                  isFetchingNextPage={isFetchingMoreUsers}
                  onLoadMore={loadMoreUsers}
                />
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-base font-semibold text-foreground">
                  No users found matching "{searchQuery}"
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try searching with a different username
                </p>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default SearchUsersPage;
