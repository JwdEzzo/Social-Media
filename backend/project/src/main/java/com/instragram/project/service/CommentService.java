package com.instragram.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.instragram.project.dto.request.WriteCommentRequestDto;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Comment;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CommentService {

   @Autowired
   private CommentRepository commentRepository;

   @Autowired
   private AppUserRepository appUserRepository;

   @Autowired
   private MappingMethods mappingMethods;

   // Create Comment
   public void createComment(WriteCommentRequestDto requestDto, String username) {
      AppUser appUser = appUserRepository.findByUsername(username);
      if (appUser == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      Comment comment = mappingMethods.convertWriteCommentRequestDtoToCommentEntity(username, requestDto);
      commentRepository.save(comment);
   }

   // Get All Comments of a Post
   public List<Comment> findByPostId(Long postId) {
      return commentRepository.findByPostId(postId);
   }

   // Update a comment
   public void editComment(Long commentId, String content, String username) {
      Comment comment = commentRepository.findById(commentId).get();
      if (!comment.getAppUser().getUsername().equals(username)) {
         throw new RuntimeException("You do not have permission to update this comment");
      }
      comment.setContent(content);
      commentRepository.save(comment);
   }

   // Delete the comment
   @Transactional
   public void deleteComment(Long commentId, String username) {
      AppUser appUser = appUserRepository.findByUsername(username);
      Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

      if (appUser != comment.getAppUser() && appUser != comment.getPost().getAppUser()) {
         throw new RuntimeException("You do not have permission to delete this comment");
      }

      commentRepository.delete(comment);
   }

   // Get number of comments on a post
   public long getCommentCount(Long postId) {
      return commentRepository.countByPostId(postId);
   }

}
