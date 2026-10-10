import { useEffect, useRef } from "react";

interface LoadMoreTriggerProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

// Infinite scroll for plain (non-Virtuoso) lists: place it after the last item.
// It renders an invisible sentinel and calls onLoadMore when it scrolls into view.
// Also works inside scroll containers (e.g. the comments in ViewPost), since the
// observer clips the sentinel by its overflow ancestors.
function LoadMoreTrigger({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: LoadMoreTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Re-runs after every fetch, so if the new page still doesn't fill the screen
  // the sentinel is visible again and the next page loads straight away
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isFetchingNextPage) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!hasNextPage) return null;

  return <div ref={sentinelRef} className="h-px" />;
}

export default LoadMoreTrigger;
