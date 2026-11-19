package com.instragram.project.repository;

import com.instragram.project.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

	String IS_THE_OWNER_OF_THE_POST_PUBLIC = "p.appUser.accountStatus = com.instragram.project.enums.AccountStatus.PUBLIC";
	String IS_THE_VIEWER_HIMSELF_THE_OWNER_OF_THE_POST = "p.appUser.username = :viewer";
	String DOES_THE_VIEWER_FOLLOW_THE_OWNER = """
			EXISTS (
				SELECT f
				FROM Follow f
				WHERE f.follower.username = :viewer
				AND f.following = p.appUser
				)""";

	/**
	 * Who may see a post (mirrors FollowService.canView): <br>
	 * its owner is public, is the viewer, or is followed by the viewer. <br>
	 * Every query using it binds a :viewer param; <br>
	 * a null viewer matches public accounts only.
	 */
	String VISIBLE_TO_VIEWER = "(" + IS_THE_OWNER_OF_THE_POST_PUBLIC + " OR "
			+ IS_THE_VIEWER_HIMSELF_THE_OWNER_OF_THE_POST + " OR " + DOES_THE_VIEWER_FOLLOW_THE_OWNER + ")";

	long countByAppUserUsername(String username);

	/**
	 * One user's posts, empty if the viewer may not see them
	 */
	@Query(value = """
			SELECT p
			FROM Post p
			WHERE p.appUser.username = :username
			AND
			""" + VISIBLE_TO_VIEWER, countQuery = """
			SELECT COUNT(p)
			FROM Post p
			WHERE p.appUser.username = :username
			AND
			""" + VISIBLE_TO_VIEWER)
	Page<Post> findVisibleByOwnerUsername(@Param("username") String username, @Param("viewer") String viewer,
			Pageable pageable);

	/**
	 * All posts the viewer may see (replaces findAll for GET /posts)
	 */
	@Query(value = """
			SELECT p
			FROM Post p
			WHERE
			""" + VISIBLE_TO_VIEWER, countQuery = """
			SELECT COUNT(p)
			FROM Post p
			WHERE
			""" + VISIBLE_TO_VIEWER)
	Page<Post> findAllVisibleTo(@Param("viewer") String viewer, Pageable pageable);

	@Query(value = """
			SELECT p
			FROM Post p
			WHERE p.appUser.username != :viewer
			AND
			""" + VISIBLE_TO_VIEWER, countQuery = """
			SELECT COUNT(p)
			FROM Post p
			WHERE p.appUser.username != :viewer
			AND
			""" + VISIBLE_TO_VIEWER)
	Page<Post> findAllPostsExceptByCurrentUser(@Param("viewer") String viewer, Pageable pageable);

	/**
	 * Find posts liked by the viewer, minus those they may no longer see (a private
	 * account they have since unfollowed). <br>
	 * The post is joined as {@code p} so VISIBLE_TO_VIEWER can refer to it;
	 * {@code pl} stays the first alias, so sorting by createdAt still orders by
	 * when the post was liked. <br>
	 * A separate countQuery is supplied because Spring Data cannot reliably rewrite
	 * a join projection into a count query on its own.
	 */
	@Query(value = """
			SELECT p
			FROM PostLike pl
			JOIN pl.post p
			WHERE pl.appUser.username = :viewer
			AND
			""" + VISIBLE_TO_VIEWER, countQuery = """
			SELECT COUNT(pl)
			FROM PostLike pl
			JOIN pl.post p
			WHERE pl.appUser.username = :viewer
			AND
			""" + VISIBLE_TO_VIEWER)
	Page<Post> findPostsLikedByUser(@Param("viewer") String viewer, Pageable pageable);

	@Query(value = """
			SELECT p
			FROM Post p
			WHERE p.appUser.id IN (
			      SELECT f.following.id
			      FROM Follow f
			      WHERE f.follower.id = :userId
			)
			""", countQuery = """
			SELECT COUNT(p)
			FROM Post p
			WHERE p.appUser.id IN (
			      SELECT f.following.id
			      FROM Follow f
			      WHERE f.follower.id = :userId
			)
			""")
	Page<Post> findPostsByFollowing(@Param("userId") Long userId, Pageable pageable);

	/**
	 * Find posts saved by the viewer, minus those they may no longer see. Same join
	 * and alias reasoning as findPostsLikedByUser.
	 */
	@Query(value = """
			SELECT p
			FROM PostSave ps
			JOIN ps.post p
			WHERE ps.appUser.username = :viewer
			AND
			""" + VISIBLE_TO_VIEWER, countQuery = """
			SELECT COUNT(ps)
			FROM PostSave ps
			JOIN ps.post p
			WHERE ps.appUser.username = :viewer
			AND
			""" + VISIBLE_TO_VIEWER)
	Page<Post> findPostsSavedByUser(@Param("viewer") String viewer, Pageable pageable);

	/**
	 * Search posts by description (not case sensitive), only those the viewer may
	 * see
	 */
	@Query(value = """
			SELECT p
			FROM Post p
			WHERE LOWER(p.description) LIKE LOWER(CONCAT('%', :description, '%'))
			AND
			""" + VISIBLE_TO_VIEWER, countQuery = """
			SELECT COUNT(p)
			FROM Post p
			WHERE LOWER(p.description) LIKE LOWER(CONCAT('%', :description, '%'))
			AND
			""" + VISIBLE_TO_VIEWER)
	Page<Post> findByDescriptionContaining(@Param("description") String description, @Param("viewer") String viewer,
			Pageable pageable);

	/**
	 * Find posts of a user only if the requesting user follows them
	 */
	@Query(value = """
			SELECT p
			FROM Post p
			WHERE p.appUser.username = :targetUsername
			AND EXISTS (
			      SELECT f
			      FROM Follow f
			      WHERE f.follower.username = :followerUsername
			      AND f.following.username = :targetUsername
			)
			""", countQuery = """
			SELECT COUNT(p)
			FROM Post p
			WHERE p.appUser.username = :targetUsername
			AND EXISTS (
			      SELECT f
			      FROM Follow f
			      WHERE f.follower.username = :followerUsername
			      AND f.following.username = :targetUsername
			)
			""")
	Page<Post> findPrivateAccountPostsIfFollowing(@Param("followerUsername") String followerUsername,
			@Param("targetUsername") String targetUsername, Pageable pageable);

}
