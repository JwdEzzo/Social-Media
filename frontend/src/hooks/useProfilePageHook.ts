// useProfileLogic.ts
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { openPostModal } from "@/slices/viewPostSlice";
import {
  useGetFollowerCountQuery,
  useGetFollowingCountQuery,
  useIsFollowedQuery,
} from "@/api/followers/followApi";
import {
  useGetPostsByUsernameInfiniteQuery,
  useGetPostsCountQuery,
  useGetPostsLikedByCurrentUserInfiniteQuery,
  useGetPostsSavedByCurrentUserInfiniteQuery,
  useGetPrivateAccountPostsUserFollowsInfiniteQuery,
} from "@/api/posts/postApi";
import {
  useGetUserByUsernameQuery,
  useToggleAccountStatusMutation,
} from "@/api/users/userApi";
import { usePagedList } from "@/hooks/usePagedList";
import { useCurrentUser } from "./useCurrentUser";
import { useLogout } from "./useLogout";

export const useProfileLogic = (isOwnProfile: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const handleLogout = useLogout();
  const { loggedInUsername } = useCurrentUser();
  const { username: routeUsername } = useParams<{ username: string }>();

  const [selectedViewMode, setViewMode] = useState<
    "posts" | "liked" | "saved"
  >("posts");

  // Liked and Saved are the logged-in user's own lists (/liked-by-me, /saved-by-me),
  // so they only exist on your own profile. Forcing "posts" elsewhere means a
  // leftover selection can never show your lists under someone else's name.
  const viewMode = isOwnProfile ? selectedViewMode : "posts";
  const [showCreatePostModal, setShowCreatePostModal] =
    useState<boolean>(false);

  const profileUsername = isOwnProfile ? loggedInUsername : routeUsername;

  // ================ API QUERIES ==================
  // currentData, not data: going from /users/a to /users/b, data still holds A until
  // B arrives (and isLoading stays false after the first fetch), so A would flash
  // under B's URL. currentData only holds the current username's result.
  const {
    currentData: profileUser,
    isFetching: isUserFetching,
    isError: isUserError,
    error: userError,
  } = useGetUserByUsernameQuery(profileUsername!, { skip: !profileUsername });

  // A background refetch of the same profile keeps currentData, so it doesn't count
  const isUserLoading = isUserFetching && !profileUser;

  // prettier-ignore
  // SerializedError has no status, so check for the key first
  const isUserNotFound =
    !!userError 
    && "status" in userError
    && userError.status === 404;

  const isPrivateAccount = profileUser?.accountStatus === "PRIVATE";
  const isOtherPrivateProfile = !isOwnProfile && isPrivateAccount;

  // currentData for the same reason: a stale "true" from the last private profile
  // would request this one's follower-only posts and get a 403.
  // Skipped when logged out (/users/:username is public): nobody to follow with,
  // so isFollowed stays undefined and the private profile's posts stay hidden.
  const { currentData: isFollowed, isFetching: isFollowStatusFetching } =
    useIsFollowedQuery(profileUsername!, {
      skip: !profileUsername || !isOtherPrivateProfile || !loggedInUsername,
    });
  const isFollowStatusLoading =
    isFollowStatusFetching && isFollowed === undefined;

  const useStandardPostsByUsername =
    !!profileUsername &&
    (isOwnProfile ||
      (!!profileUser && profileUser.accountStatus !== "PRIVATE"));
  const usePrivateFollowerPosts =
    !!profileUsername && isOtherPrivateProfile && isFollowed === true;

  // ===================== Infinite queries =========================
  // Each tab loads 10 posts at a time, newest first (sorted by the server)
  const postsByUsernameQuery = useGetPostsByUsernameInfiniteQuery(
    profileUsername!,
    { skip: !profileUsername || !useStandardPostsByUsername },
  );

  const { isError: isPostsByUsernameError } = postsByUsernameQuery;

  const postsByUsername = usePagedList(postsByUsernameQuery);

  const postsAsPrivateFollowerQuery =
    useGetPrivateAccountPostsUserFollowsInfiniteQuery(
      { privateAccountUsername: profileUsername! },
      { skip: !profileUsername || !usePrivateFollowerPosts },
    );

  const { isError: isPostsPrivateFollowerError } = postsAsPrivateFollowerQuery;

  const postsAsPrivateFollower = usePagedList(postsAsPrivateFollowerQuery);

  // ================== DERIVED DATA ====================
  const posts = usePrivateFollowerPosts
    ? postsAsPrivateFollower
    : postsByUsername;

  // isLoadingFirstPage is also true when the username changes, unlike isLoading
  const isPostsLoading =
    (useStandardPostsByUsername && postsByUsername.isLoadingFirstPage) ||
    (usePrivateFollowerPosts && postsAsPrivateFollower.isLoadingFirstPage);

  const isPostsError =
    (useStandardPostsByUsername && isPostsByUsernameError) ||
    (usePrivateFollowerPosts && isPostsPrivateFollowerError);

  const { currentData: followerCount } = useGetFollowerCountQuery(profileUsername!, {
    skip: !profileUsername,
  });
  const { currentData: followingCount } = useGetFollowingCountQuery(profileUsername!, {
    skip: !profileUsername,
  });
  const { currentData: postCount } = useGetPostsCountQuery(profileUsername!, {
    skip: !profileUsername,
  });
  // Own profile only: on someone else's profile these would be the wrong lists,
  // and a logged-out visitor's request would be a 401
  const likedPosts = usePagedList(
    useGetPostsLikedByCurrentUserInfiniteQuery(undefined, {
      skip: !isOwnProfile,
    }),
  );
  const savedPosts = usePagedList(
    useGetPostsSavedByCurrentUserInfiniteQuery(undefined, {
      skip: !isOwnProfile,
    }),
  );

  // Pagination for whichever tab is showing, so the page has a single "load more" to wire up
  const activeList =
    viewMode === "liked"
      ? likedPosts
      : viewMode === "saved"
        ? savedPosts
        : posts;

  const [toggleAccountStatus] = useToggleAccountStatusMutation();

  // ======================= HANDLERS ========================
  // Like / save live in usePostActions, called by ViewPostModal itself
  useEffect(() => {
    if (location.state?.fromModal && location.state?.previousPostId) {
      const handlePopState = () =>
        dispatch(openPostModal(location.state.previousPostId));
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [location.state, dispatch]);

  return {
    state: {
      profileUser,
      viewMode,
      showCreatePostModal,
      isUserLoading,
      isUserError,
      isPostsLoading,
      isPostsError,
      isOtherPrivateProfile,
      isFollowStatusLoading,
      isFollowed,
      isUserNotFound,
      // Already sorted newest first by the server; re-sorting on the client would
      // reshuffle posts across page boundaries as more pages load
      sortedPosts: posts.items,
      sortedLikedPosts: likedPosts.items,
      sortedSavedPosts: savedPosts.items,
      pagination: {
        hasNextPage: activeList.hasNextPage,
        isFetchingNextPage: activeList.isFetchingNextPage,
        loadMore: activeList.loadMore,
      },
      stats: { followerCount, followingCount, postCount },
      loggedInUsername,
    },
    actions: {
      dispatch,
      setViewMode,
      setShowCreatePostModal,
      handleLogout,
      toggleAccountStatus,
      navigate,
      navigateToFollowers: () =>
        navigate(
          isOwnProfile
            ? "/me/followers"
            : `/users/${profileUsername}/followers`,
        ),
      navigateToFollowing: () =>
        navigate(
          isOwnProfile
            ? "/me/following"
            : `/users/${profileUsername}/following`,
        ),
      navigateToEditProfile: () => isOwnProfile && navigate("/me/edit-profile"),
    },
  };
};
