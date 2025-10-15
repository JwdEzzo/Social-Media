package com.instragram.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.instragram.project.model.Follow;

public interface FollowRepository extends JpaRepository<Follow, Long> {

   // Check if user1 follows user2
   Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

}
