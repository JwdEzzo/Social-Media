package com.instragram.project.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.instragram.project.dto.request.CreatePostRequestDto;
import com.instragram.project.dto.request.EditPostWithUploadRequestDto;
import com.instragram.project.dto.request.EditPostWithUrlRequestDto;
import com.instragram.project.dto.response.GetPostResponseDto;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Post;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.PostRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PostService {

   @Autowired
   private PostRepository postRepository;

   @Autowired
   private AppUserRepository appUserRepository;

   @Autowired
   private final MappingMethods mappingMethods = new MappingMethods();

   // Create Post
   public void createPostWithUrl(CreatePostRequestDto requestDto, String username) {
      // Get the AppUser entity from username
      AppUser appUser = appUserRepository.findByUsername(username);

      if (appUser == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      // Convert post request to entity
      Post post = mappingMethods.convertCreatePostRequestDtoToPostEntity(requestDto, username);

      // Save entity
      postRepository.save(post);
   }

   // Create Post with uploaded image
   @Transactional
   public void createPostWithUpload(String description, MultipartFile image, String username) {
      AppUser appUser = appUserRepository.findByUsername(username);
      if (appUser == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

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

   // Get All Posts
   public List<GetPostResponseDto> getAllPosts() {
      List<Post> posts = postRepository.findAll();
      return mappingMethods.convertListPostEntityToListGetPostResponseDto(posts);
   }

   // Get Post By Id
   public GetPostResponseDto getPostById(Long id) {
      Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
      return mappingMethods.convertPostEnttityToGetPostResponseDto(post);
   }

   // Get Posts by username
   public List<GetPostResponseDto> getPostsByUsername(String username) {
      List<Post> posts = postRepository.findByAppUserUsername(username);
      return mappingMethods.convertListPostEntityToListGetPostResponseDtoByUsername(posts, username);
   }

   // Get All Posts Excluding User
   public List<GetPostResponseDto> getAllPostsExcludingUser(String username) {
      List<Post> posts = postRepository.findAllPostsExceptByCurrentUser(username);
      return mappingMethods.convertListPostEntityToListGetPostResponseDto(posts);
   }

   // Get all Posts liked by a specified user 
   public List<GetPostResponseDto> getPostslikedByUser(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }
      List<Post> likedPosts = postRepository.findPostsLikedByUser(username);
      return mappingMethods.convertListPostEntityToListGetPostResponseDto(likedPosts);
   }

   // Get all Posts by users followers
   public List<GetPostResponseDto> getPostsByFollowings(Long id) {
      AppUser user = appUserRepository.findById(id).get();
      if (user == null) {
         throw new RuntimeException("User not found with id: " + id);
      }
      List<Post> followingPosts = postRepository.findPostsByFollowing(id);
      return mappingMethods.convertListPostEntityToListGetPostResponseDto(followingPosts);
   }

   // Get posts count
   public long getPostCount(String username) {

      AppUser user = appUserRepository.findByUsername(username);

      if (user == null) {
         throw new RuntimeException("User not found: " + username);
      }

      return postRepository.countByAppUserUsername(username);
   }

   // Update/Edit a post with upload
   public void updatePostWithUrl(Long postId, EditPostWithUrlRequestDto requestDto, String username)
         throws IOException {
      AppUser appUser = appUserRepository.findByUsername(username);
      Post oldPost = postRepository.findById(postId).get();
      LocalDateTime now = LocalDateTime.now();
      if (oldPost == null) {
         throw new RuntimeException("Post not found with id: " + postId);
      }

      if (appUser == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      if (oldPost.getAppUser() != appUser || !oldPost.getAppUser().getUsername().equals(username)) {
         throw new RuntimeException("You do not have permission to update this post");
      }

      oldPost.setDescription(requestDto.getDescription());
      oldPost.setImageUrl(requestDto.getImageUrl());
      oldPost.setUpdatedAt(now);
      postRepository.save(oldPost);

   }

   // Update/Edit a post with upload
   public void updatePostWithUpload(Long postId, EditPostWithUploadRequestDto requestDto, String username)
         throws IOException {
      AppUser appUser = appUserRepository.findByUsername(username);
      Post oldPost = postRepository.findById(postId).get();
      LocalDateTime now = LocalDateTime.now();
      if (oldPost == null) {
         throw new RuntimeException("Post not found with id: " + postId);
      }

      if (oldPost == null) {
         throw new RuntimeException("Post not found with id: " + postId);
      }

      if (appUser == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

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

      if (postRepository.findById(postId) == null) {
         throw new RuntimeException("Post not found with id: " + postId);

      }

      postRepository.deleteById(postId);
   }

   // Delete Post By User
   @Transactional
   public void deletePostByUser(String username, Long postId) {
      Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

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
      Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
      if (post.getImageData() == null) {
         throw new RuntimeException("No image data stored for post: " + postId);
      }
      return post.getImageData();
   }

   @Transactional
   public String getPostImageContentType(Long postId) {
      Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
      return post.getImageType() != null ? post.getImageType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
   }

}
