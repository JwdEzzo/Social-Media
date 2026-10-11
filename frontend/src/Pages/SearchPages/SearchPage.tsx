import {
  useGetPostsByDescriptionInfiniteQuery,
  useGetPostsExcludingCurrentUserInfiniteQuery,
} from "@/api/posts/postApi";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import { useAuth } from "@/auth/useAuth";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import LoadingPostTiles from "@/components/custom/loading-post-tiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePagedList } from "@/hooks/usePagedList";
import ProfilePagePostCard from "@/Pages/PostPages/ProfilePagePostCard";
import ViewPost from "@/Pages/PostPages/ViewPost";
import { closePostModal } from "@/slices/viewPostSlice";
import type { RootState } from "@/store/store";
import { RotateCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const SEARCH_DEBOUNCE_MS = 1000;

// Explore page: with no query it shows other users' posts, with ?q= it shows the
// posts whose description matches. Clicking a tile opens the ViewPost modal.
function SearchPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() || "";

  // The input updates on every keystroke; the URL (and so the query) only after a pause
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextQuery = inputValue.trim();
      if (nextQuery === searchQuery) return;
      // replace: true so every search doesn't add a history entry
      setSearchParams(nextQuery ? { q: nextQuery } : {}, { replace: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [inputValue, searchQuery, setSearchParams]);

  const { isOpen: isViewModalOpen, selectedPostId } = useSelector(
    (state: RootState) => state.viewPostModal,
  );

  const { username: loggedInUsername } = useAuth();
  const { data: loggedInUser } = useGetUserByUsernameQuery(
    loggedInUsername || "",
    { skip: !loggedInUsername },
  );

  // Explore posts, shown while the search box is empty
  const explorePostsQuery = useGetPostsExcludingCurrentUserInfiniteQuery(
    undefined,
    { skip: !!searchQuery },
  );
  const explorePosts = usePagedList(explorePostsQuery);

  // Search results, shown once there's a query
  const searchedPostsQuery = useGetPostsByDescriptionInfiniteQuery(
    searchQuery,
    { skip: !searchQuery },
  );
  const searchedPosts = usePagedList(searchedPostsQuery);

  const isSearching = !!searchQuery;
  const activeQuery = isSearching ? searchedPostsQuery : explorePostsQuery;
  const activeList = isSearching ? searchedPosts : explorePosts;

  function handleCloseViewModal() {
    dispatch(closePostModal());
  }

  function renderPosts() {
    if (activeList.isLoadingFirstPage) {
      return (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
          <LoadingPostTiles />
        </div>
      );
    }

    if (activeQuery.isError) {
      return (
        <div className="py-16 text-center">
          <p className="text-base font-semibold text-foreground">
            {isSearching
              ? "Couldn't load search results"
              : "Couldn't load posts"}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => activeQuery.refetch()}
          >
            <RotateCcw className="size-4" /> Try Again
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
          {activeList.items.map((post) => (
            <ProfilePagePostCard key={post.id} post={post} />
          ))}
        </div>
        <LoadMoreTrigger
          hasNextPage={activeList.hasNextPage}
          isFetchingNextPage={activeList.isFetchingNextPage}
          onLoadMore={activeList.loadMore}
        />
      </>
    );
  }

  return (
    <div className="min-h-svh bg-background pb-8">
      {/* Header Search Input */}
      <div className="sticky top-0 z-10 flex items-center justify-center bg-background/85 px-4 py-3 backdrop-blur-md">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search posts"
            className="rounded-full pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
            placeholder="Search posts"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          {inputValue && (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setInputValue("")}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mx-auto mt-5 w-[90%]">{renderPosts()}</div>

      {/* View Post Modal */}
      <ViewPost
        isOpen={isViewModalOpen}
        handleCloseViewModal={handleCloseViewModal}
        selectedPostId={selectedPostId}
        loggedInUser={loggedInUser}
      />
    </div>
  );
}

export default SearchPage;
