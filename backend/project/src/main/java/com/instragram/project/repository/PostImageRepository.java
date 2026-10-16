package com.instragram.project.repository;

import com.instragram.project.model.PostImage;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {

	Optional<PostImage> findByPostId(Long postId);
}
