package com.instragram.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.dto.request.WriteReplyRequestDto;
import com.instragram.project.dto.response.GetReplyResponseDto;
import com.instragram.project.model.CommentReply;
import com.instragram.project.repository.CommentReplyRepository;
import com.instragram.project.service.CommentReplyService;

import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/comment-replies")
@Slf4j
public class CommentReplyController {

   @Autowired
   private CommentReplyService commentReplyService;

   @Autowired
   private CommentReplyRepository commentReplyRepository;

   // Create Comment Reply
   @PostMapping("/create-reply")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> createCommentReply(
         @RequestBody WriteReplyRequestDto requestDto,
         Authentication authentication) {
      String username = authentication.getName();
      commentReplyService.createCommentReply(requestDto, username);
      return ResponseEntity.status(HttpStatus.CREATED).build();
   }

   // GET: Reply Count on a Comment
   @GetMapping("/comment/{commentId}/reply-count")
   public ResponseEntity<Long> getReplyCount(@PathVariable Long commentId) {
      try {
         Long count = commentReplyService.getReplyCount(commentId);
         return ResponseEntity.ok(count);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Get Replies By CommentId
   @GetMapping("/comment/{commentId}")
   public ResponseEntity<List<GetReplyResponseDto>> getRepliesByCommentId(@PathVariable Long commentId) {
      try {
         List<GetReplyResponseDto> commentReplies = commentReplyService.findByCommentId(commentId);
         return ResponseEntity.status(HttpStatus.OK).body(commentReplies);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Delete Comment Reply by Post Owner
   @DeleteMapping("/{commentReplyId}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> deleteCommentReply(@PathVariable Long commentReplyId, Authentication authentication) {

      CommentReply thisCommentReply = commentReplyRepository.findById(commentReplyId).get();

      // Check if the authenticated user is the owner of the reply or the owner of the post or the owner of the comment
      String authenticatedUsername = authentication.getName();
      String replyOwnerUsername = thisCommentReply.getAppUser().getUsername();
      String postOwnerUsername = thisCommentReply.getComment().getPost().getAppUser().getUsername();
      String commentOwnerUsername = thisCommentReply.getComment().getAppUser().getUsername();

      boolean isReplyOwner = authenticatedUsername.equals(replyOwnerUsername);
      boolean isPostOwner = authenticatedUsername.equals(postOwnerUsername);
      boolean isCommentOwner = authenticatedUsername.equals(commentOwnerUsername);

      // If the authenticated name is NOT equal to the reply owner , return forbidden
      // AND
      // If the authenticated name is NOT equal to the post owner , return forbidden
      // AND
      // If the authenticated name is NOT equal to the comment owner , return forbidden

      if (!isReplyOwner && !isPostOwner && !isCommentOwner) {
         return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
      }
      try {
         commentReplyService.deleteCommentReply(commentReplyId);
         return ResponseEntity.ok().build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }
}