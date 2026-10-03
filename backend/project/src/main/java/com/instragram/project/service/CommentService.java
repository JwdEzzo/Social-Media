package com.instragram.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.instragram.project.dto.comment.request.WriteCommentRequest;
import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.ForbiddenException;
import com.instragram.project.exception.NotFoundException;
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
   public void createComment(WriteCommentRequest requestDto, String username) {
      AppUser appUser = getUserOrThrow(username);

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
      Comment comment = getCommentOrThrow(commentId);
      if (!comment.getAppUser().getUsername().equals(username)) {
         throw new ForbiddenException("You do not have permission to edit this comment.");
      }
      comment.setContent(content);
      commentRepository.save(comment);
   }
   
   // Delete comment by Post/Comment Owner
   @Transactional
   public void deleteCommentByPostOrCommentOwner(Long commentId, String username) {
      AppUser appUser = getUserOrThrow(username);

      Comment comment = getCommentOrThrow(commentId);
      boolean isCommentOwner = comment.getAppUser().getId().equals(appUser.getId());
      boolean isPostOwner = comment.getPost().getAppUser().getId().equals(appUser.getId());

      if (!isCommentOwner && !isPostOwner) {
         throw new ForbiddenException("You do not have permission to delete this comment.");
      }

      // Sender is always the commenter — regardless of who is performing the deletion
      notificationService.deleteEntityNotification(
            comment.getPost().getAppUser().getId(), // recipient — post owner
            comment.getAppUser().getId(), // sender — commenter
            NotificationType.COMMENT,
            comment.getPost().getId() // entityId
         ); 

      commentRepository.deleteById(commentId);
   }

   // Get number of comments on a post
   public long getCommentCount(Long postId) {
      return commentRepository.countByPostId(postId);
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
