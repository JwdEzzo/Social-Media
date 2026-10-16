package com.instragram.project.mapper;

import com.instragram.project.dto.comment.request.WriteCommentRequest;
import com.instragram.project.dto.comment.response.GetCommentResponse;
import com.instragram.project.dto.follow.response.FollowRequestResponse;
import com.instragram.project.dto.notification.NotificationResponse;
import com.instragram.project.dto.post.response.GetPostResponse;
import com.instragram.project.dto.reply.request.WriteReplyRequest;
import com.instragram.project.dto.reply.response.GetReplyResponse;
import com.instragram.project.dto.search.response.GetSearchResponse;
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
import com.instragram.project.model.RecentSearch;
import com.instragram.project.repository.CommentRepository;
import com.instragram.project.repository.PostRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Component
public class MappingMethods {

	private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

	private final PostRepository postRepository;

	private final CommentRepository commentRepository;

	public MappingMethods(PostRepository postRepository, CommentRepository commentRepository) {
		this.postRepository = postRepository;
		this.commentRepository = commentRepository;
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
		response.setProfilePictureUrl(buildProfilePictureUrl(post.getAppUser()));

		response.setImageUrl(buildPostImageUrl(post.getId()));
		response.setDescription(post.getDescription());
		response.setCreatedAt(post.getCreatedAt());
		response.setUpdatedAt(post.getUpdatedAt());
		return response;
	}

	// Absolute URL of the endpoint that serves a post's image, based on the current
	// request's host
	private String buildPostImageUrl(Long postId) {
		return ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/instagram/posts/{postId}/image")
				.buildAndExpand(postId).toUriString();
	}

	// Absolute URL of the endpoint that serves a user's profile picture, or null if
	// they haven't uploaded one
	public String buildProfilePictureUrl(AppUser appUser) {
		if (!appUser.isHasProfilePicture()) {
			return null;
		}
		return ServletUriComponentsBuilder.fromCurrentContextPath()
				.path("/api/instagram/users/{userId}/profile-image/preview").buildAndExpand(appUser.getId())
				.toUriString();
	}

	// Convert List<Post> to List<GetPostResponse> responses;
	public List<GetPostResponse> convertListPostEntityToListGetPostResponse(List<Post> posts) {
		return posts.stream().map(this::convertPostEntityToGetPostResponse).collect(Collectors.toList());
	}

	// Convert AppUser to GetUserresponse
	public GetUserResponse convertAppUserEntityToGetUserResponse(AppUser appUser) {
		GetUserResponse response = new GetUserResponse();
		response.setId(appUser.getId());
		response.setUsername(appUser.getUsername());
		response.setBioText(appUser.getBioText());
		response.setProfilePictureUrl(buildProfilePictureUrl(appUser));
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
		response.setProfilePictureUrl(buildProfilePictureUrl(appUser));
		return response;
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
	public CommentReply convertWriteReplyRequestToCommentReplyEntity(AppUser appUser, WriteReplyRequest request) {
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
		response.setRequesterProfilePictureUrl(buildProfilePictureUrl(followRequest.getRequester()));
		response.setTargetUsername(followRequest.getTarget().getUsername());
		response.setTargetProfilePictureUrl(buildProfilePictureUrl(followRequest.getTarget()));
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
		return notifications.stream().map(this::convertNotificationToNotificationResponse).collect(Collectors.toList());
	}

	// Convert RecentSearch Entity to GetSearchResponse
	public GetSearchResponse mapRecentSearchToGetSearchResponse(RecentSearch recentSearch) {
		GetSearchResponse response = new GetSearchResponse();
		response.setId(recentSearch.getId());
		response.setSearchTerm(recentSearch.getSearchTerm());
		response.setCreatedAt(recentSearch.getCreatedAt());
		return response;
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
