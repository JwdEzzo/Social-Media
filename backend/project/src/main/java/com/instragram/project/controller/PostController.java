package com.instragram.project.controller;

import java.io.IOException;
import java.util.Optional;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
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

import com.instragram.project.dto.post.request.CreatePostRequest;
import com.instragram.project.dto.post.request.EditPostWithUploadRequest;
import com.instragram.project.dto.post.request.EditPostWithUrlRequest;
import com.instragram.project.dto.post.response.GetPostResponse;
import com.instragram.project.model.AppUser;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.service.PostService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/instagram/posts")
@CrossOrigin("*")
@Slf4j
public class PostController {

   private final PostService postService;

   private final AppUserRepository appUserRepository;

   public PostController(PostService postService, AppUserRepository appUserRepository) {
      this.postService = postService;
      this.appUserRepository = appUserRepository;
   }

   // POST: create post
   @PostMapping("/create-post")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> createPost(@RequestBody CreatePostRequest requestDto, Authentication authentication) {
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
      String username = authentication.getName();
      postService.createPostWithUpload(description, image, username);
      return ResponseEntity.noContent().build();
   }

   // GET : Get posts of a private account followed by the current user , show null to non-followers
   //        paginated — ?page=0&size=20&sort=createdAt,desc
   @GetMapping("/private-account/{privateAccountUsername}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<PagedModel<GetPostResponse>> getPostsByPrivateAccountTheUserFollows(
         @PathVariable String privateAccountUsername,
         @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
         Authentication authentication) {
            String followerUsername = authentication.getName();
            Page<GetPostResponse> posts = postService.getPostsByPrivateAccountTheUserFollows(followerUsername, privateAccountUsername, pageable);
            return ResponseEntity.ok(new PagedModel<>(posts));
   }

   // GET : Get post by id
   @GetMapping("/get-by-id/{postId}")
   public ResponseEntity<GetPostResponse> getPostById(@PathVariable Long postId) {
      GetPostResponse responseDto = postService.getPostById(postId);
      return ResponseEntity.status(HttpStatus.OK).body(responseDto);
   }

   // GET : Get all posts, paginated — ?page=0&size=20&sort=createdAt,desc
   @GetMapping
   public ResponseEntity<PagedModel<GetPostResponse>> getAllPosts(
         @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
      Page<GetPostResponse> posts = postService.getAllPosts(pageable);
      return ResponseEntity.ok(new PagedModel<>(posts));
   }

   // GET : Get posts by username, paginated — ?page=0&size=20&sort=createdAt,desc
   @GetMapping("/{username}")
   public ResponseEntity<PagedModel<GetPostResponse>> getPostsByUsername(
         @PathVariable String username,
         @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
      Page<GetPostResponse> responseDtos = postService.getPostsByUsername(username, pageable);
      return ResponseEntity.status(HttpStatus.OK).body(new PagedModel<>(responseDtos));
   }

   // GET : Get posts excluding the current logged in user, paginated
   @GetMapping("/excluded")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<PagedModel<GetPostResponse>> getAllPostsExcludingTheCurrentUser(
         @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
         Authentication authentication) {
      String username = authentication.getName();
      Page<GetPostResponse> posts = postService.getAllPostsExcludingUser(username, pageable);
      return ResponseEntity.ok(new PagedModel<>(posts));
   }

   // GET : Get all Posts liked by the logged in user, paginated
   @GetMapping("/liked-by-me")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<PagedModel<GetPostResponse>> getPostsLikedByCurrentUser(
         @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
         Authentication authentication) {
      String username = authentication.getName();
      Page<GetPostResponse> likedPosts = postService.getPostslikedByUser(username, pageable);
      return ResponseEntity.ok(new PagedModel<>(likedPosts));
   }

   // GET : Get all Posts saved by the logged in user, paginated
   @GetMapping("/saved-by-me")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<PagedModel<GetPostResponse>> getPostsSavedByCurrentUser(
         @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
         Authentication authentication) {
      String username = authentication.getName();
      Page<GetPostResponse> savedPosts = postService.getPostsSavedByUser(username, pageable);
      return ResponseEntity.ok(new PagedModel<>(savedPosts));
   }

   // GET : Get the feed of posts by the users the logged in user follows, paginated
   @GetMapping("/my-followers")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<PagedModel<GetPostResponse>> getFollowingPosts(
         @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
         Authentication authentication) {
      String username = authentication.getName();
      // Deliberately not the fetch-or-throw-NotFound pattern: an authenticated principal whose
      // row is gone means a stale token, which this endpoint answers with 401, not 404.
      Optional<AppUser> user = appUserRepository.findByUsername(username);
      if (user.isEmpty()) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }
      Page<GetPostResponse> followingPosts = postService.getPostsByFollowings(user.get().getId(), pageable);
      return ResponseEntity.ok().body(new PagedModel<>(followingPosts));
   }

   // GET :  Get post count of a user
   @GetMapping("{username}/count")
   public ResponseEntity<Long> getPostCount(@PathVariable String username) {
      long count = postService.getPostCount(username);
      return ResponseEntity.ok(count);
   }

   // GET : Get posts by searching description, paginated
   @GetMapping("/search-posts/containing/{description}")
   public ResponseEntity<PagedModel<GetPostResponse>> getPostsByDescription(
         @PathVariable String description,
         @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
      Page<GetPostResponse> posts = postService.getPostsByDescription(description, pageable);
      return ResponseEntity.status(HttpStatus.OK).body(new PagedModel<>(posts));
   }

   // GET : serve image bytes for a post
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

   // PUT : Update/Edit a post
   @PutMapping("/edit-with-url/{postId}")
   public ResponseEntity<Void> editPostWithUrl(@PathVariable Long postId,
         @RequestBody EditPostWithUrlRequest requestDto, Authentication authentication) throws IOException {
      String username = authentication.getName();
      postService.updatePostWithUrl(postId, requestDto, username);
      return ResponseEntity.noContent().build();
   }

   @PutMapping("/edit-with-upload/{postId}")
   public ResponseEntity<Void> editPostWithUpload(@PathVariable Long postId,
         EditPostWithUploadRequest requestDto, Authentication authentication) throws IOException {
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
