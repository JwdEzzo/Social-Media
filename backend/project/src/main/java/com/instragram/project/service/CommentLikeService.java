package com.instragram.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.instragram.project.enums.NotificationType;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Comment;
import com.instragram.project.model.CommentLike;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentLikeRepository;
import com.instragram.project.repository.CommentRepository;

import jakarta.transaction.Transactional;

@Service
public class CommentLikeService {

   private final AppUserRepository appUserRepository;

   private final CommentRepository commentRepository;

   private final CommentLikeRepository commentLikeRepository;

   private final NotificationService notificationService;

   public CommentLikeService(AppUserRepository appUserRepository, CommentRepository commentRepository,
         CommentLikeRepository commentLikeRepository , NotificationService notificationService) {
      this.appUserRepository = appUserRepository;
      this.commentRepository = commentRepository;
      this.commentLikeRepository = commentLikeRepository;
      this.notificationService = notificationService;
   }

   @Transactional
   public void toggleLike(String username, Long commentId) {
      AppUser user = appUserRepository.findByUsername(username);

      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));

      // Check if user already liked the post
      if (commentLikeRepository.existsByAppUserAndComment(user, comment)) {
         // Unlike it
         commentLikeRepository.deleteByAppUserAndComment(user, comment);
         
         // Delete the notification when unliking
         notificationService.deleteNotification(
                comment.getAppUser().getId(),   // recipient — comment owner
                user.getId(),                   // sender — the person who liked
                NotificationType.COMMENT_LIKE,
                commentId
        );
      } else {
         // Create Like:
         CommentLike like = new CommentLike();
         like.setAppUser(user);
         like.setComment(comment);
         commentLikeRepository.save(like);
   
         // Then notify the post owner
         notificationService.createNotification(
            comment.getAppUser(), // recipient - the post owner
            user, // sender - the person liking
            NotificationType.COMMENT_LIKE,
            commentId // entityId - for the frontend to link to the post
         );
      }
   }

   // Get like count for a comment
   public Long getLikeCount(Long commentId) {
      Comment comment = commentRepository.findById(commentId).get();
      return commentLikeRepository.countByComment(comment);
   }

   // Get all likes by a user
   public List<CommentLike> getLikesByUser(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found");
      }

      return commentLikeRepository.findByAppUser(user);
   }

   // Check if a user liked a post
   public boolean isLikedByUser(String username, Long commentId) {
      AppUser appUser = appUserRepository.findByUsername(username);
      Comment comment = commentRepository.findById(commentId).get();

      return commentLikeRepository.existsByAppUserAndComment(appUser, comment);
   }

}
