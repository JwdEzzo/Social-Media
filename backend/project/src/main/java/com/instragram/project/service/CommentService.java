package com.instragram.project.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.instragram.project.dto.request.WriteCommentRequestDto;
import com.instragram.project.enums.NotificationType;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Comment;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CommentService {

   private final CommentRepository commentRepository;

   private final AppUserRepository appUserRepository;

   private final MappingMethods mappingMethods;

   private final NotificationService notificationService;

   public CommentService(CommentRepository commentRepository, AppUserRepository appUserRepository,
         MappingMethods mappingMethods, NotificationService notificationService) {
      this.commentRepository = commentRepository;
      this.appUserRepository = appUserRepository;
      this.mappingMethods = mappingMethods;
      this.notificationService = notificationService;
   }

   // Create Comment
   @Transactional
   public void createComment(WriteCommentRequestDto requestDto, String username) {
      AppUser appUser = appUserRepository.findByUsername(username);
      if (appUser == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      Comment comment = mappingMethods.convertWriteCommentRequestDtoToCommentEntity(appUser, requestDto);
      commentRepository.save(comment);

      notificationService.createNotification( 
         comment.getPost().getAppUser(), // recipient - the post owner
         appUser, // sender - the person commenting
         NotificationType.COMMENT, 
         requestDto.getPostId() // entityId
      );
   }

   // Get All Comments of a Post
   public List<Comment> findByPostId(Long postId) {
      return commentRepository.findByPostId(postId);
   }

   // Update a comment
   @Transactional
   public void editComment(Long commentId, String content, String username) {
      Comment comment = commentRepository.findById(commentId).get();
      if (!comment.getAppUser().getUsername().equals(username)) {
         throw new RuntimeException("You do not have permission to update this comment");
      }
      comment.setContent(content);
      commentRepository.save(comment);
   }

   // Delete Comment
   @Transactional
   public void deleteComment(Long commentId, String username) {
      AppUser appUser = appUserRepository.findByUsername(username);
      if (appUser == null) {
         throw new RuntimeException("User not found: " + username);
      }

      Comment comment = commentRepository.findById(commentId)
               .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));

      if (!comment.getAppUser().getId().equals(appUser.getId())) {
         throw new AccessDeniedException("You cannot delete this comment");
      }

      // Delete the notification that was created when the comment was made
      notificationService.deleteEntityNotification(
               comment.getPost().getAppUser().getId(),  // recipient — post owner
               appUser.getId(),                         // sender — commenter
               NotificationType.COMMENT,
               comment.getPost().getId()
      );

      commentRepository.deleteById(commentId);
   }

   // Get number of comments on a post
   public long getCommentCount(Long postId) {
      return commentRepository.countByPostId(postId);
   }

}

// COMMENT WORKS
// COMMENT_LIKE WORKS
// POST_LIKE WORKS
// REMOVE A FOLLOW WORKS
// FOLLOW_REQUEST WORKS
// REPLY_LIKE WORKS
// COMMENT DELETE WORKS

