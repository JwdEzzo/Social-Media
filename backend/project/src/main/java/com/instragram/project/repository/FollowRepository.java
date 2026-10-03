package com.instragram.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Follow;

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

   // Get all follows for a user
   List<Follow> findByFollower(AppUser follower);

   // A separate countQuery is supplied because the projection selects an
   // association (f.follower / f.following), which Spring Data cannot reliably
   // rewrite into a count query on its own.
   @Query(value = "SELECT f.follower FROM Follow f WHERE f.following.id = :userId",
         countQuery = "SELECT COUNT(f) FROM Follow f WHERE f.following.id = :userId")
   Page<AppUser> findFollowersByUserId(@Param("userId") Long userId, Pageable pageable);

   @Query(value = "SELECT f.following FROM Follow f WHERE f.follower.id = :userId",
         countQuery = "SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :userId")
   Page<AppUser> findFollowingsByUserId(@Param("userId") Long userId, Pageable pageable);

}
