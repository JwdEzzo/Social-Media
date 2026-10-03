package com.instragram.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Post;
import com.instragram.project.model.PostLike;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

   // Check if a user has liked a specific post
   Optional<PostLike> findByAppUserAndPost(AppUser appUser, Post post);

   // Get all likes for a specific post
   List<PostLike> findByPost(Post post);

   // Get all likes by a specific user, one page at a time
   Page<PostLike> findByAppUser(AppUser appUser, Pageable pageable);

   // Count likes for a specific post
   long countByPost(Post post);

   // Check if a specific user has liked a specific post
   boolean existsByAppUserAndPost(AppUser appUser, Post post);

   // Delete a like by user and post
   void deleteByAppUserAndPost(AppUser appUser, Post post);
}
