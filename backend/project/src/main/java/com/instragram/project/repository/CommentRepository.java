package com.instragram.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.instragram.project.model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {

   List<Comment> findByPostId(Long postId);

   // Count the number of comments on a post
   @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.id = :postId")
   long countByPostId(@Param("postId") Long postId);

}
