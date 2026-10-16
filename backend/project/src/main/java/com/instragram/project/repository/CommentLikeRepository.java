package com.instragram.project.repository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Comment;
import com.instragram.project.model.CommentLike;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {

      // Check if a user has liked a specific comment
      @Query("SELECT cl FROM CommentLike cl WHERE cl.appUser = :appUser AND cl.comment = :comment")
      Optional<CommentLike> findByAppUserAndComment(@Param("appUser") AppUser appUser,
                  @Param("comment") Comment comment);

      // Get all likes for a specific comment
      @Query("SELECT cl FROM CommentLike cl WHERE cl.comment = :comment")
      List<CommentLike> findByComment(@Param("comment") Comment comment);

      // Get all likes by a specific user, one page at a time
      @Query(value = "SELECT cl FROM CommentLike cl WHERE cl.appUser = :appUser", countQuery = "SELECT COUNT(cl) FROM CommentLike cl WHERE cl.appUser = :appUser")
      Page<CommentLike> findByAppUser(@Param("appUser") AppUser appUser, Pageable pageable);

      // Count likes for a specific comment
      @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.comment = :comment")
      long countByComment(@Param("comment") Comment comment);

      // Check if a specific user has liked a specific comment
      @Query("SELECT CASE WHEN COUNT(cl) > 0 THEN true ELSE false END FROM CommentLike cl WHERE cl.appUser = :appUser AND cl.comment = :comment")
      boolean existsByAppUserAndComment(@Param("appUser") AppUser appUser, @Param("comment") Comment comment);

      // Delete a like by user and comment; returns the rows deleted (0 when a
      // concurrent request got there first)
      @Modifying
      @Query("DELETE FROM CommentLike cl WHERE cl.appUser = :appUser AND cl.comment = :comment")
      int deleteByAppUserAndComment(@Param("appUser") AppUser appUser, @Param("comment") Comment comment);

      // Insert a like unless one exists; returns the rows inserted (0 when a
      // concurrent request got there first).
      // Native because JPQL has no ON CONFLICT; @PrePersist does not run here, so
      // created_at is set in SQL.
      @Modifying
      @Query(value = """
                  INSERT INTO comment_likes (app_user_id, comment_id, created_at)
                  VALUES (:userId, :commentId, now())
                  ON CONFLICT (app_user_id, comment_id) DO NOTHING
                  """, nativeQuery = true)
      int insertIfAbsent(@Param("userId") Long userId, @Param("commentId") Long commentId);
}