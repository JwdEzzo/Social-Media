package com.instragram.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.instragram.project.model.CommentReply;

@Repository
public interface CommentReplyRepository extends JpaRepository<CommentReply, Long> {

}
