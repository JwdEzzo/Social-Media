import {
  useCreateRecentSearchMutation,
  useSearchUsersByUsernameInfiniteQuery,
} from "@/api/search/searchApi";
import { useAuth } from "@/auth/useAuth";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagedList } from "@/hooks/usePagedList";
import { Dot, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserSearchResultsProps {
  query: string;
}

// Users tab of the search page: the users whose username matches the query.
// Renders nothing while the query is empty. Clicking a row opens that profile.
function UserSearchResults({ query }: UserSearchResultsProps) {
  const navigate = useNavigate();
  const { username: loggedInUsername } = useAuth();

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

    if (username === loggedInUsername) {
      navigate(`/userprofile/${username}`);
    } else {
      navigate(`/searcheduserprofile/${username}`);
    }
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
      <div className="py-16 text-center">
        <p className="text-base font-semibold text-foreground">
          Couldn't load search results
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => searchedUsersQuery.refetch()}
        >
          <RotateCcw className="size-4" /> Try Again
        </Button>
      </div>
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
          <img
            src={`${user.profilePictureUrl}`}
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
