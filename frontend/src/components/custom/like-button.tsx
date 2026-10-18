import { cn } from "@/utils/errors";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  isLiked: boolean | undefined;
  likeCount: number | undefined;
  isToggling: boolean;
  onToggle: () => void;
}

// Small heart + count used under comments and replies
function LikeButton({
  isLiked,
  likeCount,
  isToggling,
  onToggle,
}: LikeButtonProps) {
  return (
    <>
      <Heart
        className={cn(
          "size-3.5 cursor-pointer text-muted-foreground transition-[opacity,transform] hover:opacity-60 active:scale-90",
          isLiked && "fill-current text-red-500 dark:text-red-500",
          isToggling && "cursor-not-allowed opacity-50",
        )}
        onClick={onToggle}
      />
      <span className="pr-3 pl-1 text-xs font-medium text-muted-foreground">
        {likeCount}
      </span>
    </>
  );
}

export default LikeButton;
