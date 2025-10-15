package com.instragram.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.dto.request.WriteCommentRequestDto;
import com.instragram.project.dto.response.GetCommentResponseDto;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.Comment;
import com.instragram.project.repository.PostRepository;
import com.instragram.project.service.CommentService;

import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/comments")
@Slf4j
public class CommentController {

   @Autowired
   private CommentService commentService;

   @Autowired
   private PostRepository postRepository;

   @Autowired
   private MappingMethods mappingMethods;

   // Create Comment
   @PostMapping("/create-comment")
   public ResponseEntity<Void> createComment(@RequestBody WriteCommentRequestDto requestDto) {
      try {
         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
         if (authentication == null || !authentication.isAuthenticated()
               || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
         }

         String username = authentication.getName();
         commentService.createComment(requestDto, username);

         return ResponseEntity.status(HttpStatus.CREATED).build();
      } catch (RuntimeException e) {
         return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // GET: Comment Count on a Post 
   @GetMapping("/post/{postId}/comment-count")
   public ResponseEntity<Long> getCommentCount(@PathVariable Long postId) {
      if (!postRepository.existsById(postId)) {
         return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
      }

      Long count = commentService.getCommentCount(postId);
      log.debug("Comment count for post " + postId + " is " + count);
      return ResponseEntity.ok(count);
   }

   // Get Comments By PostId
   @GetMapping("/{postId:\\d+}")
   public ResponseEntity<List<GetCommentResponseDto>> getCommentsByPostId(@PathVariable Long postId) {
      try {
         List<Comment> comments = commentService.findByPostId(postId);
         List<GetCommentResponseDto> commentResponseDtos = mappingMethods
               .convertListCommentEntityToListGetCommentResponseDto(comments);
         return ResponseEntity.status(HttpStatus.OK).body(commentResponseDtos);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }
   // Delete Comment by Post Owner
   // @DeleteMapping("/{}")
}