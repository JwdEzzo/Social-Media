package com.instragram.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

   @Autowired
   private PostLikeRepository postLikeRepository;

   @Autowired
   private AppUserRepository appUserRepository;

   @Autowired
   private PostRepository postRepository;

   // Toggle PostLike
   @Transactional
   public void toggleLike(String username, Long postId) {
      log.info("Toggle like for post with id: {}, and user: {}", postId, username);
      AppUser user = appUserRepository.findByUsername(username);
      Post post = postRepository.findById(postId).get();

      if (user == null) {
         log.warn("User not found with username: {}", username);
         throw new RuntimeException("User not found with username: " + username);
      }

      // Check if user already liked the post
      if (postLikeRepository.existsByAppUserAndPost(user, post)) {
         // Unlike it:
         postLikeRepository.deleteByAppUserAndPost(user, post);
      } else {
         // Create Like:
         PostLike like = new PostLike();
         like.setAppUser(user);
         like.setPost(post);
         postLikeRepository.save(like);
      }
   }

   // Get like count for a post
   public Long getLikeCount(Long postId) {
      Post post = postRepository.findById(postId).get();
      return postLikeRepository.countByPost(post);
   }

   // Get all likes by a user
   public List<PostLike> getLikesByUser(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found");
      }

      return postLikeRepository.findByAppUser(user);
   }

   // Check if a user liked a post
   public boolean isLikedByUser(String username, Long postId) {
      AppUser appUser = appUserRepository.findByUsername(username);
      Post post = postRepository.findById(postId).get();

      return postLikeRepository.existsByAppUserAndPost(appUser, post);
   }

}
