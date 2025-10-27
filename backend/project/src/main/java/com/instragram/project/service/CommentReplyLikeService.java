package com.instragram.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.CommentReply;
import com.instragram.project.model.CommentReplyLike;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentReplyLikeRepository;
import com.instragram.project.repository.CommentReplyRepository;

import jakarta.transaction.Transactional;

@Service
public class CommentReplyLikeService {

   @Autowired
   private AppUserRepository appUserRepository;

   @Autowired
   private CommentReplyRepository commentReplyRepository;

   @Autowired
   private CommentReplyLikeRepository commentReplyLikeRepository;

   @Transactional
   public void toggleLike(String username, Long commentReplyId) {
      AppUser user = appUserRepository.findByUsername(username);
      CommentReply commentReply = commentReplyRepository.findById(commentReplyId)
            .orElseThrow(() -> new RuntimeException("Comment reply not found with id: " + commentReplyId));

      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      // Check if user already liked the comment reply
      if (commentReplyLikeRepository.existsByAppUserAndCommentReply(user, commentReply)) {
         // Unlike it
         commentReplyLikeRepository.deleteByAppUserAndCommentReply(user, commentReply);
      } else {
         CommentReplyLike like = new CommentReplyLike();
         like.setAppUser(user);
         like.setCommentReply(commentReply);
         commentReplyLikeRepository.save(like);
      }
   }

   // Get like count for a comment reply
   public Long getLikeCount(Long commentReplyId) {
      CommentReply commentReply = commentReplyRepository.findById(commentReplyId)
            .orElseThrow(() -> new RuntimeException("Comment reply not found with id: " + commentReplyId));
      return commentReplyLikeRepository.countByCommentReply(commentReply);
   }

   // Get all likes by a user
   public List<CommentReplyLike> getLikesByUser(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      return commentReplyLikeRepository.findByAppUser(user);
   }

   // Check if a user liked a comment reply
   public boolean isLikedByUser(String username, Long commentReplyId) {
      AppUser appUser = appUserRepository.findByUsername(username);
      CommentReply commentReply = commentReplyRepository.findById(commentReplyId)
            .orElseThrow(() -> new RuntimeException("Comment reply not found with id: " + commentReplyId));

      return commentReplyLikeRepository.existsByAppUserAndCommentReply(appUser, commentReply);
   }

}