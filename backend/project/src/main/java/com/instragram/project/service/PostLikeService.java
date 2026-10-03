package com.instragram.project.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;

import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Post;
import com.instragram.project.model.PostLike;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.PostLikeRepository;
import com.instragram.project.repository.PostRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PostLikeService {

   private final PostLikeRepository postLikeRepository;

   private final AppUserRepository appUserRepository;

   private final PostRepository postRepository;

   private final NotificationService notificationService;
   
   public PostLikeService(PostLikeRepository postLikeRepository, AppUserRepository appUserRepository,
         PostRepository postRepository, NotificationService notificationService) {
      this.postLikeRepository = postLikeRepository;
      this.appUserRepository = appUserRepository;
      this.postRepository = postRepository;
      this.notificationService = notificationService;
   }
   

   // Toggle PostLike
   @Transactional
   public void toggleLike(String username, Long postId) {
      AppUser user = getUserOrThrow(username);
      Post post = getPostOrThrow(postId);


      // Check if user already liked the post
      if (postLikeRepository.existsByAppUserAndPost(user, post)) {
         // Unlike it:
         postLikeRepository.deleteByAppUserAndPost(user, post);

         // Delete the notification that was created when the like was added
        notificationService.deleteEntityNotification(
                post.getAppUser().getId(),  // recipient — the post owner
                user.getId(),               // sender — the person who liked
                NotificationType.POST_LIKE,
                postId
        );
      } else {
         // Create Like:
         PostLike like = new PostLike();
         like.setAppUser(user);
         like.setPost(post);
         postLikeRepository.save(like);

         // Then notify the post owner
         notificationService.createNotification(
            post.getAppUser(), // recipient - the post owner
            user, // sender - the person liking
            NotificationType.POST_LIKE,
            postId // entityId - for the frontend to link to the post
         );
      }
   }

   // Get like count for a post
   public Long getLikeCount(Long postId) {
      Post post = getPostOrThrow(postId);
      return postLikeRepository.countByPost(post);
   }

   /**
    * Get a page of the likes a user has left on posts.
    * The {@code Pageable} carries the page number, size and sort, and the returned
    * {@link Page} carries the total count so the caller can render pagination controls.
    */
   public Page<PostLike> getLikesByUser(String username, Pageable pageable) {
      AppUser user = getUserOrThrow(username);
      return postLikeRepository.findByAppUser(user, pageable);
   }

   // Check if a user liked a post
   public boolean isLikedByUser(String username, Long postId) {
      AppUser appUser = getUserOrThrow(username);
      Post post = getPostOrThrow(postId);

      return postLikeRepository.existsByAppUserAndPost(appUser, post);
   }

   private AppUser getUserOrThrow(String username) {
      return appUserRepository.findByUsername(username)
            .orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
   }

   private Post getPostOrThrow(Long id) {
      return postRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Post with id " + id + " was not found."));
   }

}
