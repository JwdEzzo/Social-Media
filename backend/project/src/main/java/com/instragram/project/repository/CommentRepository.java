package com.instragram.project.repository;

import com.instragram.project.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Long> {

	Page<Comment> findByPostId(Long postId, Pageable pageable);

	// Count the number of comments on a post
	@Query("SELECT COUNT(c) FROM Comment c WHERE c.post.id = :postId")
	long countByPostId(@Param("postId") Long postId);

}
