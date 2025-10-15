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

   // Delete the comment
   public void deleteComment(Long commentId) {

      Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

      commentRepository.delete(comment);
   }

   // Get number of comments on a post
   public long getCommentCount(Long postId) {
      return commentRepository.countByPostId(postId);
   }

}
