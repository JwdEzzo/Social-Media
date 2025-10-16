package com.instragram.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Follow;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.FollowRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FollowService {

   @Autowired
   private FollowRepository followRepository;

   @Autowired
   private AppUserRepository appUserRepository;

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

      // Check if the supposed follower already follows the following user
      if (followRepository.existsByFollowerAndFollowing(follower, following)) {
         // Unfollow the user youre following
         followRepository.deleteByFollowerAndFollowing(follower, following);
         log.info("Unfollowed");
      } else {
         Follow follow = new Follow();
         follow.setFollower(follower);
         follow.setFollowing(following);
         followRepository.save(follow);
         log.info("Followed");
      }

   }

   // Get count of users that a user is following
   public long getFollowingCount(String username) {
      log.info("Getting the count of users that a user is following for username: " + username);
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         log.error("User not found: " + username);
         throw new RuntimeException("User not found: " + username);
      }
      log.info("Getting the count of users that a user is following for user: " + user);
      long count = followRepository.countByFollower(user);
      log.info("The count of users that a user is following is: " + count);
      return count;
   }

   // Get count of followers for a user
   public long getFollowersCount(String username) {
      log.info("Getting the count of followers for username: " + username);
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         log.error("User not found: " + username);
         throw new RuntimeException("User not found: " + username);
      }
      log.info("Getting the count of followers for user: " + user);
      long count = followRepository.countByFollowing(user);
      log.info("The count of followers for the user is: " + count);
      return count;
   }

   // Check if a user already follows the other
   public boolean isFollowed(String followerUsername, String followingUsername) {
      log.info("Checking if a user already follows the other for followerUsername: " + followerUsername
            + " and followingUsername: " + followingUsername);
      AppUser follower = appUserRepository.findByUsername(followerUsername);
      AppUser following = appUserRepository.findByUsername(followingUsername);

      if (follower == null || following == null) {
         log.warn("User not found for followerUsername: " + followerUsername + " or followingUsername: "
               + followingUsername);
         return false;
      }

      boolean isFollowed = followRepository.existsByFollowerAndFollowing(follower, following);
      log.info("The result of checking if follower already follows following is: " + isFollowed);
      return isFollowed;
   }

}
