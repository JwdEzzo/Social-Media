package com.instragram.project.repository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.CommentReply;
import com.instragram.project.model.CommentReplyLike;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentReplyLikeRepository extends JpaRepository<CommentReplyLike, Long> {

	// Check if a user has liked a specific comment reply
	@Query("SELECT crl FROM CommentReplyLike crl WHERE crl.appUser = :appUser AND crl.commentReply = :commentReply")
	Optional<CommentReplyLike> findByAppUserAndCommentReply(@Param("appUser") AppUser appUser,
			@Param("commentReply") CommentReply commentReply);

	// Get all likes for a specific comment reply
	@Query("SELECT crl FROM CommentReplyLike crl WHERE crl.commentReply = :commentReply")
	List<CommentReplyLike> findByCommentReply(@Param("commentReply") CommentReply commentReply);

	// Get all likes by a specific user, one page at a time
	@Query(value = "SELECT crl FROM CommentReplyLike crl WHERE crl.appUser = :appUser", countQuery = "SELECT COUNT(crl) FROM CommentReplyLike crl WHERE crl.appUser = :appUser")
	Page<CommentReplyLike> findByAppUser(@Param("appUser") AppUser appUser, Pageable pageable);

	// Count likes for a specific comment reply
	@Query("SELECT COUNT(crl) FROM CommentReplyLike crl WHERE crl.commentReply = :commentReply")
	long countByCommentReply(@Param("commentReply") CommentReply commentReply);

	// Check if a specific user has liked a specific comment reply
	@Query("SELECT CASE WHEN COUNT(crl) > 0 THEN true ELSE false END FROM CommentReplyLike crl WHERE crl.appUser = :appUser AND crl.commentReply = :commentReply")
	boolean existsByAppUserAndCommentReply(@Param("appUser") AppUser appUser,
			@Param("commentReply") CommentReply commentReply);

	// Delete a like by user and comment reply; returns the rows deleted (0 when a
	// concurrent request got there first)
	@Modifying
	@Query("DELETE FROM CommentReplyLike crl WHERE crl.appUser = :appUser AND crl.commentReply = :commentReply")
	int deleteByAppUserAndCommentReply(@Param("appUser") AppUser appUser,
			@Param("commentReply") CommentReply commentReply);

	// Insert a like unless one exists; returns the rows inserted (0 when a
	// concurrent request got there first).
	// Native because JPQL has no ON CONFLICT; @PrePersist does not run here, so
	// created_at is set in SQL.
	@Modifying
	@Query(value = """
			INSERT INTO comment_reply_likes (app_user_id, comment_reply_id, created_at)
			VALUES (:userId, :commentReplyId, now())
			ON CONFLICT (app_user_id, comment_reply_id) DO NOTHING
			""", nativeQuery = true)
	int insertIfAbsent(@Param("userId") Long userId, @Param("commentReplyId") Long commentReplyId);
}