import { useCreateRecentSearchMutation } from "@/api/search/searchApi";
import { Input } from "@/components/ui/input";
import PostSearchResults from "@/Pages/SearchPages/PostSearchResults";
import UserSearchResults from "@/Pages/SearchPages/UserSearchResults";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

const USER_SEARCH_DEBOUNCE_MS = 500;
type SearchType = "posts" | "users";

// The search page owns the search bar, the Posts/Users tabs and the URL
// (?q=...&type=users). Each tab's results component only renders what it's given.
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
  // Posts is the default, so it's left out of the URL
  const searchType: SearchType =
    searchParams.get("type") === "users" ? "users" : "posts";
  const isSearchTypePost = searchType === "posts";

  const [inputValue, setInputValue] = useState<string>(searchQuery);

  const [createRecentSearch] = useCreateRecentSearchMutation();

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

  useEffect(() => {
    if (isSearchTypePost) return;

    const timeout = setTimeout(() => {
      const nextQuery = inputValue.trim();
      if (nextQuery === searchQuery) return;
      writeSearchParams(nextQuery, searchType);
    }, USER_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [
    inputValue,
    searchQuery,
    searchType,
    isSearchTypePost,
    writeSearchParams,
  ]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = inputValue.trim();

    // Only Enter saves to recent searches, never the debounced search-as-you-type.
    // Saved before the early return: on the Users tab the debounce may already have
    // run this query. Fire and forget, so a failed save never blocks the search.
    if (nextQuery) createRecentSearch({ searchTerm: nextQuery });

    if (nextQuery === searchQuery) return;
    writeSearchParams(nextQuery, searchType);
  }

  function handleClearSearch() {
    setInputValue("");
    writeSearchParams("", searchType);
  }

  function handleTabChange(type: SearchType) {
    if (type === searchType) return;
    writeSearchParams(searchQuery, type);
  }

  return (
    // Page Container
    <div className="min-h-svh bg-background pb-8">
      {/* Header: sticky search bar and tabs, both the width of the search bar */}
      <div className="sticky top-0 z-10 bg-background/85 px-4 pt-3 backdrop-blur-md">
        <div className="mx-auto max-w-md">
          {/* Search Form: Enter submits the search */}
          <form
            role="search"
            className="relative"
            onSubmit={handleSearchSubmit}
          >
            {/* Search Icon */}
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

            {/* Search Input */}
            <Input
              type="search"
              aria-label={isSearchTypePost ? "Search posts" : "Search users"}
              className="rounded-full pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
              placeholder={isSearchTypePost ? "Search posts" : "Search users"}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />

            {/* Clear Search Button: only shown while there's text */}
            {inputValue && (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
                onClick={handleClearSearch}
              >
                <X className="size-4" />
              </button>
            )}
          </form>

          {/* Tabs: switch between Posts and Users search; the active one is underlined */}
          <div className="mt-2 flex border-b border-border">
            {/* Posts Tab */}
            <div
              onClick={() => handleTabChange("posts")}
              className={`-mb-px flex-1 cursor-pointer border-b py-3 text-center text-sm font-semibold transition-colors ${
                isSearchTypePost
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Posts
            </div>

            {/* Users Tab */}
            <div
              onClick={() => handleTabChange("users")}
              className={`-mb-px flex-1 cursor-pointer border-b py-3 text-center text-sm font-semibold transition-colors ${
                !isSearchTypePost
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Users
            </div>
          </div>
        </div>
      </div>

      {/* Results: the active tab's results for the current query */}
      {isSearchTypePost ? (
        <div className="mx-auto mt-5 w-[60%]">
          <PostSearchResults query={searchQuery} />
        </div>
      ) : (
        <div className="mx-auto mt-2 box-content max-w-md px-4">
          <UserSearchResults query={searchQuery} />
        </div>
      )}
    </div>
  );
}

export default SearchPage;
