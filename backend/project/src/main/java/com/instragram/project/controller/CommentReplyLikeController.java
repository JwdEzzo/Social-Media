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

import com.instragram.project.service.CommentReplyLikeService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/comment-reply-likes")
public class CommentReplyLikeController {

   @Autowired
   private CommentReplyLikeService commentReplyLikeService;

   // POST : Toggle Like
   @PostMapping("/comment-reply/{commentReplyId}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> toggleLike(@PathVariable Long commentReplyId, Authentication authentication) {
      String username = authentication.getName();
      commentReplyLikeService.toggleLike(username, commentReplyId);
      return ResponseEntity.noContent().build();
   }

   // GET : Get a Comment Reply's like count
   @GetMapping("/comment-reply/{commentReplyId}/like-count")
   public ResponseEntity<Long> getLikeCount(@PathVariable Long commentReplyId) {
      long count = commentReplyLikeService.getLikeCount(commentReplyId);
      return ResponseEntity.ok(count);
   }

   // GET boolean : Check if a user liked a comment reply
   @GetMapping("/comment-reply/{commentReplyId}/is-liked")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Boolean> isLikedByCurrentUser(@PathVariable Long commentReplyId,
         Authentication authentication) {
      String username = authentication.getName();
      boolean isLiked = commentReplyLikeService.isLikedByUser(username, commentReplyId);
      return ResponseEntity.ok(isLiked);
   }

}