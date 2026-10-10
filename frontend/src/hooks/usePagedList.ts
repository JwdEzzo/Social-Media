import { useCallback, useMemo } from "react";
import type { InfiniteData } from "@reduxjs/toolkit/query";
import type { PagedModel } from "@/types/api-response";

// The parts of an RTK infinite query result that pagination needs
interface PagedQueryResult<T> {
  data?: InfiniteData<PagedModel<T>, number>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}

// Turns an infinite query result into what a list renders:
// - items: every loaded page flattened into one array, memoized so its identity only
//   changes when a page is added or refetched
// - loadMore: fetches the next page; the guards stop duplicate requests when it's
//   called repeatedly (Virtuoso's endReached, an IntersectionObserver, ...)
// - totalElements: the server-side total, not just what's loaded
export function usePagedList<T>({
  data,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: PagedQueryResult<T>) {
  const items = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    items,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    totalElements: data?.pages[0]?.page.totalElements ?? 0,
  };
}
