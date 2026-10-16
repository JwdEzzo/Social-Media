import {
  useCreateRecentSearchMutation,
  useDeleteAllSearchesForUserMutation,
  useDeleteSearchForUserMutation,
  useGetSearchesForUserInfiniteQuery,
} from "@/api/search/searchApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagedList } from "@/hooks/usePagedList";
import PostSearchResults from "@/Pages/SearchPages/PostSearchResults";
import UserSearchResults from "@/Pages/SearchPages/UserSearchResults";
import { ChevronDown, ChevronLeft, RotateCcw, Search, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "react-router-dom";

const USER_SEARCH_DEBOUNCE_MS = 500;
type SearchType = "posts" | "users";

// The search page has three states, Instagram style:
//   Idle      (no ?q, input not focused): search bar + explore grid, no tabs
//   Panel     (input focused):            recent searches, or live user matches while typing
//   Results   (?q set, input not focused): Posts/Users tabs for the committed query
// The URL (?q=...&type=users) only changes when a search is committed (Enter or a
// recent search), so the tabs are only ever shown with a query to fill them.
function SearchPage() {
  // current URL is /search?q=cats&tab=people
  // searchParams.get("q")      returns "cats"
  // searchParams.get("tab")    returns "people"
  // searchParams.get("sort")   returns null (not in the URL)
  //
  // setSearchParams({ q: "dogs" })  =>  URL becomes /search?q=dogs  (tab is gone!)
  // setSearchParams({})             =>  URL becomes /search
  //
  // /search?q=cats	      get("q")= "cats"   	        ?.trim()="cats"	      searchQuery= "cats"
  // /search?q=%20cats%20	get("q")= " cats "   	      ?.trim()="cats"	      searchQuery= "cats"
  // /search?q=	          get("q")= ""            	  ?.trim()=""	          searchQuery= ""
  // /search	            get("q")= null	            ?.trim()=undefined	  searchQuery= ""
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() || "";
  const searchType: SearchType =
    searchParams.get("type") === "users" ? "users" : "posts";
  const isSearchTypePost = searchType === "posts";

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>(searchQuery);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  // inputValue after the user stops typing; drives the live user matches in the panel
  const [debouncedInput, setDebouncedInput] = useState<string>("");
  const typedTerm = inputValue.trim();

  const [createRecentSearch] = useCreateRecentSearchMutation();

  const recentSearchesQuery = useGetSearchesForUserInfiniteQuery();
  const {
    isLoading: isRecentSearchesLoading,
    isError: isRecentSearchesError,
    refetch: refetchRecentSearches,
  } = recentSearchesQuery;

  const {
    items: recentSearches,
    loadMore: loadMoreRecentSearches,
    hasNextPage: hasMoreRecentSearches,
    isFetchingNextPage: isFetchingMoreRecentSearches,
  } = usePagedList(recentSearchesQuery);

  const [deleteSearch] = useDeleteSearchForUserMutation();
  const [deleteAllSearches, { isLoading: isDeletingAllSearches }] =
    useDeleteAllSearchesForUserMutation();

  // setSearchParams replaces every param, so q and type are always written together
  const writeSearchParams = useCallback(
    (query: string, type: SearchType) => {
      const params: Record<string, string> = {};
      if (query) params.q = query;
      if (type === "users") params.type = type;
      // replace: true so every search doesn't add a history entry
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  // Debounce the typed text for the live user matches
  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedInput(typedTerm),
      USER_SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [typedTerm]);

  function closePanel() {
    setIsPanelOpen(false);
    inputRef.current?.blur();
  }

  // Commits a search: saves it to recents, closes the panel and shows the tabs.
  // An empty term goes back to the explore grid.
  function commitSearch(term: string) {
    // Fire and forget, so a failed save never blocks the search
    if (term) createRecentSearch({ searchTerm: term });
    setInputValue(term);
    closePanel();
    writeSearchParams(term, searchType);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commitSearch(typedTerm);
  }

  // Back arrow / Escape: leave the panel and put the committed query back in the box
  function handleCancelPanel() {
    setInputValue(searchQuery);
    closePanel();
  }

  // Clearing keeps the panel open on the recent searches, ready for a new term
  function handleClearInput() {
    setInputValue("");
    inputRef.current?.focus();
  }

  function handleTabChange(type: SearchType) {
    if (type === searchType) return;
    writeSearchParams(searchQuery, type);
  }

  return (
    // Page Container
    <div className="min-h-svh bg-background pb-8">
      {/* Header: sticky search bar (and tabs once a search is committed) */}
      <div className="sticky top-0 z-10 bg-background/85 px-4 pt-3 backdrop-blur-md">
        <div className="mx-auto max-w-2xl  w-[75%]">
          <div className="flex items-center gap-1">
            {/* Back Button: only while the panel is open */}
            {isPanelOpen && (
              <button
                type="button"
                aria-label="Back"
                className="-ml-1 shrink-0 cursor-pointer rounded-full text-foreground hover:opacity-60"
                // preventDefault keeps the input from blurring before the click lands
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleCancelPanel}
              >
                <ChevronLeft className="size-7" />
              </button>
            )}

            {/* Search Form: Enter commits the search */}
            <form
              role="search"
              className="relative w-full"
              onSubmit={handleSearchSubmit}
            >
              {/* Search Icon */}
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

              {/* Search Input */}
              <Input
                ref={inputRef}
                type="search"
                aria-label="Search"
                className="rounded-full pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
                placeholder="Search"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onFocus={() => setIsPanelOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") handleCancelPanel();
                }}
              />

              {/* Clear Button: only shown while there's text */}
              {inputValue && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full text-muted-foreground hover:text-foreground"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleClearInput}
                >
                  <X className="size-4" />
                </button>
              )}
            </form>
          </div>

          {/* Tabs: only once a search is committed; the active one is underlined */}
          {!isPanelOpen && searchQuery && (
            <div className="mt-2 flex border-b border-border">
              {/* Posts Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("posts")}
                className={`-mb-px flex-1 cursor-pointer border-b py-3 text-center text-sm font-semibold transition-colors ${
                  isSearchTypePost
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Posts
              </button>

              {/* Users Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("users")}
                className={`-mb-px flex-1 cursor-pointer border-b py-3 text-center text-sm font-semibold transition-colors ${
                  !isSearchTypePost
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Users
              </button>
            </div>
          )}
        </div>
      </div>

      {isPanelOpen ? (
        // Panel: recent searches while the box is empty, live user matches while typing
        <div className="mx-auto mt-3 box-content max-w-2xl px-4  w-[75%]">
          {typedTerm ? (
            <>
              {/* Search Row: commits the typed term (same as pressing Enter) */}
              <button
                type="button"
                className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-accent"
                onClick={() => commitSearch(typedTerm)}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted group-hover:bg-foreground/10">
                  <Search className="size-4.5" />
                </div>
                <span className="min-w-0 truncate text-sm">
                  Search for{" "}
                  <span className="font-semibold">"{typedTerm}"</span>
                </span>
              </button>

              {/* Live User Matches */}
              <UserSearchResults query={debouncedInput} />
            </>
          ) : (
            <>
              {/* Title and Clear All */}
              <div className="mb-2 flex items-center justify-between px-2 font-semibold">
                <h2>Recent</h2>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    className="cursor-pointer text-sm text-sky-500 hover:text-sky-600 disabled:opacity-60"
                    onClick={() => deleteAllSearches()}
                    disabled={isDeletingAllSearches}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Loading State: placeholder rows while the first page loads */}
              {isRecentSearchesLoading &&
                Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={`loading-${index}`}
                    className="flex items-center gap-3 px-2 py-2"
                  >
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}

              {/* Error State: message with a retry button */}
              {isRecentSearchesError && (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Couldn't load recent searches
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => refetchRecentSearches()}
                  >
                    <RotateCcw className="size-4" /> Try Again
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isRecentSearchesLoading &&
                !isRecentSearchesError &&
                recentSearches.length === 0 && (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No recent searches.
                  </p>
                )}

              {/* Recent Searches: clicking a term runs it again */}
              {recentSearches.map((term) => (
                <div
                  key={term.id}
                  className="group flex items-center gap-2 rounded-lg pr-2 hover:bg-accent"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-2 py-2 text-left"
                    onClick={() => commitSearch(term.searchTerm)}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted group-hover:bg-foreground/10">
                      <Search className="size-4.5" />
                    </div>
                    <span className="truncate text-sm">{term.searchTerm}</span>
                  </button>
                  {/* Remove Button */}
                  <button
                    type="button"
                    aria-label={`Remove ${term.searchTerm}`}
                    className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => deleteSearch(term.id)}
                  >
                    <X className="size-5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}

              {/* More: loads the next page of recent searches; hidden once there are no more pages */}
              {hasMoreRecentSearches && (
                <button
                  type="button"
                  className="mx-auto mt-2 flex cursor-pointer items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
                  onClick={loadMoreRecentSearches}
                  disabled={isFetchingMoreRecentSearches}
                >
                  <span>
                    {isFetchingMoreRecentSearches ? "Loading..." : "More"}
                  </span>
                  {!isFetchingMoreRecentSearches && (
                    <ChevronDown className="size-4" />
                  )}
                </button>
              )}
            </>
          )}
        </div>
      ) : isSearchTypePost || !searchQuery ? (
        // Explore grid (no query) or the Posts tab's results
        <div className="mx-auto mt-5 w-[60%]">
          <PostSearchResults query={searchQuery} />
        </div>
      ) : (
        // Users tab's results
        <div className="mx-auto mt-2 box-content max-w-2xl px-4  w-[75%]">
          <UserSearchResults query={searchQuery} />
        </div>
      )}
    </div>
  );
}

export default SearchPage;
