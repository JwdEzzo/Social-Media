package com.instragram.project.service;

import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.CommentReply;
import com.instragram.project.model.CommentReplyLike;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentReplyLikeRepository;
import com.instragram.project.repository.CommentReplyRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CommentReplyLikeService {

	private final AppUserRepository appUserRepository;

	private final CommentReplyRepository commentReplyRepository;

	private final CommentReplyLikeRepository commentReplyLikeRepository;

	private final NotificationService notificationService;

	public CommentReplyLikeService(AppUserRepository appUserRepository, CommentReplyRepository commentReplyRepository,
			CommentReplyLikeRepository commentReplyLikeRepository, NotificationService notificationService) {
		this.appUserRepository = appUserRepository;
		this.commentReplyRepository = commentReplyRepository;
		this.commentReplyLikeRepository = commentReplyLikeRepository;
		this.notificationService = notificationService;
	}

	@Transactional
	public void toggleLike(String username, Long commentReplyId) {
		AppUser user = getUserOrThrow(username);

		CommentReply commentReply = getCommentReplyOrThrow(commentReplyId);

		// Step 1: Try to unlike. A deleted row means it was liked, so we're done.
		// No exists-check first: two concurrent requests could both pass it.
		if (commentReplyLikeRepository.deleteByAppUserAndCommentReply(user, commentReply) > 0) {
			// Delete the notification when unliking
			notificationService.deleteEntityNotification(commentReply.getAppUser().getId(), // recipient — reply owner
					user.getId(), // sender — the person who liked
					NotificationType.REPLY_LIKE, commentReplyId);
			return;
		}

		// Step 2: Not liked, so like it. 0 rows inserted means a concurrent request
		// liked it first,
		// and only the request that actually inserted sends the notification.
		if (commentReplyLikeRepository.insertIfAbsent(user.getId(), commentReplyId) > 0) {
			notificationService.createNotification(commentReply.getComment().getAppUser(), // recipient - the comment
																							// owner
					user, // sender - the person liking
					NotificationType.REPLY_LIKE, commentReplyId);
		}
	}

	// Get like count for a comment reply
	public Long getLikeCount(Long commentReplyId) {
		CommentReply commentReply = getCommentReplyOrThrow(commentReplyId);
		return commentReplyLikeRepository.countByCommentReply(commentReply);
	}

	/**
	 * Get a page of the likes a user has left on comment replies. The
	 * {@code Pageable} carries the page number, size and sort, and the returned
	 * {@link Page} carries the total count so the caller can render pagination
	 * controls.
	 */
	public Page<CommentReplyLike> getLikesByUser(String username, Pageable pageable) {
		AppUser user = getUserOrThrow(username);

		return commentReplyLikeRepository.findByAppUser(user, pageable);
	}

	// Check if a user liked a comment reply
	public boolean isLikedByUser(String username, Long commentReplyId) {
		AppUser appUser = getUserOrThrow(username);
		CommentReply commentReply = getCommentReplyOrThrow(commentReplyId);

		return commentReplyLikeRepository.existsByAppUserAndCommentReply(appUser, commentReply);
	}

	private AppUser getUserOrThrow(String username) {
		return appUserRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
	}

	private CommentReply getCommentReplyOrThrow(Long id) {
		return commentReplyRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Reply with id " + id + " was not found."));
	}

}