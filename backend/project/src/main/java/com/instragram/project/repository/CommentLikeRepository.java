package com.instragram.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Comment;
import com.instragram.project.model.CommentLike;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {

   // Check if a user has liked a specific comment
   @Query("SELECT cl FROM CommentLike cl WHERE cl.appUser = :appUser AND cl.comment = :comment")
   Optional<CommentLike> findByAppUserAndComment(@Param("appUser") AppUser appUser, @Param("comment") Comment comment);

   // Get all likes for a specific comment
   @Query("SELECT cl FROM CommentLike cl WHERE cl.comment = :comment")
   List<CommentLike> findByComment(@Param("comment") Comment comment);

   // Get all likes by a specific user
   @Query("SELECT cl FROM CommentLike cl WHERE cl.appUser = :appUser")
   List<CommentLike> findByAppUser(@Param("appUser") AppUser appUser);

   // Count likes for a specific comment
   @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.comment = :comment")
   long countByComment(@Param("comment") Comment comment);

   // Check if a specific user has liked a specific comment
   @Query("SELECT CASE WHEN COUNT(cl) > 0 THEN true ELSE false END FROM CommentLike cl WHERE cl.appUser = :appUser AND cl.comment = :comment")
   boolean existsByAppUserAndComment(@Param("appUser") AppUser appUser, @Param("comment") Comment comment);

   // Delete a like by user and comment
   @Modifying
   @Query("DELETE FROM CommentLike cl WHERE cl.appUser = :appUser AND cl.comment = :comment")
   void deleteByAppUserAndComment(@Param("appUser") AppUser appUser, @Param("comment") Comment comment);
}