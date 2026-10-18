import {
  useCreateRecentSearchMutation,
  useSearchUsersByUsernameInfiniteQuery,
} from "@/api/search/searchApi";
import { useNavigateToProfile } from "@/hooks/useNavigateToProfile";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import { ErrorState } from "@/components/custom/status-card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagedList } from "@/hooks/usePagedList";
import { Dot } from "lucide-react";
import UserAvatar from "@/components/custom/user-avatar";

interface UserSearchResultsProps {
  query: string;
}

// The users whose username matches the query: the search page's Users tab, and the
// live matches under the search box while typing. Renders nothing while the query is
// empty. Clicking a row opens that profile.
function UserSearchResults({ query }: UserSearchResultsProps) {
  const navigateToProfile = useNavigateToProfile();

  const searchedUsersQuery = useSearchUsersByUsernameInfiniteQuery(query, {
    skip: !query,
  });
  const searchedUsers = usePagedList(searchedUsersQuery);
  const users = searchedUsers.items;

  const [createRecentSearch] = useCreateRecentSearchMutation();

  function handleUserClick(username: string) {
    // The opened profile goes into recent searches. Fire and forget, so a failed
    // save never blocks navigation.
    createRecentSearch({ searchTerm: username });

    navigateToProfile(username);
  }

  if (!query) return null;

  // Loading State: placeholder rows while the first page loads
  if (searchedUsers.isLoadingFirstPage) {
    return Array.from({ length: 8 }, (_, index) => (
      <div
        key={`loading-${index}`}
        className="flex items-center gap-2 px-2 py-3"
      >
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-40" />
      </div>
    ));
  }

  // Error State: message with a retry button
  if (searchedUsersQuery.isError) {
    return (
      <ErrorState
        className="py-16"
        message="Couldn't load search results"
        onRetry={() => searchedUsersQuery.refetch()}
      />
    );
  }

  // Empty State: the search matched nobody
  if (users.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No users found for "{query}"
      </p>
    );
  }

  // Loaded State: user rows plus infinite-scroll trigger
  return (
    <>
      {users.map((user) => (
        <div
          key={user.username}
          className="flex items-center gap-2 bg-background/85 py-3 backdrop-blur-md cursor-pointer hover:bg-sidebar-accent rounded-full px-2"
          onClick={() => handleUserClick(user.username)}
        >
          <UserAvatar
            src={user.profilePictureUrl}
            className="rounded-full size-10"
          />
          <h2>{user.username}</h2>
          <Dot />
          <p>{user.bioText}</p>
        </div>
      ))}

      {/* Load More Trigger: fetches the next page when scrolled into view */}
      <LoadMoreTrigger
        hasNextPage={searchedUsers.hasNextPage}
        isFetchingNextPage={searchedUsers.isFetchingNextPage}
        onLoadMore={searchedUsers.loadMore}
      />
    </>
  );
}

export default UserSearchResults;
