package com.instragram.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

   // Logger

   // POST: create post
   // Try getting the authentication using SecurityContextHolder
   // if authentication is null or not authenticated, return UNAUTHORIZED
   // get username from authentication.getName
   // call postService.createPost
   // catch runtime exception and return NOT_FOUND
   // catch any exception and return INTERNAL_SERVER_ERROR
   @PostMapping("/create-post")
   public ResponseEntity<Void> createPost(@RequestBody CreatePostRequestDto requestDto) {
      try {
         String username = getAuthenticatedUsername();
         postService.createPost(requestDto, username);
         return ResponseEntity.noContent().build();
      } catch (RuntimeException e) {
         if (e.getMessage().contains("authenticated")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
         } else if (e.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
         }
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // GET : Get all posts
   @GetMapping
   public ResponseEntity<List<GetPostResponseDto>> getAllPosts() {
      try {

         List<GetPostResponseDto> responseDtos = postService.getAllPosts();
         return ResponseEntity.status(HttpStatus.OK).body(responseDtos);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // GET : Get post by id
   @GetMapping("/get-by-id/{postId}")
   public ResponseEntity<GetPostResponseDto> getPostById(@PathVariable Long postId) {
      try {
         GetPostResponseDto responseDto = postService.getPostById(postId);
         return ResponseEntity.status(HttpStatus.OK).body(responseDto);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // GET : Get posts by username
   @GetMapping("/{username}")
   public ResponseEntity<List<GetPostResponseDto>> getPostsByUsername(@PathVariable String username) {
      try {
         List<GetPostResponseDto> responseDtos = postService.getPostsByUsername(username);
         return ResponseEntity.status(HttpStatus.OK).body(responseDtos);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   @GetMapping("/excluded")
   public ResponseEntity<List<GetPostResponseDto>> getAllPostsExcludingTheCurrentUser() {
      try {
         String username = getAuthenticatedUsername();
         List<GetPostResponseDto> posts = postService.getAllPostsExcludingUser(username);
         return ResponseEntity.ok(posts);
      } catch (RuntimeException e) {
         if (e.getMessage().contains("authenticated")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
         }
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   @DeleteMapping("/{postId}")
   public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
      try {
         String username = getAuthenticatedUsername();
         postService.deletePostByUser(username, postId);
         return ResponseEntity.noContent().build();
      } catch (RuntimeException e) {
         if (e.getMessage().contains("authenticated")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
         } else if (e.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
         } else if (e.getMessage().contains("permission")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
         }
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Helper method to get authenticated user
   private String getAuthenticatedUsername() {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth == null || !auth.isAuthenticated() ||
            "anonymousUser".equals(auth.getName())) {
         throw new RuntimeException("User not authenticated");
      }
      return auth.getName();
   }

   // Delete all posts
   @DeleteMapping("/delete-all")
   public ResponseEntity<Void> deleteAllPosts() {
      try {
         postService.deleteAllPosts();
         return ResponseEntity.noContent().build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
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