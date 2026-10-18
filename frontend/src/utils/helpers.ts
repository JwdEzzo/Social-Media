export const formatTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs)) return "";
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    console.log("Error formatting date: ", e);
    return "";
  }
};

// The calendar date of an ISO timestamp from the API, e.g. "2026-10-18T13:03:02Z" -> "2026-10-18".
// Shown under posts, comments and replies.
export const formatDate = (dateString: string) => dateString.substring(0, 10);
