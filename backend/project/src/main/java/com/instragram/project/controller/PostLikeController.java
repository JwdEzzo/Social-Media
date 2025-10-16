package com.instragram.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.service.PostLikeService;

import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/post-likes")
@Slf4j
public class PostLikeController {

   @Autowired
   private PostLikeService postLikeService;

   // POST : Toggle Like
   @PostMapping("/post/{postId}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> toggleLike(@PathVariable Long postId, Authentication authentication) {
      String username = authentication.getName();
      postLikeService.toggleLike(username, postId);
      return ResponseEntity.noContent().build();
   }

   // GET : Get a Post's like count
   @GetMapping("/post/{postId}/like-count")
   public ResponseEntity<Long> getLikeCount(@PathVariable Long postId) {
      try {
         long count = postLikeService.getLikeCount(postId);
         return ResponseEntity.ok(count);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Check if a user liked a post
   @GetMapping("/post/{postId}/is-liked")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Boolean> isLikedByCurrentUser(@PathVariable Long postId, Authentication authentication) {
      String username = authentication.getName();
      boolean isLiked = postLikeService.isLikedByUser(username, postId);
      return ResponseEntity.ok(isLiked);
   }

}
