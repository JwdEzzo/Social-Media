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

import com.instragram.project.service.CommentLikeService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/comment-likes")
public class CommentLikeController {

   @Autowired
   private CommentLikeService commentLikeService;

   // POST : Toggle Like
   @PostMapping("/comment/{commentId}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> toggleLike(@PathVariable Long commentId, Authentication authentication) {
      String username = authentication.getName();
      commentLikeService.toggleLike(username, commentId);
      return ResponseEntity.noContent().build();
   }

   // GET : Get a Comment's like count
   @GetMapping("/comment/{commentId}/like-count")
   public ResponseEntity<Long> getLikeCount(@PathVariable Long commentId) {
      long count = commentLikeService.getLikeCount(commentId);
      return ResponseEntity.ok(count);
   }

   // GET boolean : Check if a user liked a comment
   @GetMapping("/comment/{commentId}/is-liked")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Boolean> isLikedByCurrentUser(@PathVariable Long commentId, Authentication authentication) {
      String username = authentication.getName();
      boolean isLiked = commentLikeService.isLikedByUser(username, commentId);
      return ResponseEntity.ok(isLiked);
   }

}
