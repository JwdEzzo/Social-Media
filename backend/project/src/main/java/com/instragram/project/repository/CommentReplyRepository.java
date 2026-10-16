package com.instragram.project.repository;

import com.instragram.project.model.CommentReply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentReplyRepository extends JpaRepository<CommentReply, Long> {

	Page<CommentReply> findByCommentId(Long commentId, Pageable pageable);

	// Count the number of replies to a comment
	@Query("SELECT COUNT(cr) FROM CommentReply cr WHERE cr.comment.id = :commentId")
	long countByCommentId(@Param("commentId") Long commentId);
}
