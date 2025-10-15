package com.instragram.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Follow;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

   // Check if user1 follows user2
   Optional<Follow> findByFollowerAndFollowing(AppUser follower, AppUser following);

   // Get following count for a user
   long countByFollower(AppUser follower);

   // Get followers count for a user
   long countByFollowing(AppUser following);

   // Check if user1 is following user2
   boolean existsByFollowerAndFollowing(AppUser follower, AppUser following);

   // Delete a follow by follower and following
   void deleteByFollowerAndFollowing(AppUser follower, AppUser following);

}
