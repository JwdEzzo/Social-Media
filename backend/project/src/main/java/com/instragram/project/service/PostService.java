package com.instragram.project.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

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
      Post post = mappingMethods.convertCreatePostRequestDtoToPostEntity(requestDto, username);

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

   // Get Posts from a private account that is followed by the current user
   public List<GetPostResponse> getPostsByPrivateAccountTheUserFollows(String followerUsername, String privateAccountUsername) {
      List<Post> posts = postRepository.findPrivateAccountPostsIfFollowing(followerUsername, privateAccountUsername);
      return mappingMethods.convertListPostEntityToListGetPostResponseDto(posts);
   }

   // Get Post By Id
   public GetPostResponse getPostById(Long id) {
      Post post = getPostOrThrow(id);
      return mappingMethods.convertPostEnttityToGetPostResponseDto(post);
   }

   // Get Posts by username
   public List<GetPostResponse> getPostsByUsername(String username) {
      List<Post> posts = postRepository.findByAppUserUsername(username);
      return mappingMethods.convertListPostEntityToListGetPostResponseDtoByUsername(posts, username);
   }

   // Get All Posts Excluding User
   public List<GetPostResponse> getAllPostsExcludingUser(String username) {
      List<Post> posts = postRepository.findAllPostsExceptByCurrentUser(username);
      return mappingMethods.convertListPostEntityToListGetPostResponseDto(posts);
   }

   // Get all Posts liked by a specified user 
   public List<GetPostResponse> getPostslikedByUser(String username) {
      getUserOrThrow(username);
      List<Post> likedPosts = postRepository.findPostsLikedByUser(username);
      return mappingMethods.convertListPostEntityToListGetPostResponseDto(likedPosts);
   }

   // Get all posts saved by a specified user
   public List<GetPostResponse> getPostsSavedByUser(String username) {
      getUserOrThrow(username);
      List<Post> savedPosts = postRepository.findPostsSavedByUser(username);
      return mappingMethods.convertListPostEntityToListGetPostResponseDto(savedPosts);
   }

   // Get all Posts by users followers
   public List<GetPostResponse> getPostsByFollowings(Long id) {
      getUserOrThrow(id);
      List<Post> followingPosts = postRepository.findPostsByFollowing(id);
      return mappingMethods.convertListPostEntityToListGetPostResponseDto(followingPosts);
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

   // Search post by description (not case sensitive)
   public List<GetPostResponse> getPostsByDescription(String description) {
      List<Post> foundPosts = postRepository.findByDescriptionContaining(description);
      List<GetPostResponse> postResponseDtos = mappingMethods
            .convertListPostEntityToListGetPostResponseDto(foundPosts);
      return postResponseDtos;
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
