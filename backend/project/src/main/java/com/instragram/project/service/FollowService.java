package com.instragram.project.service;

import com.instragram.project.dto.follow.response.FollowRequestResponse;
import com.instragram.project.enums.AccountStatus;
import com.instragram.project.enums.FollowRequestStatus;
import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.AlreadyExistsException;
import com.instragram.project.exception.BadRequestException;
import com.instragram.project.exception.ForbiddenException;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.FollowRequest;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.FollowRepository;
import com.instragram.project.repository.FollowRequestRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FollowService {

	private final FollowRepository followRepository;
	private final AppUserRepository appUserRepository;
	private final FollowRequestRepository followRequestRepository;
	private final MappingMethods mappingMethods;
	private final NotificationService notificationService;

	// Toggle follow
	@Transactional
	public void toggleFollow(String followerUsername, String followingUsername) {
		AppUser follower = getUserOrThrow(followerUsername);
		AppUser following = getUserOrThrow(followingUsername);

		if (followerUsername.equals(followingUsername)) {
			throw new BadRequestException("You cannot follow yourself.");
		}

		// Step 1: Try to unfollow. A deleted row means they were following, so we're
		// done.
		// No exists-check first: two concurrent requests could both pass it.
		if (followRepository.deleteByFollowerAndFollowing(follower, following) > 0) {
			log.info("{} unfollowed {}", followerUsername, followingUsername);

			// Delete the notification that was created when the follow was added
			notificationService.deleteFollowNotification(following.getId(), // recipient — the user who was followed
					follower.getId(), // sender — the user who unfollowed
					NotificationType.FOLLOW);

			return;
		}

		// Step 2: Public account, so follow directly. 0 rows inserted means a
		// concurrent request
		// followed first, and only the request that actually inserted sends the
		// notification.
		if (following.getAccountStatus() == AccountStatus.PUBLIC) {
			if (followRepository.insertIfAbsent(follower.getId(), following.getId()) == 0) {
				return;
			}
			log.info("{} followed {}", followerUsername, followingUsername);

			// Notify the followed user
			notificationService.createNotification(following, // recipient — the person being followed
					follower, // sender — the person following
					NotificationType.FOLLOW, null // no entityId — not tied to a post/comment
			);

		} else {
			// Step 3: Private account, so send a request. The partial unique index allows
			// only one
			// PENDING request per pair, so 0 rows inserted means one is already pending.
			if (followRequestRepository.insertPendingIfAbsent(follower.getId(), following.getId()) == 0) {
				throw new AlreadyExistsException(
						"You have already sent a follow request to '" + followingUsername + "'.");
			}
			log.info("{} sent a follow request to {}", followerUsername, followingUsername);

			// Notify the private account owner of the incoming request
			notificationService.createNotification(following, // recipient — the private account owner
					follower, // sender — the person requesting
					NotificationType.FOLLOW_REQUEST_SENT, null);
		}
	}

	// Accept or deline an incoming follow request
	@Transactional
	public void respondToFollowRequest(Long requestId, String targetUsername, boolean accepted) {
		FollowRequest followRequest = getFollowRequestOrThrow(requestId);

		if (!followRequest.getTarget().getUsername().equals(targetUsername)) {
			throw new ForbiddenException("You cannot respond to this follow request.");
		}

		if (followRequest.getStatus() != FollowRequestStatus.PENDING) {
			throw new BadRequestException("This request has already been responded to.");
		}

		if (accepted) {
			acceptRequest(followRequest);
			return;
		}

		followRequest.setStatus(FollowRequestStatus.DECLINED);
		followRequestRepository.save(followRequest);
		log.info("{} declined follow request from {}", targetUsername, followRequest.getRequester().getUsername());
		// No notification on decline, don't tell someone they were rejected
	}

	// Cancel an outgoing follow request (requester cancels)
	@Transactional
	public void cancelFollowRequest(Long requestId, String requesterUsername) {

		// Find the followRequest
		FollowRequest followRequest = getFollowRequestOrThrow(requestId);

		// Only the requester can cancel the follow request
		if (!followRequest.getRequester().getUsername().equals(requesterUsername)) {
			throw new ForbiddenException("You cannot cancel this follow request.");
		}
		// Delete the follow request notification from the target's inbox
		notificationService.deleteFollowNotification(followRequest.getTarget().getId(), // recipient — the private
				// account owner
				followRequest.getRequester().getId(), // sender — the person who requested
				NotificationType.FOLLOW_REQUEST_SENT);

		followRequestRepository.deleteById(requestId);
		log.info("{} cancelled follow request to {}", requesterUsername, followRequest.getTarget().getUsername());
	}

	/**
	 * Get a page of the pending incoming requests for a private account. The
	 * {@code Pageable} carries the page number, size and sort, and the returned
	 * {@link Page} carries the total count so the caller can render pagination
	 * controls.
	 */
	public Page<FollowRequestResponse> getAllPendingIncomingRequests(String targetUsername, Pageable pageable) {

		// Find the target User
		AppUser targetUser = getUserOrThrow(targetUsername);

		// Get the requests
		return followRequestRepository
				.findAllByTargetIdAndStatus(targetUser.getId(), FollowRequestStatus.PENDING, pageable)
				.map(mappingMethods::convertFollowRequestToResponse);

	}

	// Get count of users that a user is following
	public long getFollowingCount(String username) {
		AppUser user = getUserOrThrow(username);
		long count = followRepository.countByFollower(user);
		return count;
	}

	/**
	 * Auto-accept all pending requests when a user switches PRIVATE -> PUBLIC
	 */
	@Transactional
	public void acceptAllPendingRequests(AppUser target) {
		List<FollowRequest> pendingRequests = followRequestRepository.findAllByTargetIdAndStatus(target.getId(),
				FollowRequestStatus.PENDING);

		for (FollowRequest request : pendingRequests) {
			acceptRequest(request);
		}
	}

	// Get count of followers for a user
	public long getFollowersCount(String username) {
		AppUser user = getUserOrThrow(username);
		long count = followRepository.countByFollowing(user);
		return count;
	}

	/**
	 * Check if a user already follows the other
	 */
	public boolean isFollowed(String followerUsername, String followingUsername) {
		AppUser follower = getUserOrThrow(followerUsername);
		AppUser following = getUserOrThrow(followingUsername);

		boolean isFollowed = followRepository.existsByFollowerAndFollowing(follower, following);
		return isFollowed;
	}

	/**
	 * Whether {@code viewerUsername} may see {@code owner}'s posts and follow
	 * lists: the account is public, the viewer is the owner, or the viewer follows
	 * them. A null viewer (anonymous caller) only sees public accounts. The post
	 * queries in {@code PostRepository} repeat this rule in JPQL; keep them in
	 * sync.
	 */
	public boolean canView(String viewerUsername, AppUser owner) {
		if (owner.getAccountStatus() == AccountStatus.PUBLIC || owner.getUsername().equals(viewerUsername)) {
			return true;
		}

		if (viewerUsername == null) {
			return false;
		}

		Optional<AppUser> viewer = appUserRepository.findByUsername(viewerUsername);
		if (viewer.isEmpty()) {
			return false;
		}

		boolean doesViewerFollowOwner = followRepository.existsByFollowerAndFollowing(viewer.get(), owner);
		return doesViewerFollowOwner;
	}

	/**
	 * ONLY LOOK FOR PENDING REQUESTS, maybe we declined a previous one, it shouldnt
	 * be the target of our response
	 */
	public Long getPendingRequestId(String requesterUsername, String targetUsername) {
		AppUser requester = getUserOrThrow(requesterUsername);
		AppUser target = getUserOrThrow(targetUsername);

		return followRequestRepository
				.findByRequesterIdAndTargetIdAndStatus(requester.getId(), target.getId(), FollowRequestStatus.PENDING)
				.map(FollowRequest::getId).orElse(null);
	}

	/**
	 * Get count of the requests that the user received
	 */
	public long getFollowRequestsCount(String targetUsername) {
		AppUser user = getUserOrThrow(targetUsername);
		long count = followRequestRepository.countByTargetIdAndStatus(user.getId(), FollowRequestStatus.PENDING);
		return count;
	}

	/**
	 * Get a page of the pending outgoing requests a user has sent. The
	 * {@code Pageable} carries the page number, size and sort, and the returned
	 * {@link Page} carries the total count so the caller can render pagination
	 * controls.
	 */
	public Page<FollowRequestResponse> getAllOutgoingRequests(String requesterUsername, Pageable pageable) {

		AppUser user = getUserOrThrow(requesterUsername);
		return followRequestRepository
				.findAllByRequesterIdAndStatus(user.getId(), FollowRequestStatus.PENDING, pageable)
				.map(mappingMethods::convertFollowRequestToResponse);
	}

	/**
	 * Get count of the requests that the user sent
	 */
	public long getOutgoingRequestsCount(String requesterUsername) {
		AppUser user = getUserOrThrow(requesterUsername);
		long count = followRequestRepository.countByRequesterIdAndStatus(user.getId(), FollowRequestStatus.PENDING);
		return count;
	}

	private AppUser getUserOrThrow(String username) {
		return appUserRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
	}

	private FollowRequest getFollowRequestOrThrow(Long id) {
		return followRequestRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Follow request " + id + " was not found."));
	}

	/**
	 * Accept one pending request: create the follow and notify the requester.
	 * Callers have already checked that the request is PENDING and belongs to its
	 * target.
	 */
	private void acceptRequest(FollowRequest followRequest) {
		followRequest.setStatus(FollowRequestStatus.ACCEPTED);
		// insertIfAbsent, not save: if they already follow, the unique constraint
		// would fail the whole accept
		followRepository.insertIfAbsent(followRequest.getRequester().getId(), followRequest.getTarget().getId());
		followRequestRepository.save(followRequest);
		log.info("{} accepted follow request from {}", followRequest.getTarget().getUsername(),
				followRequest.getRequester().getUsername());

		// Notify the requester that their request was accepted
		notificationService.createNotification(followRequest.getRequester(), // recipient — the person who sent the
				// request
				followRequest.getTarget(), // sender — the person who accepted
				NotificationType.FOLLOW_REQUEST_ACCEPTED, null);
	}
}
