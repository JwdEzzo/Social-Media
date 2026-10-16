package com.instragram.project.service;

import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Post;
import com.instragram.project.model.PostLike;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.PostLikeRepository;
import com.instragram.project.repository.PostRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PostLikeService {

	private final PostLikeRepository postLikeRepository;

	private final AppUserRepository appUserRepository;

	private final PostRepository postRepository;

	private final NotificationService notificationService;

	public PostLikeService(PostLikeRepository postLikeRepository, AppUserRepository appUserRepository,
			PostRepository postRepository, NotificationService notificationService) {
		this.postLikeRepository = postLikeRepository;
		this.appUserRepository = appUserRepository;
		this.postRepository = postRepository;
		this.notificationService = notificationService;
	}

	// Toggle PostLike
	@Transactional
	public void toggleLike(String username, Long postId) {
		AppUser user = getUserOrThrow(username);
		Post post = getPostOrThrow(postId);
		// Step 1: Try to unlike. A deleted row means it was liked, so we're done.
		// No exists-check first: two concurrent requests could both pass it.
		if (postLikeRepository.deleteByAppUserAndPost(user, post) > 0) {
			// Delete the notification that was created when the like was added
			notificationService.deleteEntityNotification(post.getAppUser().getId(), // recipient — the post owner
					user.getId(), // sender — the person who liked
					NotificationType.POST_LIKE, postId);
			return;
		}

		// Step 2: Not liked, so like it. 0 rows inserted means a concurrent request
		// liked it first,
		// and only the request that actually inserted sends the notification.
		if (postLikeRepository.insertIfAbsent(user.getId(), postId) > 0) {
			notificationService.createNotification(post.getAppUser(), // recipient - the post owner
					user, // sender - the person liking
					NotificationType.POST_LIKE, postId // entityId - for the frontend to link to the post
			);
		}
	}

	// Get like count for a post
	public Long getLikeCount(Long postId) {
		Post post = getPostOrThrow(postId);
		return postLikeRepository.countByPost(post);
	}

	/**
	 * Get a page of the likes a user has left on posts. The {@code Pageable}
	 * carries the page number, size and sort, and the returned {@link Page} carries
	 * the total count so the caller can render pagination controls.
	 */
	public Page<PostLike> getLikesByUser(String username, Pageable pageable) {
		AppUser user = getUserOrThrow(username);
		return postLikeRepository.findByAppUser(user, pageable);
	}

	// Check if a user liked a post
	public boolean isLikedByUser(String username, Long postId) {
		AppUser appUser = getUserOrThrow(username);
		Post post = getPostOrThrow(postId);

		return postLikeRepository.existsByAppUserAndPost(appUser, post);
	}

	private AppUser getUserOrThrow(String username) {
		return appUserRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
	}

	private Post getPostOrThrow(Long id) {
		return postRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Post with id " + id + " was not found."));
	}

}
