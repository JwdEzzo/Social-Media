package com.instragram.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Follow;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.FollowRepository;

import jakarta.transaction.Transactional;

@Service
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
      } else {
         Follow follow = new Follow();
         follow.setFollower(follower);
         follow.setFollowing(following);
         followRepository.save(follow);
      }

   }

   // Get count of users that a user is following
   public long getFollowingCount(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found: " + username);
      }
      return followRepository.countByFollower(user);
   }

   // Get count of followers for a user
   public long getFollowersCount(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found: " + username);
      }
      return followRepository.countByFollowing(user);
   }

   // Check if a user already follows the other
   public boolean isFollowing(String followerUsername, String followingUsername) {
      AppUser follower = appUserRepository.findByUsername(followerUsername);
      AppUser following = appUserRepository.findByUsername(followingUsername);

      if (follower == null || following == null) {
         return false;
      }

      return followRepository.existsByFollowerAndFollowing(follower, following);
   }

}
