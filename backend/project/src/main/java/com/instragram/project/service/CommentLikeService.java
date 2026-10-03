package com.instragram.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.NotFoundException;
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
      AppUser user = getUserOrThrow(username);


      Comment comment = getCommentOrThrow(commentId);

      // Check if user already liked the post
      if (commentLikeRepository.existsByAppUserAndComment(user, comment)) {
         // Unlike it
         commentLikeRepository.deleteByAppUserAndComment(user, comment);
         
         // Delete the notification when unliking
         notificationService.deleteEntityNotification(
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
      Comment comment = getCommentOrThrow(commentId);
      return commentLikeRepository.countByComment(comment);
   }

   // Get all likes by a user
   public List<CommentLike> getLikesByUser(String username) {
      AppUser user = getUserOrThrow(username);

      return commentLikeRepository.findByAppUser(user);
   }

   // Check if a user liked a post
   public boolean isLikedByUser(String username, Long commentId) {
      AppUser appUser = getUserOrThrow(username);
      Comment comment = getCommentOrThrow(commentId);

      return commentLikeRepository.existsByAppUserAndComment(appUser, comment);
   }

   private AppUser getUserOrThrow(String username) {
      return appUserRepository.findByUsername(username)
            .orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
   }

   private Comment getCommentOrThrow(Long id) {
      return commentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Comment with id " + id + " was not found."));
   }

}
