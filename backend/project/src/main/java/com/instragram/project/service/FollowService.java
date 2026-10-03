package com.instragram.project.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
import com.instragram.project.model.Follow;
import com.instragram.project.model.FollowRequest;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.FollowRepository;
import com.instragram.project.repository.FollowRequestRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FollowService {

   private final FollowRepository followRepository;

   private final AppUserRepository appUserRepository;

   private final FollowRequestRepository followRequestRepository;

   private final MappingMethods mappingMethods;

   private final NotificationService notificationService;

   public FollowService(NotificationService notificationService,FollowRepository followRepository, AppUserRepository appUserRepository , FollowRequestRepository followRequestRepository , MappingMethods mappingMethods) {
      this.followRepository = followRepository;
      this.appUserRepository = appUserRepository;
      this.followRequestRepository = followRequestRepository;
      this.mappingMethods = mappingMethods;
      this.notificationService = notificationService;
   }

   // Toggle follow
   @Transactional
   public void toggleFollow(String followerUsername, String followingUsername) {
      AppUser follower = getUserOrThrow(followerUsername);
      AppUser following = getUserOrThrow(followingUsername);

      if (followerUsername.equals(followingUsername)) {
         throw new BadRequestException("You cannot follow yourself.");
      }

      if (followRepository.existsByFollowerAndFollowing(follower, following)) {
         followRepository.deleteByFollowerAndFollowing(follower, following);
         log.info("{} unfollowed {}", followerUsername, followingUsername);

         // Delete the notification that was created when the follow was added
         notificationService.deleteFollowNotification(
                  following.getId(),   // recipient — the user who was followed
                  follower.getId(),    // sender — the user who unfollowed
                  NotificationType.FOLLOW
         );

         return;
      }

      if (following.getAccountStatus() == AccountStatus.PUBLIC) {
         Follow follow = new Follow();
         follow.setFollower(follower);
         follow.setFollowing(following);
         followRepository.save(follow);
         log.info("{} followed {}", followerUsername, followingUsername);

         // Notify the followed user
         notificationService.createNotification(
                  following,                      // recipient — the person being followed
                  follower,                       // sender — the person following
                  NotificationType.FOLLOW,
                  null                            // no entityId — not tied to a post/comment
         );

      } else {
         boolean alreadyRequested = followRequestRepository
                  .existsByRequesterIdAndTargetIdAndStatus(
                           follower.getId(), following.getId(), FollowRequestStatus.PENDING);

         if (alreadyRequested) {
               throw new AlreadyExistsException("You have already sent a follow request to '" + followingUsername + "'.");
         }

         FollowRequest followRequest = new FollowRequest();
         followRequest.setRequester(follower);
         followRequest.setTarget(following);
         followRequestRepository.save(followRequest);
         log.info("{} sent a follow request to {}", followerUsername, followingUsername);

         // Notify the private account owner of the incoming request
         notificationService.createNotification(
                  following,                      // recipient — the private account owner
                  follower,                       // sender — the person requesting
                  NotificationType.FOLLOW_REQUEST_SENT,
                  null
         );
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
         throw new RuntimeException("This request has already been responded to");
      }

      if (accepted) {
         followRequest.setStatus(FollowRequestStatus.ACCEPTED);
         Follow follow = new Follow();
         follow.setFollower(followRequest.getRequester());
         follow.setFollowing(followRequest.getTarget());
         followRepository.save(follow);
         log.info("{} accepted follow request from {}",
                  targetUsername, followRequest.getRequester().getUsername());

         // Notify the requester that their request was accepted
         notificationService.createNotification(
                  followRequest.getRequester(),   // recipient — the person who sent the request
                  followRequest.getTarget(),      // sender — the person who accepted
                  NotificationType.FOLLOW_REQUEST_ACCEPTED,
                  null
         );

      } else {
         followRequest.setStatus(FollowRequestStatus.DECLINED);
         log.info("{} declined follow request from {}",
                  targetUsername, followRequest.getRequester().getUsername());
         // No notification on decline — don't tell someone they were rejected
      }

      followRequestRepository.save(followRequest);
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
      notificationService.deleteFollowNotification(
            followRequest.getTarget().getId(),      // recipient — the private account owner
            followRequest.getRequester().getId(),   // sender — the person who requested
            NotificationType.FOLLOW_REQUEST_SENT
      );

      followRequestRepository.deleteById(requestId);
        log.info("{} cancelled follow request to {}",
                requesterUsername, followRequest.getTarget().getUsername());
   }

   /**
    * Get a page of the pending incoming requests for a private account.
    * The {@code Pageable} carries the page number, size and sort, and the returned
    * {@link Page} carries the total count so the caller can render pagination controls.
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

   // Auto-accept all pending requests when a user switches PRIVATE -> PUBLIC
    @Transactional
    public void acceptAllPendingRequests(String targetUsername) {
        AppUser target = getUserOrThrow(targetUsername);
        followRequestRepository
                .findAllByTargetIdAndStatus(target.getId(), FollowRequestStatus.PENDING)
                .forEach(req -> respondToFollowRequest(req.getId(), targetUsername, true));
    }

   // Get count of followers for a user
   public long getFollowersCount(String username) {
      AppUser user = getUserOrThrow(username);
      long count = followRepository.countByFollowing(user);
      return count;
   }

   // Check if a user already follows the other
   public boolean isFollowed(String followerUsername, String followingUsername) {
      AppUser follower = getUserOrThrow(followerUsername);
      AppUser following = getUserOrThrow(followingUsername);

      boolean isFollowed = followRepository.existsByFollowerAndFollowing(follower, following);
      return isFollowed;
   }

   // ONLY LOOK FOR PENDING REQUESTS, maybe we declined a previous one, it shouldnt be the target of our response
   public Long getPendingRequestId(String requesterUsername, String targetUsername) {
      AppUser requester = getUserOrThrow(requesterUsername);
      AppUser target = getUserOrThrow(targetUsername);

    return followRequestRepository
            .findByRequesterIdAndTargetIdAndStatus(
                    requester.getId(), target.getId(), FollowRequestStatus.PENDING)
            .map(FollowRequest::getId)
            .orElse(null);
   }

   // Get count of follow requests for an account
   public long getFollowRequestsCount(String targetUsername) {
      AppUser user = getUserOrThrow(targetUsername);

      long count = followRequestRepository.countByTargetIdAndStatus(user.getId(), FollowRequestStatus.PENDING);
      return count;
   }

   /**
    * Get a page of the pending outgoing requests a user has sent.
    * The {@code Pageable} carries the page number, size and sort, and the returned
    * {@link Page} carries the total count so the caller can render pagination controls.
    */
   public Page<FollowRequestResponse> getAllOutgoingRequests(String requesterUsername, Pageable pageable) {

      AppUser user = getUserOrThrow(requesterUsername);
      return followRequestRepository
                .findAllByRequesterIdAndStatus(user.getId(), FollowRequestStatus.PENDING, pageable)
                .map(mappingMethods::convertFollowRequestToResponse);
   }

   // Get count of the requests that the user sent
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
}
