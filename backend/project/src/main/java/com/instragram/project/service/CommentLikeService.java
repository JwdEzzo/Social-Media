package com.instragram.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Comment;
import com.instragram.project.model.CommentLike;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentLikeRepository;
import com.instragram.project.repository.CommentRepository;

import jakarta.transaction.Transactional;

@Service
public class CommentLikeService {

   @Autowired
   private AppUserRepository appUserRepository;

   @Autowired
   private CommentRepository commentRepository;

   @Autowired
   private CommentLikeRepository commentLikeRepository;

   @Transactional
   public void toggleLike(String username, Long commentId) {
      AppUser user = appUserRepository.findByUsername(username);
      Comment comment = commentRepository.findById(commentId).get();

      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      // Check if user already liked the post
      if (commentLikeRepository.existsByAppUserAndComment(user, comment)) {
         // Unlike it
         commentLikeRepository.deleteByAppUserAndComment(user, comment);
      } else {
         CommentLike like = new CommentLike();
         like.setAppUser(user);
         like.setComment(comment);
         commentLikeRepository.save(like);
      }
   }

   // Get like count for a comment
   public Long getLikeCount(Long commentId) {
      Comment comment = commentRepository.findById(commentId).get();
      return commentLikeRepository.countByComment(comment);
   }

   // Get all likes by a user
   public List<CommentLike> getLikesByUser(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found");
      }

      return commentLikeRepository.findByAppUser(user);
   }

   // Check if a user liked a post
   public boolean isLikedByUser(String username, Long commentId) {
      AppUser appUser = appUserRepository.findByUsername(username);
      Comment comment = commentRepository.findById(commentId).get();

      return commentLikeRepository.existsByAppUserAndComment(appUser, comment);
   }

}
