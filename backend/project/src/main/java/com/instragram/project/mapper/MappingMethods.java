package com.instragram.project.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.instragram.project.dto.comment.request.WriteCommentRequest;
import com.instragram.project.dto.comment.response.GetCommentResponse;
import com.instragram.project.dto.follow.response.FollowRequestResponse;
import com.instragram.project.dto.notification.NotificationResponse;
import com.instragram.project.dto.post.request.CreatePostRequest;
import com.instragram.project.dto.post.response.GetPostResponse;
import com.instragram.project.dto.reply.request.WriteReplyRequest;
import com.instragram.project.dto.reply.response.GetReplyResponse;
import com.instragram.project.dto.security.request.SignUpRequest;
import com.instragram.project.dto.user.request.SearchUserResponse;
import com.instragram.project.dto.user.response.GetUserResponse;
import com.instragram.project.dto.user.response.SignUpResponse;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Comment;
import com.instragram.project.model.CommentReply;
import com.instragram.project.model.FollowRequest;
import com.instragram.project.model.Notification;
import com.instragram.project.model.Post;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentRepository;
import com.instragram.project.repository.PostRepository;
import com.instragram.project.utils.ApiResponse;

@Component
public class MappingMethods {

   private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

   private final AppUserRepository appUserRepository;

   private final PostRepository postRepository;

   private final CommentRepository commentRepository;

   public MappingMethods(AppUserRepository appUserRepository,
         PostRepository postRepository, CommentRepository commentRepository) {
      this.appUserRepository = appUserRepository;
      this.postRepository = postRepository;
      this.commentRepository = commentRepository;
   }

   /**
    * Map to ApiResponse<T> with data and message
    */
   public <T> ApiResponse<T> mapToApiResponse(T data, String message) {
      return ApiResponse.success(data, message);
   }

   // Convert AppUser Entity to CreateUserResponse
   public SignUpResponse convertAppUserEntityToSignUpResponse(AppUser appUser) {
      SignUpResponse response = new SignUpResponse();
      response.setId(appUser.getId());
      response.setUsername(appUser.getUsername());
      response.setEmail(appUser.getEmail());
      response.setCreatedAt(appUser.getCreatedAt());
      return response;
   }

   // Convert SignUpRequest to AppUser Entity
   public AppUser convertSignUpRequestToAppUserEntity(SignUpRequest request) {
      AppUser appUser = new AppUser();
      appUser.setEmail(request.getEmail());
      appUser.setUsername(request.getUsername());
      appUser.setPassword(encoder.encode(request.getPassword()));
      return appUser;
   }

   // Convert Post Entity to GetPostResponse
   public GetPostResponse convertPostEntityToGetPostResponse(Post post) {
      GetPostResponse response = new GetPostResponse();
      response.setId(post.getId());
      response.setUsername(post.getAppUser().getUsername());
      response.setProfilePictureUrl(post.getAppUser().getProfilePictureUrl());

      // If imageUrl is null (uploaded image), use the serving endpoint
      if (post.getImageUrl() == null && post.getImageData() != null) {
         response.setImageUrl("http://localhost:8080/api/instagram/posts/" + post.getId() + "/image");
      } else {
         response.setImageUrl(post.getImageUrl());
      }

      response.setDescription(post.getDescription());
      response.setCreatedAt(post.getCreatedAt());
      response.setUpdatedAt(post.getUpdatedAt());
      return response;
   }

   // Convert List<Post> to List<GetPostResponse> responses; 
   public List<GetPostResponse> convertListPostEntityToListGetPostResponse(List<Post> posts) {
      return posts
            .stream()
            .map(this::convertPostEntityToGetPostResponse)
            .collect(Collectors.toList());
   }

   // Convert AppUser to GetUserresponse
   public GetUserResponse convertAppUserEntityToGetUserResponse(AppUser appUser) {
      GetUserResponse response = new GetUserResponse();
      response.setId(appUser.getId());
      response.setUsername(appUser.getUsername());
      response.setBioText(appUser.getBioText());
      response.setProfilePictureUrl(appUser.getProfilePictureUrl());
      response.setCreatedAt(appUser.getCreatedAt());
      response.setUpdatedAt(appUser.getUpdatedAt());
      response.setAccountStatus(appUser.getAccountStatus());
      response.setPosts(convertListPostEntityToListGetPostResponse(appUser.getPosts()));
      return response;
   }

   // Convert AppUser to SearchUserresponse
   public SearchUserResponse convertAppUserEntityToSearchUserResponse(AppUser appUser) {
      SearchUserResponse response = new SearchUserResponse();
      response.setId(appUser.getId());
      response.setUsername(appUser.getUsername());
      response.setProfilePictureUrl(appUser.getProfilePictureUrl());
      return response;
   }

   // Convert CreatePostRequest to Post Entity
   public Post convertCreatePostRequestToPostEntity(CreatePostRequest request, String username) {
      Post post = new Post();
      post.setImageUrl(request.getImageUrl());
      post.setDescription(request.getDescription());
      post.setAppUser(getUserOrThrow(username));
      return post;
   }

   // Convert WriteCommentRequest to Comment Entity
   public Comment convertWriteCommentRequestToCommentEntity(AppUser appUser, WriteCommentRequest request) {
      Post post = getPostOrThrow(request.getPostId());

      Comment comment = new Comment();
      comment.setContent(request.getContent());
      comment.setAppUser(appUser);
      comment.setPost(post);

      return comment;
   }

   // Convert Comment Entity to GetCommentResponse
   public GetCommentResponse convertCommentEntityToGetCommentResponse(Comment comment) {
      GetCommentResponse response = new GetCommentResponse();
      response.setId(comment.getId());
      response.setContent(comment.getContent());
      response.setCreatedAt(comment.getCreatedAt());
      response.setAppUser(convertAppUserEntityToGetUserResponse(comment.getAppUser()));
      return response;
   }

   // Convert WriteReplyRequest to CommentReply Entity 
   public CommentReply convertWriteReplyRequestToCommentReplyEntity(AppUser appUser,
         WriteReplyRequest request) {
      Comment comment = getCommentOrThrow(request.getCommentId());

      CommentReply commentReply = new CommentReply();
      commentReply.setContent(request.getContent());
      commentReply.setAppUser(appUser);
      commentReply.setComment(comment);

      return commentReply;
   }

   // Convert CommentReply Entity to GetCommentReplyresponse
   public GetReplyResponse convertCommentReplyEntityToGetCommentReplyResponse(CommentReply commentReply) {
      GetReplyResponse response = new GetReplyResponse();
      response.setId(commentReply.getId());
      response.setContent(commentReply.getContent());
      response.setCreatedAt(commentReply.getCreatedAt());
      response.setAppUser(convertAppUserEntityToGetUserResponse(commentReply.getAppUser()));
      return response;
   }

   // Convert FollowRequest To FollowRequestResponse
   public FollowRequestResponse convertFollowRequestToResponse(FollowRequest followRequest) {
      FollowRequestResponse response = new FollowRequestResponse();
      response.setRequestId(followRequest.getId());
      response.setRequesterUsername(followRequest.getRequester().getUsername());
      response.setRequesterProfilePictureUrl(followRequest.getRequester().getProfilePictureUrl());
      response.setTargetUsername(followRequest.getTarget().getUsername());
      response.setTargetProfilePictureUrl(followRequest.getTarget().getProfilePictureUrl());
      response.setStatus(followRequest.getStatus().name());
      response.setCreatedAt(followRequest.getCreatedAt());
      return response;
   }

   // Convert Notification Entity to NotificationResponse
   public NotificationResponse convertNotificationToNotificationResponse(Notification notification) {
      NotificationResponse request = new NotificationResponse();
      request.setId(notification.getId());
      request.setSender(this.convertAppUserEntityToGetUserResponse(notification.getSender()));
      request.setNotificationType(notification.getNotificationType().name());
      request.setEntityId(notification.getEntityId());
      request.setRead(notification.isRead());
      request.setCreatedAt(notification.getCreatedAt());
      return request;
   }

   public List<NotificationResponse> convertListNotificationToListNotificationResponse(
         List<Notification> notifications) {
      return notifications
            .stream()
            .map(this::convertNotificationToNotificationResponse)
            .collect(Collectors.toList());
   }

   private AppUser getUserOrThrow(String username) {
      return appUserRepository.findByUsername(username)
            .orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
   }

   private Post getPostOrThrow(Long id) {
      return postRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Post with id " + id + " was not found."));
   }

   private Comment getCommentOrThrow(Long id) {
      return commentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Comment with id " + id + " was not found."));
   }

}
