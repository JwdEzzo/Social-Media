package com.instragram.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.CommentReply;
import com.instragram.project.model.CommentReplyLike;

@Repository
public interface CommentReplyLikeRepository extends JpaRepository<CommentReplyLike, Long> {

   // Check if a user has liked a specific comment reply
   @Query("SELECT crl FROM CommentReplyLike crl WHERE crl.appUser = :appUser AND crl.commentReply = :commentReply")
   Optional<CommentReplyLike> findByAppUserAndCommentReply(@Param("appUser") AppUser appUser,
         @Param("commentReply") CommentReply commentReply);

   // Get all likes for a specific comment reply
   @Query("SELECT crl FROM CommentReplyLike crl WHERE crl.commentReply = :commentReply")
   List<CommentReplyLike> findByCommentReply(@Param("commentReply") CommentReply commentReply);

   // Get all likes by a specific user
   @Query("SELECT crl FROM CommentReplyLike crl WHERE crl.appUser = :appUser")
   List<CommentReplyLike> findByAppUser(@Param("appUser") AppUser appUser);

   // Count likes for a specific comment reply
   @Query("SELECT COUNT(crl) FROM CommentReplyLike crl WHERE crl.commentReply = :commentReply")
   long countByCommentReply(@Param("commentReply") CommentReply commentReply);

   // Check if a specific user has liked a specific comment reply
   @Query("SELECT CASE WHEN COUNT(crl) > 0 THEN true ELSE false END FROM CommentReplyLike crl WHERE crl.appUser = :appUser AND crl.commentReply = :commentReply")
   boolean existsByAppUserAndCommentReply(@Param("appUser") AppUser appUser,
         @Param("commentReply") CommentReply commentReply);

   // Delete a like by user and comment reply
   @Modifying
   @Query("DELETE FROM CommentReplyLike crl WHERE crl.appUser = :appUser AND crl.commentReply = :commentReply")
   void deleteByAppUserAndCommentReply(@Param("appUser") AppUser appUser,
         @Param("commentReply") CommentReply commentReply);
}