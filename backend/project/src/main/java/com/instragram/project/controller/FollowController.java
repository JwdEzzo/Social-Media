package com.instragram.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.service.FollowService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/follows")
public class FollowController {

   @Autowired
   private FollowService followService;

   // POST : Toggle Follow
   @PostMapping("/following/{followingUsername}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> toggleFollow(
         @PathVariable String followingUsername,
         Authentication authentication) {

      String followerUsername = authentication.getName();
      followService.toggleFollow(followerUsername, followingUsername);
      return ResponseEntity.noContent().build();
   }

   // GET : followers count
   @GetMapping("/{username}/follower-count")
   public ResponseEntity<Long> getFollowersCount(@PathVariable String username) {
      long count = followService.getFollowersCount(username);
      return ResponseEntity.ok(count);
   }

   // GET : following count
   @GetMapping("/{username}/following-count")
   public ResponseEntity<Long> getFollowingCount(@PathVariable String username) {
      long count = followService.getFollowingCount(username);
      return ResponseEntity.ok(count);
   }
}
