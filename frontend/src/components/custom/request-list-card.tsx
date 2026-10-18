import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface RequestListCardProps {
  title: string;
  // The request rows (UserRows with a bottom border)
  children: ReactNode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

// Card shell shared by the incoming and outgoing follow request lists: a title,
// the rows, and a "Show more" button for the next page
function RequestListCard({
  title,
  children,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: RequestListCardProps) {
  return (
    <div className="mx-auto mb-4 w-full max-w-lg">
      <Card className="w-full gap-4 rounded-xl border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
          {hasNextPage && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full text-sm font-semibold text-sky-500 hover:text-sky-600"
              disabled={isFetchingNextPage}
              onClick={onLoadMore}
            >
              {isFetchingNextPage ? "Loading..." : "Show more"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default RequestListCard;
