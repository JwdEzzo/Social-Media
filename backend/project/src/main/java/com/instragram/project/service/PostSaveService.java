package com.instragram.project.service;

import com.instragram.project.exception.NotFoundException;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Post;
import com.instragram.project.model.PostSave;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.PostRepository;
import com.instragram.project.repository.PostSaveRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PostSaveService {

	// Same as postlike
	private final PostSaveRepository postSaveRepository;

	private final AppUserRepository appUserRepository;

	private final PostRepository postRepository;

	public PostSaveService(PostSaveRepository postSaveRepository, AppUserRepository appUserRepository,
			PostRepository postRepository) {
		this.postSaveRepository = postSaveRepository;
		this.appUserRepository = appUserRepository;
		this.postRepository = postRepository;
	}

	// Toggle PostSave
	@Transactional
	public void toggleSave(String username, Long postId) {
		AppUser user = getUserOrThrow(username);
		Post post = getPostOrThrow(postId);

		// Unsave if saved, otherwise save. Both statements are safe under concurrent
		// requests:
		// a delete of 0 rows means it was not saved, and the insert skips a row that
		// already exists.
		if (postSaveRepository.deleteByAppUserAndPost(user, post) == 0) {
			postSaveRepository.insertIfAbsent(user.getId(), postId);
		}
	}

	// Get save count for a post
	public Long getSaveCount(Long postId) {
		Post post = getPostOrThrow(postId);
		return postSaveRepository.countByPost(post);
	}

	/**
	 * Get a page of the posts a user has saved. The {@code Pageable} carries the
	 * page number, size and sort, and the returned {@link Page} carries the total
	 * count so the caller can render pagination controls.
	 */
	public Page<PostSave> getSavesByUser(String username, Pageable pageable) {
		AppUser user = getUserOrThrow(username);
		return postSaveRepository.findByAppUser(user, pageable);
	}

	// Check if a user saved a post
	public boolean isSavedByUser(String username, Long postId) {
		AppUser user = getUserOrThrow(username);
		Post post = getPostOrThrow(postId);

		return postSaveRepository.existsByAppUserAndPost(user, post);
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