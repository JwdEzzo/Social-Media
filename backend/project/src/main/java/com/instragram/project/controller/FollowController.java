package com.instragram.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
   @PostMapping("/follower/{followerUsername}/following/{followingUsername}")
   public ResponseEntity<Void> toggleFollow(@PathVariable String followingUsername) {
      try {
         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
         if (authentication == null || !authentication.isAuthenticated()
               || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
         }
         String followerUsername = authentication.getName();
         followService.toggleFollow(followerUsername, followingUsername);
         return ResponseEntity.noContent().build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // GET : followers count
   @GetMapping("/{username}/followers-count")
   public ResponseEntity<Long> getFollowersCount(@PathVariable String username) {
      try {
         long count = followService.getFollowersCount(username);
         return ResponseEntity.ok(count);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // GET : following count
   @GetMapping("/{username}/following-count")
   public ResponseEntity<Long> getFollowingCount(@PathVariable String username) {
      try {
         long count = followService.getFollowingCount(username);
         return ResponseEntity.ok(count);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }
}
