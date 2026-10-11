interface LoadingPostTilesProps {
  count?: number;
}

// Square placeholder tiles with a spinner, shown while a post grid's first page loads.
// Renders only the tiles, so place it inside the grid container (grid-cols-3 etc.)
function LoadingPostTiles({ count = 9 }: LoadingPostTilesProps) {
  return Array.from({ length: count }, (_, index) => (
    <div
      key={`loading-${index}`}
      className="relative flex aspect-square items-center justify-center bg-muted"
    >
      <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
    </div>
  ));
}

export default LoadingPostTiles;
