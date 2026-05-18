package com.instragram.project.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.instragram.project.dto.response.FollowRequestResponseDto;
import com.instragram.project.enums.AccountStatus;
import com.instragram.project.enums.FollowRequestStatus;
import com.instragram.project.enums.NotificationType;
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
      AppUser follower = appUserRepository.findByUsername(followerUsername);
      AppUser following = appUserRepository.findByUsername(followingUsername);

      if (follower == null || following == null) {
         throw new RuntimeException("User not found with username: " + followingUsername);
      }

      if (followerUsername.equals(followingUsername)) {
         throw new RuntimeException("You cannot follow yourself");
      }

      if (followRepository.existsByFollowerAndFollowing(follower, following)) {
         followRepository.deleteByFollowerAndFollowing(follower, following);
         log.info("{} unfollowed {}", followerUsername, followingUsername);

         // Delete the notification that was created when the follow was added
         notificationService.deleteNotification(
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
               throw new RuntimeException("You have already sent a follow request to " + followingUsername);
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
      FollowRequest followRequest = followRequestRepository.findById(requestId)
               .orElseThrow(() -> new RuntimeException("Follow request not found with id: " + requestId));

      if (!followRequest.getTarget().getUsername().equals(targetUsername)) {
         throw new AccessDeniedException("You cannot respond to this request");
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
      FollowRequest followRequest = followRequestRepository.findById(requestId).orElseThrow(()-> new RuntimeException("Follow request not found with id: " + requestId));

      // Only the requester can cancel the follow request
      if (!followRequest.getRequester().getUsername().equals(requesterUsername)) {
         throw new AccessDeniedException("You do not have the permission to cancel this request of id: " + requestId);
      }
      // Delete the follow request notification from the target's inbox
      notificationService.deleteNotification(
            followRequest.getTarget().getId(),      // recipient — the private account owner
            followRequest.getRequester().getId(),   // sender — the person who requested
            NotificationType.FOLLOW_REQUEST_SENT
      );

      followRequestRepository.deleteById(requestId);
        log.info("{} cancelled follow request to {}",
                requesterUsername, followRequest.getTarget().getUsername());
   }

   // Get all pending incoming requests for a private account
   public List<FollowRequestResponseDto> getAllPendingIncomingRequests(String targetUsername) {
      
      // Find the target User 
      AppUser targetUser = appUserRepository.findByUsername(targetUsername);

      // Null Check on the User
      if (targetUser == null) {
         throw new RuntimeException("User not found of username: " + targetUsername);
      }

      // Get the requests
      List<FollowRequestResponseDto> responseDtos = followRequestRepository
                .findAllByTargetIdAndStatus(targetUser.getId(), FollowRequestStatus.PENDING)
                .stream()
                .map(mappingMethods::convertFollowRequestToResponseDto)
                .collect(Collectors.toList());

      return responseDtos;

   }

   // Get count of users that a user is following
   public long getFollowingCount(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found: " + username);
      }
      long count = followRepository.countByFollower(user);
      return count;
   }

   // Auto-accept all pending requests when a user switches PRIVATE -> PUBLIC
    @Transactional
    public void acceptAllPendingRequests(String targetUsername) {
        AppUser target = appUserRepository.findByUsername(targetUsername);
        if (target == null) {
            throw new RuntimeException("User not found: " + targetUsername);
        }
        followRequestRepository
                .findAllByTargetIdAndStatus(target.getId(), FollowRequestStatus.PENDING)
                .forEach(req -> respondToFollowRequest(req.getId(), targetUsername, true));
    }

   // Get count of followers for a user
   public long getFollowersCount(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found: " + username);
      }
      long count = followRepository.countByFollowing(user);
      return count;
   }

   // Check if a user already follows the other
   public boolean isFollowed(String followerUsername, String followingUsername) {
      AppUser follower = appUserRepository.findByUsername(followerUsername);
      AppUser following = appUserRepository.findByUsername(followingUsername);

      if (follower == null || following == null) {

         return false;
      }

      boolean isFollowed = followRepository.existsByFollowerAndFollowing(follower, following);
      return isFollowed;
   }

   // ONLY LOOK FOR PENDING REQUESTS, maybe we declined a previous one, it shouldnt be the target of our response
   public Long getPendingRequestId(String requesterUsername, String targetUsername) {
      AppUser requester = appUserRepository.findByUsername(requesterUsername);
      AppUser target = appUserRepository.findByUsername(targetUsername);
      if (requester == null || target == null) return null;

    return followRequestRepository
            .findByRequesterIdAndTargetIdAndStatus(
                    requester.getId(), target.getId(), FollowRequestStatus.PENDING)
            .map(FollowRequest::getId)
            .orElse(null);
   }

   // Get count of follow requests for an account
   public long getFollowRequestsCount(String targetUsername) {
      AppUser user = appUserRepository.findByUsername(targetUsername);
      if (user == null) {
         throw new RuntimeException("User not found: " + targetUsername);
      }
      long count = followRequestRepository.countByTargetIdAndStatus(user.getId(), FollowRequestStatus.PENDING);
      return count;
   }

   // Get all outgoing requests for a user
   public List<FollowRequestResponseDto> getAllOutgoingRequests(String requesterUsername) {

      AppUser user = appUserRepository.findByUsername(requesterUsername);
      if (user == null) {
         throw new RuntimeException("User not found: " + requesterUsername);
      }
      List<FollowRequestResponseDto> responseDtos = followRequestRepository
                .findAllByRequesterIdAndStatus(user.getId(), FollowRequestStatus.PENDING)
                .stream()
                .map(mappingMethods::convertFollowRequestToResponseDto)
                .collect(Collectors.toList());
      return responseDtos;
   }

   // Get count of the requests that the user sent
   public long getOutgoingRequestsCount(String requesterUsername) {
      AppUser user = appUserRepository.findByUsername(requesterUsername);
      if (user == null) {
         throw new RuntimeException("User not found: " + requesterUsername);
      }
      long count = followRequestRepository.countByRequesterIdAndStatus(user.getId(), FollowRequestStatus.PENDING);
      return count;
   }
}
