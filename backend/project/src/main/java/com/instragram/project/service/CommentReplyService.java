package com.instragram.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.instragram.project.dto.request.WriteReplyRequestDto;
import com.instragram.project.dto.response.GetReplyResponseDto;
import com.instragram.project.mapper.MappingMethods; // You might want to create a specific DTO
import com.instragram.project.model.AppUser;
import com.instragram.project.model.CommentReply;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentReplyRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CommentReplyService {

   @Autowired
   private CommentReplyRepository commentReplyRepository;

   @Autowired
   private AppUserRepository appUserRepository;

   @Autowired
   private MappingMethods mappingMethods;

   // Create Comment Reply
   public void createCommentReply(WriteReplyRequestDto requestDto, String username) {
      AppUser appUser = appUserRepository.findByUsername(username);

      if (appUser == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      if (requestDto.getCommentId() == null) {
         throw new RuntimeException("Comment doesnt exist");
      }

      CommentReply commentReply = mappingMethods.convertWriteReplyRequestDtoToCommentReplyEntity(username, requestDto);

      commentReplyRepository.save(commentReply);
   }

   // Get All Replies to a Comment
   public List<GetReplyResponseDto> findByCommentId(Long commentId) {
      List<CommentReply> commentReplies = commentReplyRepository.findByCommentId(commentId);
      return mappingMethods.convertListCommentReplyEntityToListGetCommentReplyResponseDto(commentReplies);
   }

   // Delete the comment reply
   public void deleteCommentReply(Long commentReplyId) {
      CommentReply commentReply = commentReplyRepository.findById(commentReplyId)
            .orElseThrow(() -> new RuntimeException("Comment reply not found with id: " + commentReplyId));

      commentReplyRepository.delete(commentReply);
   }

   // Get number of replies to a comment
   public long getReplyCount(Long commentId) {
      return commentReplyRepository.countByCommentId(commentId);
   }

}