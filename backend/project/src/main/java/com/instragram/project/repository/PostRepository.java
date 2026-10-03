package com.instragram.project.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.instragram.project.model.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

      Page<Post> findByAppUserUsername(String username, Pageable pageable);

      @Query(value = "SELECT p FROM Post p WHERE p.appUser.username != :username",
                  countQuery = "SELECT COUNT(p) FROM Post p WHERE p.appUser.username != :username")
      Page<Post> findAllPostsExceptByCurrentUser(@Param("username") String username, Pageable pageable);

      long countByAppUserUsername(String username);

      // Find posts liked by certain user.
      // A separate countQuery is supplied because the projection selects an association
      // (pl.post), which Spring Data cannot reliably rewrite into a count query on its own.
      @Query(value = "SELECT pl.post FROM PostLike pl WHERE pl.appUser.username = :username",
                  countQuery = "SELECT COUNT(pl) FROM PostLike pl WHERE pl.appUser.username = :username")
      Page<Post> findPostsLikedByUser(@Param("username") String username, Pageable pageable);

      @Query(value = "SELECT p FROM Post p WHERE p.appUser.id IN "
                  + "(SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId)",
                  countQuery = "SELECT COUNT(p) FROM Post p WHERE p.appUser.id IN "
                  + "(SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId)")
      Page<Post> findPostsByFollowing(@Param("userId") Long userId, Pageable pageable);

      // Find posts saved by certain user. Projects an association, so it needs its own countQuery.
      @Query(value = "SELECT ps.post FROM PostSave ps WHERE ps.appUser.username = :username",
                  countQuery = "SELECT COUNT(ps) FROM PostSave ps WHERE ps.appUser.username = :username")
      Page<Post> findPostsSavedByUser(@Param("username") String username, Pageable pageable);

      @Query(value = "SELECT p FROM Post p WHERE LOWER(p.description) LIKE LOWER(CONCAT('%', :description, '%'))",
                  countQuery = "SELECT COUNT(p) FROM Post p WHERE LOWER(p.description) LIKE LOWER(CONCAT('%', :description, '%'))")
      Page<Post> findByDescriptionContaining(@Param("description") String description, Pageable pageable);

      // Find posts of a user only if the requesting user follows them
      @Query(value = """
      SELECT p FROM Post p
      WHERE p.appUser.username = :targetUsername
      AND EXISTS (
            SELECT f FROM Follow f
            WHERE f.follower.username = :followerUsername
            AND f.following.username = :targetUsername
      )
      """,
                  countQuery = """
      SELECT COUNT(p) FROM Post p
      WHERE p.appUser.username = :targetUsername
      AND EXISTS (
            SELECT f FROM Follow f
            WHERE f.follower.username = :followerUsername
            AND f.following.username = :targetUsername
      )
      """)
      Page<Post> findPrivateAccountPostsIfFollowing(
      @Param("followerUsername") String followerUsername,
      @Param("targetUsername") String targetUsername,
      Pageable pageable
      );

}
