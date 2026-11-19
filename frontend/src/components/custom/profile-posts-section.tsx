import { Lock } from "lucide-react";
import ProfilePagePostCard from "@/Pages/PostPages/ProfilePagePostCard";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import LoadingPostTiles from "@/components/custom/loading-post-tiles";
import type { GetPostResponse } from "@/types/response-types";

const GRID = "grid grid-cols-3 gap-0.5 sm:gap-1";

interface ProfilePostsSectionProps {
  posts: GetPostResponse[];
  isLoading: boolean;
  isPrivate: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  pagination: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    loadMore: () => void;
  };
}

// Content under the profile tabs. Order matters: the first state that applies wins.
function ProfilePostsSection({
  posts,
  isLoading,
  isPrivate,
  isEmpty,
  emptyMessage,
  pagination,
}: ProfilePostsSectionProps) {
  // Loading: placeholder tiles
  if (isLoading) {
    return (
      <div className={GRID}>
        <LoadingPostTiles />
      </div>
    );
  }

  // Private account you don't follow
  if (isPrivate) {
    return <PrivateAccountNotice />;
  }

  // Liked / Saved tab with nothing in it
  if (isEmpty) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Loaded: posts grid + infinite scroll
  return (
    <>
      <div className={GRID}>
        {posts.map((post) => (
          <div key={post.id} className="group relative aspect-square">
            <ProfilePagePostCard post={post} />
          </div>
        ))}
      </div>

      <LoadMoreTrigger
        hasNextPage={pagination.hasNextPage}
        isFetchingNextPage={pagination.isFetchingNextPage}
        onLoadMore={pagination.loadMore}
      />
    </>
  );
}

// Shown in place of the grid until you follow a private account
function PrivateAccountNotice() {
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

export default ProfilePostsSection;
