package com.instragram.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.instragram.project.enums.NotificationType;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.CommentReply;
import com.instragram.project.model.CommentReplyLike;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentReplyLikeRepository;
import com.instragram.project.repository.CommentReplyRepository;

import jakarta.transaction.Transactional;

@Service
public class CommentReplyLikeService {

   private final AppUserRepository appUserRepository;

   private final CommentReplyRepository commentReplyRepository;

   private final CommentReplyLikeRepository commentReplyLikeRepository;

   private final NotificationService notificationService;

   public CommentReplyLikeService(AppUserRepository appUserRepository, CommentReplyRepository commentReplyRepository,
            CommentReplyLikeRepository commentReplyLikeRepository, NotificationService notificationService) {
         this.appUserRepository = appUserRepository;
         this.commentReplyRepository = commentReplyRepository;
         this.commentReplyLikeRepository = commentReplyLikeRepository;
         this.notificationService = notificationService;
   }

   @Transactional
   public void toggleLike(String username, Long commentReplyId) {
      AppUser user = appUserRepository.findByUsername(username);
      
      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }
      
      CommentReply commentReply = commentReplyRepository.findById(commentReplyId)
            .orElseThrow(() -> new RuntimeException("Comment reply not found with id: " + commentReplyId));

      // Check if user already liked the comment reply
      if (commentReplyLikeRepository.existsByAppUserAndCommentReply(user, commentReply)) {
         // Unlike it
         commentReplyLikeRepository.deleteByAppUserAndCommentReply(user, commentReply);
         // Delete the notification when unliking
        notificationService.deleteEntityNotification(
                commentReply.getAppUser().getId(),     // recipient — reply owner
                user.getId(),                   // sender — the person who liked
                NotificationType.REPLY_LIKE,
                commentReplyId
        );
      } else {
         // Create ReplyLike:
         CommentReplyLike like = new CommentReplyLike();
         like.setAppUser(user);
         like.setCommentReply(commentReply);
         commentReplyLikeRepository.save(like);

         // Then notify the comment owner
         notificationService.createNotification(
            commentReply.getComment().getAppUser(), // recipient - the comment owner
            user, // sender - the person liking
            NotificationType.REPLY_LIKE,
            commentReplyId
         );
      }
   }

   // Get like count for a comment reply
   public Long getLikeCount(Long commentReplyId) {
      CommentReply commentReply = commentReplyRepository.findById(commentReplyId)
            .orElseThrow(() -> new RuntimeException("Comment reply not found with id: " + commentReplyId));
      return commentReplyLikeRepository.countByCommentReply(commentReply);
   }

   // Get all likes by a user
   public List<CommentReplyLike> getLikesByUser(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      return commentReplyLikeRepository.findByAppUser(user);
   }

   // Check if a user liked a comment reply
   public boolean isLikedByUser(String username, Long commentReplyId) {
      AppUser appUser = appUserRepository.findByUsername(username);
      CommentReply commentReply = commentReplyRepository.findById(commentReplyId)
            .orElseThrow(() -> new RuntimeException("Comment reply not found with id: " + commentReplyId));

      return commentReplyLikeRepository.existsByAppUserAndCommentReply(appUser, commentReply);
   }

}