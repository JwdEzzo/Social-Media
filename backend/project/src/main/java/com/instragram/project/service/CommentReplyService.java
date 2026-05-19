package com.instragram.project.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.instragram.project.dto.request.WriteReplyRequestDto;
import com.instragram.project.dto.response.GetReplyResponseDto;
import com.instragram.project.enums.NotificationType;
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
   public void createCommentReply(WriteReplyRequestDto requestDto, String username) {
      AppUser appUser = appUserRepository.findByUsername(username);

      if (appUser == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      if (requestDto.getCommentId() == null) {
         throw new RuntimeException("Comment doesnt exist");
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
   public List<GetReplyResponseDto> findByCommentId(Long commentId) {
      List<CommentReply> commentReplies = commentReplyRepository.findByCommentId(commentId);
      return mappingMethods.convertListCommentReplyEntityToListGetCommentReplyResponseDto(commentReplies);
   }

   // Delete Reply
   @Transactional
   public void deleteCommentReply(Long commentReplyId, String username) {
      AppUser appUser = appUserRepository.findByUsername(username);
      if (appUser == null) {
         throw new RuntimeException("User not found: " + username);
      }

      CommentReply commentReply = commentReplyRepository.findById(commentReplyId)
               .orElseThrow(() -> new RuntimeException("Reply not found: " + commentReplyId));

      if (!commentReply.getAppUser().getId().equals(appUser.getId())) {
         throw new AccessDeniedException("You cannot delete this reply");
      }

      // Delete the notification that was created when the reply was made
      notificationService.deleteEntityNotification(
               commentReply.getComment().getAppUser().getId(),    // recipient — comment owner
               appUser.getId(),                            // sender — the person who replied
               NotificationType.REPLY,
               commentReply.getComment().getId()
      );

      commentReplyRepository.deleteById(commentReplyId);
   }

   // Get number of replies to a comment
   public long getReplyCount(Long commentId) {
      return commentReplyRepository.countByCommentId(commentId);
   }

}