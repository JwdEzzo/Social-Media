package com.instragram.project.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.instragram.project.dto.request.CreatePostRequestDto;
import com.instragram.project.dto.request.EditPostWithUploadRequestDto;
import com.instragram.project.dto.request.EditPostWithUrlRequestDto;
import com.instragram.project.dto.response.GetPostResponseDto;
import com.instragram.project.model.AppUser;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.service.PostService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/instagram/posts")
@CrossOrigin("*")
@Slf4j
public class PostController {

   @Autowired
   private PostService postService;

   @Autowired
   private AppUserRepository appUserRepository;

   // POST: create post
   @PostMapping("/create-post")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> createPost(@RequestBody CreatePostRequestDto requestDto, Authentication authentication) {
      String username = authentication.getName();
      postService.createPostWithUrl(requestDto, username);
      return ResponseEntity.noContent().build();
   }

   // POST: create post with image upload
   @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> uploadPost(
         @RequestParam("description") String description,
         @RequestParam("image") MultipartFile image,
         Authentication authentication) {
      log.info("Creating post with upload: description={}, image={}, username={}", description,
            image == null ? "null" : image.getOriginalFilename(), authentication.getName());
      String username = authentication.getName();
      postService.createPostWithUpload(description, image, username);
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

   // GET : Get posts excluding the current logged in user
   @GetMapping("/excluded")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<List<GetPostResponseDto>> getAllPostsExcludingTheCurrentUser(Authentication authentication) {
      String username = authentication.getName();
      List<GetPostResponseDto> posts = postService.getAllPostsExcludingUser(username);
      return ResponseEntity.ok(posts);
   }

   // GET : Get all Posts liked by the logged in user
   @GetMapping("/liked-by-me")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<List<GetPostResponseDto>> getPostsLikedByCurrentUser(Authentication authentication) {
      String username = authentication.getName();
      List<GetPostResponseDto> likedPosts = postService.getPostslikedByUser(username);
      return ResponseEntity.ok(likedPosts);
   }

   // GET : Get all Posts saved by the logged in user
   @GetMapping("/saved-by-me")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<List<GetPostResponseDto>> getPostsSavedByCurrentUser(Authentication authentication) {
      String username = authentication.getName();
      List<GetPostResponseDto> savedPosts = postService.getPostsSavedByUser(username);
      return ResponseEntity.ok(savedPosts);
   }

   // GET : Get all Posts liked by the logged in user
   @GetMapping("/my-followers")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<List<GetPostResponseDto>> getFollowingPosts(Authentication authentication) {
      String username = authentication.getName();
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }
      List<GetPostResponseDto> followingPosts = postService.getPostsByFollowings(user.getId());
      return ResponseEntity.ok().body(followingPosts);
   }

   // GET :  Get post count of a user
   @GetMapping("{username}/count")
   public ResponseEntity<Long> getPostCount(@PathVariable String username) {
      long count = postService.getPostCount(username);
      return ResponseEntity.ok(count);
   }

   // GET: serve image bytes for a post
   @GetMapping(value = "/{postId}/image")
   public ResponseEntity<Resource> getPostImage(@PathVariable Long postId) {
      byte[] bytes = postService.getPostImageBytes(postId);
      String contentType = postService.getPostImageContentType(postId);
      ByteArrayResource resource = new ByteArrayResource(bytes);
      return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(bytes.length))
            .contentType(MediaType
                  .parseMediaType(contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE))
            .body(resource);
   }

   // PUT: Update/Edit a post
   @PutMapping("/edit-with-url/{postId}")
   public ResponseEntity<Void> editPostWithUrl(@PathVariable Long postId,
         @RequestBody EditPostWithUrlRequestDto requestDto, Authentication authentication) throws IOException {
      String username = authentication.getName();
      postService.updatePostWithUrl(postId, requestDto, username);
      return ResponseEntity.noContent().build();
   }

   @PutMapping("/edit-with-upload/{postId}")
   public ResponseEntity<Void> editPostWithUpload(@PathVariable Long postId,
         EditPostWithUploadRequestDto requestDto, Authentication authentication) throws IOException {
      String username = authentication.getName();
      postService.updatePostWithUpload(postId, requestDto, username);
      return ResponseEntity.noContent().build();
   }

   // Delete Post By Id
   @DeleteMapping("/delete/{postId}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> deletePost(@PathVariable Long postId, Authentication authentication) {
      String username = authentication.getName();
      postService.deletePostByUser(username, postId);
      return ResponseEntity.noContent().build();
   }

}
