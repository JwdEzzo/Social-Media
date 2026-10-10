import type { InfiniteData } from "@reduxjs/toolkit/query";
import type { PagedModel } from "@/types/api-response";

// Shared by every paginated endpoint (Spring's PagedModel<T>)

export const PAGE_SIZE = 10;

// Infinite query options: start at Spring's page 0, stop after the last page.
// Returning undefined from getNextPageParam makes hasNextPage false.
export const pagedInfiniteQueryOptions = {
  initialPageParam: 0,
  getNextPageParam: (lastPage: PagedModel<unknown>) =>
    lastPage.page.number + 1 < lastPage.page.totalPages
      ? lastPage.page.number + 1
      : undefined,
};

// Query string for one page: ?page=N&size=10&sort=createdAt,desc
export const pageParams = (pageParam: number, sort: string) => ({
  page: pageParam,
  size: PAGE_SIZE,
  sort,
});

// One tag per item across every loaded page ({ type: 'Post', id: 25 }, ...),
// followed by the collection-level tags (LIST, per-user ids, ...).
export const providePagedTags = <TagType extends string>(
  result: InfiniteData<PagedModel<{ id: number }>, number> | undefined,
  itemType: TagType,
  collectionTags: { type: TagType; id: string | number }[],
) => [
  ...(result?.pages.flatMap((page) =>
    page.content.map(({ id }) => ({ type: itemType, id })),
  ) ?? []),
  ...collectionTags,
];
