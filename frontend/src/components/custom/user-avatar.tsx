import { useState, type ComponentProps } from "react";
import defaultAvatar from "@/assets/default-avatar.svg";

type UserAvatarProps = Omit<ComponentProps<"img">, "src"> & {
  src?: string | null;
};

// Drop-in <img> for profile pictures: users without an upload (null url), or
// whose picture fails to load, get the default silhouette instead
function UserAvatar({ src, alt = "", ...props }: UserAvatarProps) {
  // Remember which url failed, so a new src gets a fresh attempt
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const resolvedSrc = src && src !== failedSrc ? src : defaultAvatar;

  return (
    <img
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={() => {
        if (src) setFailedSrc(src);
      }}
    />
  );
}

export default UserAvatar;
