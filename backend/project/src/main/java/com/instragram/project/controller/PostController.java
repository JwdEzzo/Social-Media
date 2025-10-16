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

import com.instragram.project.dto.request.CreatePostRequestDto;
import com.instragram.project.dto.response.GetPostResponseDto;
import com.instragram.project.service.PostService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/instagram/posts")
@CrossOrigin("*")
@Slf4j
public class PostController {

   @Autowired
   private PostService postService;

   // POST: create post
   @PostMapping("/create-post")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> createPost(@RequestBody CreatePostRequestDto requestDto, Authentication authentication) {
      String username = authentication.getName();
      postService.createPost(requestDto, username);
      return ResponseEntity.noContent().build();
   }

   // GET : Get all posts
   @GetMapping
   public ResponseEntity<List<GetPostResponseDto>> getAllPosts() {
      List<GetPostResponseDto> responseDtos = postService.getAllPosts();
      return ResponseEntity.status(HttpStatus.OK).body(responseDtos);
   }

   // GET : Get post by id
   @GetMapping("/get-by-id/{postId}")
   public ResponseEntity<GetPostResponseDto> getPostById(@PathVariable Long postId) {
      GetPostResponseDto responseDto = postService.getPostById(postId);
      return ResponseEntity.status(HttpStatus.OK).body(responseDto);
   }

   // GET : Get posts by username
   @GetMapping("/{username}")
   public ResponseEntity<List<GetPostResponseDto>> getPostsByUsername(@PathVariable String username) {
      List<GetPostResponseDto> responseDtos = postService.getPostsByUsername(username);
      return ResponseEntity.status(HttpStatus.OK).body(responseDtos);
   }

   @GetMapping("/excluded")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<List<GetPostResponseDto>> getAllPostsExcludingTheCurrentUser(Authentication authentication) {
      String username = authentication.getName();
      List<GetPostResponseDto> posts = postService.getAllPostsExcludingUser(username);
      return ResponseEntity.ok(posts);
   }

   @DeleteMapping("/{postId}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> deletePost(@PathVariable Long postId, Authentication authentication) {
      String username = authentication.getName();
      postService.deletePostByUser(username, postId);
      return ResponseEntity.noContent().build();
   }

   // Delete all posts
   @DeleteMapping("/delete-all")
   public ResponseEntity<Void> deleteAllPosts() {
      postService.deleteAllPosts();
      return ResponseEntity.noContent().build();
   }

}

// @GetMapping("/excluded/")
// public ResponseEntity<List<GetPostResponseDto>> getAllPostsExcludingTheCurrentUser() {
//    try {
//       // Get the authenticated username from SecurityHolder
//       Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//       if (authentication == null || !authentication.isAuthenticated()
//             || "anonymousUser".equals(authentication.getName())) {
//          return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//       }
//       List<GetPostResponseDto> includedPosts = new ArrayList<>();
//       List<GetPostResponseDto> allPosts = postService.getAllPosts();
//       String username = authentication.getName();
//       for (GetPostResponseDto post : allPosts) {
//          if (!post.getUsername().equals(username)) {
//             includedPosts.add(post);
//          } else {
//             includedPosts.add(null);
//          }
//       }
//       return ResponseEntity.status(HttpStatus.OK).body(includedPosts);

//    } catch (Exception e) {
//       return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//    }
// }