package com.instragram.project.service;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.instragram.project.dto.post.request.CreatePostRequest;
import com.instragram.project.dto.post.request.EditPostWithUploadRequest;
import com.instragram.project.dto.post.request.EditPostWithUrlRequest;
import com.instragram.project.dto.post.response.GetPostResponse;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Post;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.PostRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PostService {

   private final PostRepository postRepository;

   private final AppUserRepository appUserRepository;


   private final MappingMethods mappingMethods;

   public PostService(PostRepository postRepository, AppUserRepository appUserRepository, MappingMethods mappingMethods) {
      this.postRepository = postRepository;
      this.appUserRepository = appUserRepository;
      this.mappingMethods = mappingMethods;
      
   }

   // Create Post
   public void createPostWithUrl(CreatePostRequest requestDto, String username) {
      // Fail fast if the user does not exist; the mapper resolves the entity itself.
      getUserOrThrow(username);

      // Convert post request to entity
      Post post = mappingMethods.convertCreatePostRequestToPostEntity(requestDto, username);

      // Save entity
      postRepository.save(post);
   }

   // Create Post with uploaded image
   @Transactional
   public void createPostWithUpload(String description, MultipartFile image, String username) {
      AppUser appUser = getUserOrThrow(username);

      if (image == null || image.isEmpty()) {
         throw new RuntimeException("Image file is required");
      }

      try {

         Post post = new Post();
         post.setDescription(description);
         post.setAppUser(appUser);
         post.setImageName(image.getOriginalFilename());
         post.setImageType(image.getContentType());
         post.setImageSize(image.getSize());
         post.setImageData(image.getBytes());

         postRepository.save(post); // Save first to get the ID

         post.setImageUrl("http://localhost:8080/api/instagram/posts/" + post.getId() + "/image");
         postRepository.save(post); // Save again to persist the URL

      } catch (IOException ex) {
         throw new RuntimeException("Failed to save uploaded image", ex);
      }
   }

   /**
    * Get a page of the posts of a private account that is followed by the current user.
    * The {@code Pageable} carries the page number, size and sort, and the returned
    * {@link Page} carries the total count so the caller can render pagination controls.
    */
   public Page<GetPostResponse> getPostsByPrivateAccountTheUserFollows(String followerUsername,
         String privateAccountUsername, Pageable pageable) {
      return postRepository
            .findPrivateAccountPostsIfFollowing(followerUsername, privateAccountUsername, pageable)
            .map(mappingMethods::convertPostEntityToGetPostResponse);
   }

   // Get Post By Id
   public GetPostResponse getPostById(Long id) {
      Post post = getPostOrThrow(id);
      return mappingMethods.convertPostEntityToGetPostResponse(post);
   }

   /**
    * Get a page of a user's posts.
    * <p>
    * Maps each post directly rather than going through the by-username list mapper: the query
    * already restricts to {@code username}, so that mapper's extra filter is a no-op here — and
    * filtering after the page is fetched would make the page contents disagree with the count.
    */
   public Page<GetPostResponse> getPostsByUsername(String username, Pageable pageable) {
      return postRepository
            .findByAppUserUsername(username, pageable)
            .map(mappingMethods::convertPostEntityToGetPostResponse);
   }

   // Get a page of all posts excluding the given user's own
   public Page<GetPostResponse> getAllPostsExcludingUser(String username, Pageable pageable) {
      return postRepository
            .findAllPostsExceptByCurrentUser(username, pageable)
            .map(mappingMethods::convertPostEntityToGetPostResponse);
   }

   // Get a page of the posts liked by a specified user
   public Page<GetPostResponse> getPostslikedByUser(String username, Pageable pageable) {
      getUserOrThrow(username);
      return postRepository
            .findPostsLikedByUser(username, pageable)
            .map(mappingMethods::convertPostEntityToGetPostResponse);
   }

   // Get a page of the posts saved by a specified user
   public Page<GetPostResponse> getPostsSavedByUser(String username, Pageable pageable) {
      getUserOrThrow(username);
      return postRepository
            .findPostsSavedByUser(username, pageable)
            .map(mappingMethods::convertPostEntityToGetPostResponse);
   }

   // Get a page of the posts by the users that a user follows
   public Page<GetPostResponse> getPostsByFollowings(Long id, Pageable pageable) {
      getUserOrThrow(id);
      return postRepository
            .findPostsByFollowing(id, pageable)
            .map(mappingMethods::convertPostEntityToGetPostResponse);
   }

   // Get posts count
   public long getPostCount(String username) {

      getUserOrThrow(username);

      return postRepository.countByAppUserUsername(username);
   }

   // Update/Edit a post with upload
   public void updatePostWithUrl(Long postId, EditPostWithUrlRequest requestDto, String username)
         throws IOException {
      AppUser appUser = getUserOrThrow(username);
      Post oldPost = getPostOrThrow(postId);
      LocalDateTime now = LocalDateTime.now();

      if (oldPost.getAppUser() != appUser || !oldPost.getAppUser().getUsername().equals(username)) {
         throw new RuntimeException("You do not have permission to update this post");
      }

      oldPost.setDescription(requestDto.getDescription());
      oldPost.setImageUrl(requestDto.getImageUrl());
      oldPost.setUpdatedAt(now);
      postRepository.save(oldPost);

   }

   // Update/Edit a post with upload
   public void updatePostWithUpload(Long postId, EditPostWithUploadRequest requestDto, String username)
         throws IOException {
      AppUser appUser = getUserOrThrow(username);
      Post oldPost = getPostOrThrow(postId);
      LocalDateTime now = LocalDateTime.now();

      if (oldPost.getAppUser() != appUser || !oldPost.getAppUser().getUsername().equals(username)) {
         throw new RuntimeException("You do not have permission to update this post");
      }

      oldPost.setDescription(requestDto.getDescription());
      oldPost.setImageData(requestDto.getImage().getBytes());
      oldPost.setImageName(requestDto.getImage().getOriginalFilename());
      oldPost.setImageSize(requestDto.getImage().getSize());
      oldPost.setImageType(requestDto.getImage().getContentType());
      oldPost.setImageUrl("http://localhost:8080/api/instagram/posts/" + postId + "/image");
      oldPost.setUpdatedAt(now);
      postRepository.save(oldPost);

   }

   // Delete Post by id
   public void deletePost(Long postId) {

      Post post = getPostOrThrow(postId);

      postRepository.delete(post);
   }

   // Delete Post By User
   @Transactional
   public void deletePostByUser(String username, Long postId) {
      Post post = getPostOrThrow(postId);

      // User2 : John logs in       
      // John tries to delete User1 Bob post            
      // post.getAppUser().getUsername() = User1.getUsername() : Bob
      // bob!=John => Exception
      // User2 cant delete User1 posts
      if (!post.getAppUser().getUsername().equals(username)) {
         throw new RuntimeException("You do not have permission to delete this post");
      }
      // 1. Authentication: Get logged-in user (user2)
      // 2. Authorization: Check if post owner == logged-in user
      // 3. If different → FORBIDDEN (403) response
      // 4. If same → Delete the post
      postRepository.delete(post);
   }

   // Delete all posts
   public void deleteAllPosts() {
      postRepository.deleteAll();
   }

   @Transactional
   public byte[] getPostImageBytes(Long postId) {
      Post post = getPostOrThrow(postId);
      if (post.getImageData() == null) {
         throw new NotFoundException("No image data is stored for post " + postId + ".");
      }
      return post.getImageData();
   }

   @Transactional
   public String getPostImageContentType(Long postId) {
      Post post = getPostOrThrow(postId);
      return post.getImageType() != null ? post.getImageType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
   }

   // Search post by description (not case sensitive), one page at a time
   public Page<GetPostResponse> getPostsByDescription(String description, Pageable pageable) {
      return postRepository
            .findByDescriptionContaining(description, pageable)
            .map(mappingMethods::convertPostEntityToGetPostResponse);
   }

   private AppUser getUserOrThrow(String username) {
      return appUserRepository.findByUsername(username)
            .orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
   }

   private AppUser getUserOrThrow(Long id) {
      return appUserRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User with id " + id + " was not found."));
   }

   private Post getPostOrThrow(Long id) {
      return postRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Post with id " + id + " was not found."));
   }

}
