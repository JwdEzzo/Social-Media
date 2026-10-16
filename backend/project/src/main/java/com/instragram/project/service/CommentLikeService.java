package com.instragram.project.service;

import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Comment;
import com.instragram.project.model.CommentLike;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.CommentLikeRepository;
import com.instragram.project.repository.CommentRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CommentLikeService {

	private final AppUserRepository appUserRepository;

	private final CommentRepository commentRepository;

	private final CommentLikeRepository commentLikeRepository;

	private final NotificationService notificationService;

	public CommentLikeService(AppUserRepository appUserRepository, CommentRepository commentRepository,
			CommentLikeRepository commentLikeRepository, NotificationService notificationService) {
		this.appUserRepository = appUserRepository;
		this.commentRepository = commentRepository;
		this.commentLikeRepository = commentLikeRepository;
		this.notificationService = notificationService;
	}

	@Transactional
	public void toggleLike(String username, Long commentId) {
		AppUser user = getUserOrThrow(username);

		Comment comment = getCommentOrThrow(commentId);

		// Step 1: Try to unlike. A deleted row means it was liked, so we're done.
		// No exists-check first: two concurrent requests could both pass it.
		if (commentLikeRepository.deleteByAppUserAndComment(user, comment) > 0) {
			// Delete the notification when unliking
			notificationService.deleteEntityNotification(comment.getAppUser().getId(), // recipient — comment owner
					user.getId(), // sender — the person who liked
					NotificationType.COMMENT_LIKE, commentId);
			return;
		}

		// Step 2: Not liked, so like it. 0 rows inserted means a concurrent request
		// liked it first,
		// and only the request that actually inserted sends the notification.
		if (commentLikeRepository.insertIfAbsent(user.getId(), commentId) > 0) {
			notificationService.createNotification(comment.getAppUser(), // recipient - the comment owner
					user, // sender - the person liking
					NotificationType.COMMENT_LIKE, commentId // entityId - for the frontend to link to the post
			);
		}
	}

	// Get like count for a comment
	public Long getLikeCount(Long commentId) {
		Comment comment = getCommentOrThrow(commentId);
		return commentLikeRepository.countByComment(comment);
	}

	/**
	 * Get a page of the likes a user has left on comments. The {@code Pageable}
	 * carries the page number, size and sort, and the returned {@link Page} carries
	 * the total count so the caller can render pagination controls.
	 */
	public Page<CommentLike> getLikesByUser(String username, Pageable pageable) {
		AppUser user = getUserOrThrow(username);

		return commentLikeRepository.findByAppUser(user, pageable);
	}

	// Check if a user liked a post
	public boolean isLikedByUser(String username, Long commentId) {
		AppUser appUser = getUserOrThrow(username);
		Comment comment = getCommentOrThrow(commentId);

		return commentLikeRepository.existsByAppUserAndComment(appUser, comment);
	}

	private AppUser getUserOrThrow(String username) {
		return appUserRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
	}

	private Comment getCommentOrThrow(Long id) {
		return commentRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Comment with id " + id + " was not found."));
	}

}
