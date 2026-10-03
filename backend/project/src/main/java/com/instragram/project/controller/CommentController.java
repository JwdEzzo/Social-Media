package com.instragram.project.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
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

import com.instragram.project.dto.comment.request.WriteCommentRequest;
import com.instragram.project.dto.comment.response.GetCommentResponse;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.repository.PostRepository;
import com.instragram.project.service.CommentService;

import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/comments")
@Slf4j
public class CommentController {

   private final CommentService commentService;

   private final PostRepository postRepository;

   private final MappingMethods mappingMethods;

   public CommentController(CommentService commentService, PostRepository postRepository,
         MappingMethods mappingMethods) {
      this.commentService = commentService;
      this.postRepository = postRepository;
      this.mappingMethods = mappingMethods;
   }


   // Create Comment
   @PostMapping("/create-comment")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> createComment(@RequestBody WriteCommentRequest requestDto,
         Authentication authentication) {
      String username = authentication.getName();
      commentService.createComment(requestDto, username);
      return ResponseEntity.status(HttpStatus.CREATED).build();
   }

   // GET: Comment Count on a Post
   @GetMapping("/post/{postId}/comment-count")
   public ResponseEntity<Long> getCommentCount(@PathVariable Long postId) {
      if (!postRepository.existsById(postId)) {
         return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
      }

      Long count = commentService.getCommentCount(postId);
      return ResponseEntity.ok(count);
   }

   // Get Comments By PostId, paginated — ?page=0&size=20&sort=createdAt,desc
   @GetMapping("/{postId:\\d+}")
   public ResponseEntity<PagedModel<GetCommentResponse>> getCommentsByPostId(
         @PathVariable Long postId,
         @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
      Page<GetCommentResponse> commentResponseDtos = commentService
            .findByPostId(postId, pageable)
            .map(mappingMethods::convertCommentEntityToGetCommentResponse);
      return ResponseEntity.status(HttpStatus.OK).body(new PagedModel<>(commentResponseDtos));
   }

   // Update Comment
   @PutMapping("/edit-comment/{commentId:\\d+}")
   public ResponseEntity<Void> editComment(@PathVariable Long commentId, @RequestBody String content,
         Authentication authentication) {
      String username = authentication.getName();
      commentService.editComment(commentId, content, username);
      return ResponseEntity.status(HttpStatus.OK).build();
   }

   @DeleteMapping("/{commentId}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> deleteComment(
         @PathVariable Long commentId,
         Authentication authentication) {

      commentService.deleteCommentByPostOrCommentOwner(commentId, authentication.getName());
      return ResponseEntity.noContent().build();
   }
}