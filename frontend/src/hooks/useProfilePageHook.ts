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

  const [viewMode, setViewMode] = useState<"posts" | "liked" | "saved">(
    "posts",
  );
  const [showCreatePostModal, setShowCreatePostModal] =
    useState<boolean>(false);

  const profileUsername = isOwnProfile ? loggedInUsername : routeUsername;

  // --- API QUERIES ---
  const {
    data: profileUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetUserByUsernameQuery(profileUsername!, { skip: !profileUsername });

  const isPrivateAccount = profileUser?.accountStatus === "PRIVATE";
  const isOtherPrivateProfile = !isOwnProfile && isPrivateAccount;

  const { data: isFollowed, isLoading: isFollowStatusLoading } =
    useIsFollowedQuery(profileUsername!, {
      skip: !profileUsername || !isOtherPrivateProfile,
    });

  const useStandardPostsByUsername =
    !!profileUsername &&
    (isOwnProfile ||
      (!!profileUser && profileUser.accountStatus !== "PRIVATE"));
  const usePrivateFollowerPosts =
    !!profileUsername && isOtherPrivateProfile && isFollowed === true;

  // Infinite queries: each tab loads 10 posts at a time, newest first (sorted by the server)
  const postsByUsernameQuery = useGetPostsByUsernameInfiniteQuery(
    profileUsername!,
    { skip: !profileUsername || !useStandardPostsByUsername },
  );
  const {
    isLoading: isPostsByUsernameLoading,
    isError: isPostsByUsernameError,
  } = postsByUsernameQuery;
  const postsByUsername = usePagedList(postsByUsernameQuery);

  const postsAsPrivateFollowerQuery =
    useGetPrivateAccountPostsUserFollowsInfiniteQuery(
      { privateAccountUsername: profileUsername! },
      { skip: !profileUsername || !usePrivateFollowerPosts },
    );
  const {
    isLoading: isPostsPrivateFollowerLoading,
    isError: isPostsPrivateFollowerError,
  } = postsAsPrivateFollowerQuery;
  const postsAsPrivateFollower = usePagedList(postsAsPrivateFollowerQuery);

  // --- DERIVED DATA ---
  const posts = usePrivateFollowerPosts
    ? postsAsPrivateFollower
    : postsByUsername;
  const isPostsLoading =
    (useStandardPostsByUsername && isPostsByUsernameLoading) ||
    (usePrivateFollowerPosts && isPostsPrivateFollowerLoading);
  const isPostsError =
    (useStandardPostsByUsername && isPostsByUsernameError) ||
    (usePrivateFollowerPosts && isPostsPrivateFollowerError);

  const { data: followerCount } = useGetFollowerCountQuery(profileUsername!, {
    skip: !profileUsername,
  });
  const { data: followingCount } = useGetFollowingCountQuery(profileUsername!, {
    skip: !profileUsername,
  });
  const { data: postCount } = useGetPostsCountQuery(profileUsername!, {
    skip: !profileUsername,
  });
  const likedPosts = usePagedList(useGetPostsLikedByCurrentUserInfiniteQuery());
  const savedPosts = usePagedList(useGetPostsSavedByCurrentUserInfiniteQuery());

  // Pagination for whichever tab is showing, so the page has a single "load more" to wire up
  const activeList =
    viewMode === "liked"
      ? likedPosts
      : viewMode === "saved"
        ? savedPosts
        : posts;

  const [toggleAccountStatus] = useToggleAccountStatusMutation();

  // --- HANDLERS ---
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
