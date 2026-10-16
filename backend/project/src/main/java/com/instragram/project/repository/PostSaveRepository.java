package com.instragram.project.repository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Post;
import com.instragram.project.model.PostSave;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostSaveRepository extends JpaRepository<PostSave, Long> {

	// Check if a user has liked a specific post
	Optional<PostSave> findByAppUserAndPost(AppUser appUser, Post post);

	// Get all likes for a specific post
	List<PostSave> findByPost(Post post);

	// Get all likes by a specific user, one page at a time
	Page<PostSave> findByAppUser(AppUser appUser, Pageable pageable);

	// Count likes for a specific post
	long countByPost(Post post);

	// Check if a specific user has liked a specific post
	boolean existsByAppUserAndPost(AppUser appUser, Post post);

	// Delete a save by user and post; returns the rows deleted (0 when a concurrent
	// request got there first)
	@Modifying
	@Query("DELETE FROM PostSave ps WHERE ps.appUser = :appUser AND ps.post = :post")
	int deleteByAppUserAndPost(@Param("appUser") AppUser appUser, @Param("post") Post post);

	// Insert a save unless one exists; returns the rows inserted (0 when a
	// concurrent request got there first).
	// Native because JPQL has no ON CONFLICT; @PrePersist does not run here, so
	// created_at is set in SQL.
	@Modifying
	@Query(value = """
			INSERT INTO post_saves (app_user_id, post_id, created_at)
			VALUES (:userId, :postId, now())
			ON CONFLICT (app_user_id, post_id) DO NOTHING
			""", nativeQuery = true)
	int insertIfAbsent(@Param("userId") Long userId, @Param("postId") Long postId);
}
