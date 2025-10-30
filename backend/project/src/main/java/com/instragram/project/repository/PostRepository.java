package com.instragram.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.instragram.project.model.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

      List<Post> findByAppUserUsername(String username);

      @Query("SELECT p FROM Post p WHERE p.appUser.username != :username")
      List<Post> findAllPostsExceptByCurrentUser(@Param("username") String username);

      long countByAppUserUsername(String username);

      // Find posts liked by certain user
      @Query("SELECT pl.post FROM PostLike pl WHERE pl.appUser.username = :username")
      List<Post> findPostsLikedByUser(@Param("username") String username);

      @Query("SELECT p FROM Post p WHERE p.appUser.id IN "
                  + "(SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId)")
      List<Post> findPostsByFollowing(@Param("userId") Long userId);

      // Find posts saved by certain user
      @Query("SELECT ps.post FROM PostSave ps WHERE ps.appUser.username = :username")
      List<Post> findPostsSavedByUser(@Param("username") String username);

}
