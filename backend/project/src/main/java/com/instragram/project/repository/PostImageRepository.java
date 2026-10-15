package com.instragram.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.instragram.project.model.PostImage;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {

   Optional<PostImage> findByPostId(Long postId);
}
