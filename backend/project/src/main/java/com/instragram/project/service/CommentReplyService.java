package com.instragram.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.instragram.project.dto.reply.request.WriteReplyRequest;
import com.instragram.project.dto.reply.response.GetReplyResponse;
import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.ForbiddenException;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.mapper.MappingMethods; // You might want to create a specific DTO
import com.instragram.project.model.AppUser;
import com.instragram.project.model.CommentReply;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentReplyRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CommentReplyService {

   private final CommentReplyRepository commentReplyRepository;

   private final AppUserRepository appUserRepository;

   private final MappingMethods mappingMethods;

   private final NotificationService notificationService;

   public CommentReplyService(CommentReplyRepository commentReplyRepository, AppUserRepository appUserRepository,
         MappingMethods mappingMethods , NotificationService notificationService) {
      this.commentReplyRepository = commentReplyRepository;
      this.appUserRepository = appUserRepository;
      this.mappingMethods = mappingMethods;
      this.notificationService = notificationService;
   }

   // Create Comment Reply
   @Transactional
   public void createCommentReply(WriteReplyRequest requestDto, String username) {
      AppUser appUser = getUserOrThrow(username);

      if (requestDto.getCommentId() == null) {
         throw new NotFoundException("comment.notfound", requestDto.getCommentId());
      }

      // Create reply
      CommentReply commentReply = mappingMethods.convertWriteReplyRequestDtoToCommentReplyEntity(appUser, requestDto);

      commentReplyRepository.save(commentReply);

      // Notify the comment owner
      notificationService.createNotification(
         commentReply.getComment().getAppUser(), // recipient - the comment owner
         appUser, // sender - the person replying
         NotificationType.REPLY, //
         requestDto.getCommentId() //
      );
   }

   // Get All Replies to a Comment
   public List<GetReplyResponse> findByCommentId(Long commentId) {
      List<CommentReply> commentReplies = commentReplyRepository.findByCommentId(commentId);
      return mappingMethods.convertListCommentReplyEntityToListGetCommentReplyResponseDto(commentReplies);
   }

   @Transactional
   public void editCommentReply(Long commentReplyId, String content, String username) {

      CommentReply commentReply = getCommentReplyOrThrow(commentReplyId);
      if (!commentReply.getAppUser().getUsername().equals(username)) {
         throw new ForbiddenException("comment.reply.forbidden.edit");
      }
      commentReply.setContent(content);
      commentReplyRepository.save(commentReply);
   }

   // Delete Reply by Post/Comment/Reply Owner
   @Transactional
   public void deleteCommentReplyByPostOrCommentOrReplyOwner(Long commentReplyId, String username) {
      log.info("Started deleting process with comment reply ID: {}", commentReplyId);
      AppUser appUser = getUserOrThrow(username);
      log.info("Found user: {}", appUser.getUsername());

      CommentReply commentReply = getCommentReplyOrThrow(commentReplyId);
      log.info("Found reply: {}", commentReply);

      boolean isReplyOwner = commentReply.getAppUser().getId().equals(appUser.getId());
      boolean isCommentOwner = commentReply.getComment().getAppUser().getId().equals(appUser.getId());
      boolean isPostOwner = commentReply.getComment().getPost().getAppUser().getId().equals(appUser.getId());

      if (!isReplyOwner && !isCommentOwner && !isPostOwner) {
         throw new ForbiddenException("comment.reply.forbidden.delete");
      }

      log.info("Deleting notifications");
      // Delete the notification that was created when the reply was made
      notificationService.deleteEntityNotification(
               commentReply.getComment().getAppUser().getId(),    // recipient — comment owner
               commentReply.getAppUser().getId(), // sender — the person who replied
               NotificationType.REPLY,
               commentReply.getComment().getId()  // entityId
      );

      commentReplyRepository.deleteById(commentReplyId);
   }

   // Get number of replies to a comment
   public long getReplyCount(Long commentId) {
      return commentReplyRepository.countByCommentId(commentId);
   }

   private AppUser getUserOrThrow(String username) {
      return appUserRepository.findByUsername(username)
            .orElseThrow(() -> new NotFoundException("user.notfound", username));
   }

   private CommentReply getCommentReplyOrThrow(Long id) {
      return commentReplyRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("comment.reply.notfound", id));
   }

}