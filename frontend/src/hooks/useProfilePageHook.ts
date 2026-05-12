// useProfileLogic.ts
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/auth/useAuth';
import { logout } from '@/auth/authSlice';
import { closePostModal, openPostModal } from '@/slices/viewPostSlice';
import type { RootState } from '@/store/store';
import { useGetFollowerCountQuery, useGetFollowingCountQuery, useIsFollowedQuery } from '@/api/followers/followApi';
import {
  postApi,
  useGetPostsByUsernameQuery,
  useGetPrivateAccountPostsUserFollowsQuery,
  useGetPostsCountQuery,
  useGetPostsLikedByCurrentUserQuery,
  useGetPostsSavedByCurrentUserQuery,
} from '@/api/posts/postApi';
import { useGetUserByUsernameQuery, useToggleAccountStatusMutation } from '@/api/users/userApi';
import { useTogglePostLikeMutation } from '@/api/posts/postLikesApi';
import { useTogglePostSaveMutation } from '@/api/posts/postSavesApi';
import type { GetPostResponseDto } from '@/types/responseTypes';

// In both ProfilePage and HomePage, we have the ViewPost.tsx as a child component.
// We call the state from Redux store in both components
// We then pass them as props to the ViewPost component

export const useProfileLogic = (isOwnProfile: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { username: loggedInUsername } = useAuth();
  const { searchedUsername } = useParams<{ searchedUsername: string }>();

  const [viewMode, setViewMode] = useState<'posts' | 'liked' | 'saved'>('posts');
  const [showCreatePostModal, setShowCreatePostModal] = useState<boolean>(false);

  const { isOpen: isViewModalOpen, selectedPostId } = useSelector((state: RootState) => state.viewPostModal);
  const profileUsername = isOwnProfile ? loggedInUsername : searchedUsername;

  // --- API QUERIES ---
  const {
    data: profileUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetUserByUsernameQuery(profileUsername!, { skip: !profileUsername });

  const { data: loggedInUserData } = useGetUserByUsernameQuery(loggedInUsername!, { skip: !loggedInUsername });

  const isPrivateAccount = profileUser?.accountStatus === 'PRIVATE';
  const isOtherPrivateProfile = !isOwnProfile && isPrivateAccount;

  const { data: isFollowed, isLoading: isFollowStatusLoading } = useIsFollowedQuery(profileUsername!, {
    skip: !profileUsername || !isOtherPrivateProfile,
  });

  const useStandardPostsByUsername =
    !!profileUsername && (isOwnProfile || (!!profileUser && profileUser.accountStatus !== 'PRIVATE'));
  const usePrivateFollowerPosts = !!profileUsername && isOtherPrivateProfile && isFollowed === true;

  const {
    data: postsByUsername,
    isLoading: isPostsByUsernameLoading,
    isError: isPostsByUsernameError,
  } = useGetPostsByUsernameQuery(profileUsername!, { skip: !profileUsername || !useStandardPostsByUsername });

  const {
    data: postsAsPrivateFollower,
    isLoading: isPostsPrivateFollowerLoading,
    isError: isPostsPrivateFollowerError,
  } = useGetPrivateAccountPostsUserFollowsQuery(
    { privateAccountUsername: profileUsername! },
    { skip: !profileUsername || !usePrivateFollowerPosts },
  );

  // --- DERIVED DATA ---
  const posts = usePrivateFollowerPosts ? postsAsPrivateFollower : postsByUsername;
  const isPostsLoading =
    (useStandardPostsByUsername && isPostsByUsernameLoading) ||
    (usePrivateFollowerPosts && isPostsPrivateFollowerLoading);
  const isPostsError =
    (useStandardPostsByUsername && isPostsByUsernameError) || (usePrivateFollowerPosts && isPostsPrivateFollowerError);

  const { data: followerCount } = useGetFollowerCountQuery(profileUsername!, { skip: !profileUsername });
  const { data: followingCount } = useGetFollowingCountQuery(profileUsername!, { skip: !profileUsername });
  const { data: postCount } = useGetPostsCountQuery(profileUsername!, { skip: !profileUsername });
  const { data: likedPosts } = useGetPostsLikedByCurrentUserQuery();
  const { data: savedPosts } = useGetPostsSavedByCurrentUserQuery();

  const [togglePostLike, { isLoading: isTogglingPostLike }] = useTogglePostLikeMutation();
  const [toggleSave, { isLoading: isTogglingSavePost }] = useTogglePostSaveMutation();
  const [toggleAccountStatus] = useToggleAccountStatusMutation();

  const sortPosts = (data: GetPostResponseDto[] | undefined) =>
    data ? [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];

  // --- HANDLERS ---
  const handleTogglePostLike = async (postId: number) => {
    if (!isOwnProfile) return;
    try {
      await togglePostLike(postId).unwrap();
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: 'LIST' }]));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSavePost = async (postId: number) => {
    if (!isOwnProfile) return;
    try {
      await toggleSave(postId).unwrap();
      dispatch(postApi.util.invalidateTags([{ type: 'Post', id: 'LIST' }]));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  const handleCloseViewModal = () => dispatch(closePostModal());

  useEffect(() => {
    if (location.state?.fromModal && location.state?.previousPostId) {
      const handlePopState = () => dispatch(openPostModal(location.state.previousPostId));
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [location.state, dispatch]);

  return {
    state: {
      profileUser,
      loggedInUserData,
      viewMode,
      showCreatePostModal,
      isViewModalOpen,
      selectedPostId,
      isUserLoading,
      isUserError,
      isPostsLoading,
      isPostsError,
      isOtherPrivateProfile,
      isFollowStatusLoading,
      isFollowed,
      sortedPosts: sortPosts(posts),
      sortedLikedPosts: sortPosts(likedPosts),
      sortedSavedPosts: sortPosts(savedPosts),
      stats: { followerCount, followingCount, postCount },
      isTogglingPostLike,
      isTogglingSavePost,
      loggedInUsername,
    },
    actions: {
      dispatch,
      setViewMode,
      setShowCreatePostModal,
      handleTogglePostLike,
      handleToggleSavePost,
      handleLogout,
      handleCloseViewModal,
      toggleAccountStatus,
      navigate,
      navigateToFollowers: () =>
        navigate(`/userprofile/${profileUsername}/${isOwnProfile ? 'yourfollowers' : 'userfollowers'}`),
      navigateToFollowing: () =>
        navigate(`/userprofile/${profileUsername}/${isOwnProfile ? 'yourfollowings' : 'userfollowings'}`),
      navigateToEditProfile: () => isOwnProfile && navigate(`/userprofile/${profileUser?.username}/edit-profile`),
    },
  };
};
