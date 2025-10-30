package com.instragram.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Post;
import com.instragram.project.model.PostSave;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.PostRepository;
import com.instragram.project.repository.PostSaveRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PostSaveService {

   // Same as postlike
   @Autowired
   private PostSaveRepository postSaveRepository;

   @Autowired
   private AppUserRepository appUserRepository;

   @Autowired
   private PostRepository postRepository;

   // Toggle PostSave
   @Transactional
   public void toggleSave(String username, Long postId) {
      log.info("Toggle save: username={}, postId={}", username, postId);
      AppUser user = appUserRepository.findByUsername(username);
      Post post = postRepository.findById(postId).get();

      if (user == null) {
         log.error("User not found with username: {}", username);
         throw new RuntimeException("User not found with username: " + username);
      }

      if (postSaveRepository.existsByAppUserAndPost(user, post)) {
         log.info("Unsave post: username={}, postId={}", username, postId);
         postSaveRepository.deleteByAppUserAndPost(user, post);
      } else {
         log.info("Save post: username={}, postId={}", username, postId);
         PostSave save = new PostSave();
         save.setAppUser(user);
         save.setPost(post);
         postSaveRepository.save(save);
      }
      log.info("Toggle save finished successfully");

   }

   // Get save count for a post
   public Long getSaveCount(Long postId) {
      Post post = postRepository.findById(postId).get();
      return postSaveRepository.countByPost(post);
   }

   // Get all saves by a user
   public List<PostSave> getSavesByUser(String username) {
      AppUser user = appUserRepository.findByUsername(username);

      if (user == null) {
         throw new RuntimeException("User not found");
      }

      return postSaveRepository.findByAppUser(user);
   }

   // Check if a user saved a post
   public boolean isSavedByUser(String username, Long postId) {
      AppUser user = appUserRepository.findByUsername(username);
      Post post = postRepository.findById(postId).get();

      return postSaveRepository.existsByAppUserAndPost(user, post);
   }
}