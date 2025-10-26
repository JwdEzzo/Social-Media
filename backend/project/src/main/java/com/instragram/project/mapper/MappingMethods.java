package com.instragram.project.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.instragram.project.dto.request.CreatePostRequestDto;
import com.instragram.project.dto.request.SignUpRequestDto;
import com.instragram.project.dto.request.WriteCommentRequestDto;
import com.instragram.project.dto.request.WriteReplyRequestDto;
import com.instragram.project.dto.response.GetCommentResponseDto;
import com.instragram.project.dto.response.GetPostResponseDto;
import com.instragram.project.dto.response.GetReplyResponseDto;
import com.instragram.project.dto.response.GetUserResponseDto;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Comment;
import com.instragram.project.model.CommentReply;
import com.instragram.project.model.Post;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentRepository;
import com.instragram.project.repository.PostRepository;

@Component
public class MappingMethods {

   @SuppressWarnings("unused")
   private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

   @Autowired
   private AppUserRepository appUserRepository;

   @Autowired
   private PostRepository postRepository;

   @Autowired
   private CommentRepository commentRepository;

   // Convert SignUpRequestDto to AppUser Entity
   public AppUser convertSignUpRequestToAppUserEntity(SignUpRequestDto requestDto) {
      AppUser appUser = new AppUser();
      appUser.setEmail(requestDto.getEmail());
      appUser.setUsername(requestDto.getUsername());
      appUser.setPassword(encoder.encode(requestDto.getPassword()));
      return appUser;
   }

   // Convert Post Entity to GetPostResponseDto
   public GetPostResponseDto convertPostEnttityToGetPostResponseDto(Post post) {
      GetPostResponseDto responseDto = new GetPostResponseDto();
      responseDto.setId(post.getId());
      responseDto.setUsername(post.getAppUser().getUsername());
      responseDto.setProfilePictureUrl(post.getAppUser().getProfilePictureUrl());

      // If imageUrl is null (uploaded image), use the serving endpoint
      if (post.getImageUrl() == null && post.getImageData() != null) {
         responseDto.setImageUrl("http://localhost:8080/api/instagram/posts/" + post.getId() + "/image");
      } else {
         responseDto.setImageUrl(post.getImageUrl());
      }

      responseDto.setDescription(post.getDescription());
      responseDto.setCreatedAt(post.getCreatedAt());
      responseDto.setUpdatedAt(post.getUpdatedAt());
      return responseDto;
   }

   // Convert List<Post> to List<GetPostResponseDto> responseDtos; 
   public List<GetPostResponseDto> convertListPostEntityToListGetPostResponseDto(List<Post> posts) {
      return posts
            .stream()
            .map(this::convertPostEnttityToGetPostResponseDto)
            .collect(Collectors.toList());
   }

   // Convert AppUser to GetUserResponseDto
   public GetUserResponseDto convertAppUserEntityToGetUserResponse(AppUser appUser) {
      GetUserResponseDto responseDto = new GetUserResponseDto();
      responseDto.setId(appUser.getId());
      responseDto.setUsername(appUser.getUsername());
      responseDto.setBioText(appUser.getBioText());
      responseDto.setProfilePictureUrl(appUser.getProfilePictureUrl());
      responseDto.setCreatedAt(appUser.getCreatedAt());
      responseDto.setUpdatedAt(appUser.getUpdatedAt());
      responseDto.setPosts(convertListPostEntityToListGetPostResponseDto(appUser.getPosts()));
      return responseDto;
   }

   // Convert CreatePostRequestDto to Post Entity
   public Post convertCreatePostRequestDtoToPostEntity(CreatePostRequestDto requestDto, String username) {
      Post post = new Post();
      post.setImageUrl(requestDto.getImageUrl());
      post.setDescription(requestDto.getDescription());
      post.setAppUser(appUserRepository.findByUsername(username));
      return post;
   }

   // Convert List<Post> to List<GetPostResponseDto> responseDtos by username; 
   public List<GetPostResponseDto> convertListPostEntityToListGetPostResponseDtoByUsername(List<Post> posts,
         String username) {
      return posts
            .stream()
            .filter(post -> post.getAppUser().getUsername().equals(username))
            .map(this::convertPostEnttityToGetPostResponseDto)
            .collect(Collectors.toList());
   }

   // Convert WriteCommentRequestDto to Comment Entity
   public Comment convertWriteCommentRequestDtoToCommentEntity(String username, WriteCommentRequestDto requestDto) {
      AppUser appUser = appUserRepository.findByUsername(username);
      Post post = postRepository.findById(requestDto.getPostId()).get();

      Comment comment = new Comment();
      comment.setContent(requestDto.getContent());
      comment.setAppUser(appUser);
      comment.setPost(post);

      return comment;
   }

   // Convert Comment Entity to GetCommentResponseDto
   public GetCommentResponseDto convertCommentEntityToGetCommentResponseDto(Comment comment) {
      GetCommentResponseDto responseDto = new GetCommentResponseDto();
      responseDto.setId(comment.getId());
      responseDto.setContent(comment.getContent());
      responseDto.setCreatedAt(comment.getCreatedAt());
      responseDto.setAppUser(convertAppUserEntityToGetUserResponse(comment.getAppUser()));
      return responseDto;
   }

   // Convert List<Comment> to List<GetCommentResponseDto> responseDtos; 
   public List<GetCommentResponseDto> convertListCommentEntityToListGetCommentResponseDto(List<Comment> comments) {
      return comments
            .stream()
            .map(this::convertCommentEntityToGetCommentResponseDto)
            .collect(Collectors.toList());
   }

   // Convert WriteReplyRequestDto to CommentReply Entity 
   public CommentReply convertWriteReplyRequestDtoToCommentReplyEntity(String username,
         WriteReplyRequestDto requestDto) {
      AppUser appUser = appUserRepository.findByUsername(username);
      Comment comment = commentRepository.findById(requestDto.getCommentId()).get();

      CommentReply commentReply = new CommentReply();
      commentReply.setContent(requestDto.getContent());
      commentReply.setAppUser(appUser);
      commentReply.setComment(comment);

      return commentReply;
   }

   // Convert CommentReply Entity to GetCommentReplyResponseDto
   public GetReplyResponseDto convertCommentReplyEntityToGetCommentReplyResponseDto(CommentReply commentReply) {
      GetReplyResponseDto responseDto = new GetReplyResponseDto();
      responseDto.setId(commentReply.getId());
      responseDto.setContent(commentReply.getContent());
      responseDto.setCreatedAt(commentReply.getCreatedAt());
      responseDto.setAppUser(convertAppUserEntityToGetUserResponse(commentReply.getAppUser()));
      return responseDto;
   }

   // Convert List<CommentReply> to List<GetCommentReplyResponseDto> responseDtos; 
   public List<GetReplyResponseDto> convertListCommentReplyEntityToListGetCommentReplyResponseDto(
         List<CommentReply> commentReplies) {
      return commentReplies
            .stream()
            .map(this::convertCommentReplyEntityToGetCommentReplyResponseDto)
            .collect(Collectors.toList());
   }
}
