package com.instragram.project.service;

import com.instragram.project.dto.reply.request.EditReplyRequest;
import com.instragram.project.dto.reply.request.WriteReplyRequest;
import com.instragram.project.dto.reply.response.GetReplyResponse;
import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.ForbiddenException;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.CommentReply;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentReplyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CommentReplyService {

	private final CommentReplyRepository commentReplyRepository;
	private final AppUserRepository appUserRepository;
	private final MappingMethods mappingMethods;
	private final NotificationService notificationService;

	// Create Comment Reply
	@Transactional
	public void createCommentReply(WriteReplyRequest requestDto, String username) {
		AppUser appUser = getUserOrThrow(username);

		if (requestDto.getCommentId() == null) {
			throw new NotFoundException("Comment with id " + requestDto.getCommentId() + " was not found.");
		}
		// Create reply
		CommentReply commentReply = mappingMethods.convertWriteReplyRequestToCommentReplyEntity(appUser, requestDto);
		commentReplyRepository.save(commentReply);

		// Notify the comment owner
		notificationService.createNotification(commentReply.getComment().getAppUser(), // recipient - the comment owner
				appUser, // sender - the person replying
				NotificationType.REPLY, //
				requestDto.getCommentId() //
		);
	}

	/**
	 * Get a page of the replies to a comment. The {@code Pageable} carries the page
	 * number, size and sort, and the returned {@link Page} carries the total count
	 * so the caller can render pagination controls.
	 */
	public Page<GetReplyResponse> findByCommentId(Long commentId, Pageable pageable) {
		return commentReplyRepository.findByCommentId(commentId, pageable)
				.map(mappingMethods::convertCommentReplyEntityToGetCommentReplyResponse);
	}

	@Transactional
	public void editCommentReply(Long commentReplyId, EditReplyRequest requestDto, String username) {
		AppUser appUser = getUserOrThrow(username);
		CommentReply commentReply = getCommentReplyOrThrow(commentReplyId);
		if (!isReplyOwner(appUser, commentReply)) {
			throw new ForbiddenException("You do not have permission to edit this reply.");
		}
		commentReply.setContent(requestDto.getContent());
	}

	// Delete Reply by Post/Comment/Reply Owner
	@Transactional
	public void deleteCommentReplyByPostOrCommentOrReplyOwner(Long commentReplyId, String username) {
		AppUser appUser = getUserOrThrow(username);
		CommentReply commentReply = getCommentReplyOrThrow(commentReplyId);

		if (!canDeleteReply(appUser, commentReply)) {
			throw new ForbiddenException("You do not have permission to delete this reply.");
		}
		// Delete the notification that was created when the reply was made
		notificationService.deleteEntityNotification(
				commentReply.getComment().getAppUser().getId(), // recipient — comment owner
				commentReply.getAppUser().getId(), // sender — the person who replied
				NotificationType.REPLY,
				commentReply.getComment().getId() // entityId
		);
		commentReplyRepository.deleteById(commentReplyId);
	}

	// Get number of replies to a comment
	public long getReplyCount(Long commentId) {
		return commentReplyRepository.countByCommentId(commentId);
	}

	private AppUser getUserOrThrow(String username) {
		return appUserRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
	}

	private CommentReply getCommentReplyOrThrow(Long id) {
		return commentReplyRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Reply with id " + id + " was not found."));
	}

	private boolean canDeleteReply(AppUser appUser, CommentReply commentReply) {
		boolean isReplyOwner = commentReply.getAppUser().getId().equals(appUser.getId());
		boolean isCommentOwner = commentReply.getComment().getAppUser().getId().equals(appUser.getId());
		boolean isPostOwner = commentReply.getComment().getPost().getAppUser().getId().equals(appUser.getId());

		return isReplyOwner || isCommentOwner || isPostOwner;
	}

	private boolean isReplyOwner(AppUser appUser, CommentReply commentReply) {
		return commentReply.getAppUser().getId().equals(appUser.getId());
	}
}