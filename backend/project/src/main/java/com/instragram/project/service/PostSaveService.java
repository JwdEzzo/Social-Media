package com.instragram.project.service;

import java.util.List;

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
   private final PostSaveRepository postSaveRepository;

   private final AppUserRepository appUserRepository;

   private final PostRepository postRepository;

   public PostSaveService(PostSaveRepository postSaveRepository, AppUserRepository appUserRepository,
         PostRepository postRepository) {
      this.postSaveRepository = postSaveRepository;
      this.appUserRepository = appUserRepository;
      this.postRepository = postRepository;
   }

   // Toggle PostSave
   @Transactional
   public void toggleSave(String username, Long postId) {
      AppUser user = appUserRepository.findByUsername(username);
      Post post = postRepository.findById(postId).get();

      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      if (postSaveRepository.existsByAppUserAndPost(user, post)) {
         postSaveRepository.deleteByAppUserAndPost(user, post);
      } else {
         PostSave save = new PostSave();
         save.setAppUser(user);
         save.setPost(post);
         postSaveRepository.save(save);
      }

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