package com.instragram.project.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.dto.reply.request.WriteReplyRequestDto;
import com.instragram.project.dto.reply.response.GetReplyResponseDto;
import com.instragram.project.service.CommentReplyService;

import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/comment-replies")
@Slf4j
public class CommentReplyController {

   private final CommentReplyService commentReplyService;

   public CommentReplyController(CommentReplyService commentReplyService) {
      this.commentReplyService = commentReplyService;
   }

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

   // Update Comment
   @PutMapping("/edit-reply/{commentReplyId:\\d+}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> editCommentReply(@PathVariable Long commentReplyId, @RequestBody String content, Authentication authentication) {
      String username = authentication.getName();
      commentReplyService.editCommentReply(commentReplyId, content, username);
      return ResponseEntity.status(HttpStatus.OK).build();
   }

   @DeleteMapping("/delete-reply/{commentReplyId:\\d+}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> deleteCommentReply(
         @PathVariable Long commentReplyId,
         Authentication authentication) {
      log.info("Started deleting process for comment reply ID: {}", commentReplyId);
      commentReplyService.deleteCommentReplyByPostOrCommentOrReplyOwner(commentReplyId, authentication.getName());
      return ResponseEntity.noContent().build();
   }

}