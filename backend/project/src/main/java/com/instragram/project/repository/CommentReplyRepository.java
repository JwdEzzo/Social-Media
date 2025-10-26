package com.instragram.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.instragram.project.model.CommentReply;

@Repository
public interface CommentReplyRepository extends JpaRepository<CommentReply, Long> {

   List<CommentReply> findByCommentId(Long commentId);

   // Count the number of replies to a comment
   @Query("SELECT COUNT(cr) FROM CommentReply cr WHERE cr.comment.id = :commentId")
   long countByCommentId(@Param("commentId") Long commentId);
}
