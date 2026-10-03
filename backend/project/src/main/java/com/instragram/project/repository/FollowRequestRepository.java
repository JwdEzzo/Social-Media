package com.instragram.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.instragram.project.enums.FollowRequestStatus;
import com.instragram.project.model.FollowRequest;

public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {

    // Check if a pending request already exists between two users
    boolean existsByRequesterIdAndTargetIdAndStatus(Long requesterId, Long targetId, FollowRequestStatus status);

    // Get all incoming requests for a private account owner, one page at a time
    Page<FollowRequest> findAllByTargetIdAndStatus(Long targetId, FollowRequestStatus status, Pageable pageable);

    // Unpaged variant: acceptAllPendingRequests has to walk every pending request, not one page
    List<FollowRequest> findAllByTargetIdAndStatus(Long targetId, FollowRequestStatus status);

    // Get all outgoing requests made by a user, one page at a time
    Page<FollowRequest> findAllByRequesterIdAndStatus(Long requesterId, FollowRequestStatus status, Pageable pageable);

    // Used when cancelling a request or checking before following
    Optional<FollowRequest> findByRequesterIdAndTargetId(Long requesterId, Long targetId);

    // If a user makes a request and gets accepted, then unfollows, then requests again, we use this in order to respond to the request that is pending, not the old one that was declined
    Optional<FollowRequest> findByRequesterIdAndTargetIdAndStatus(
        Long requesterId, Long targetId, FollowRequestStatus status);

    // Count all incoming requests for a private account owner
    long countByTargetIdAndStatus(Long targetId, FollowRequestStatus status);

    // Count all outgoing requests for a user
    long countByRequesterIdAndStatus(Long requesterId, FollowRequestStatus status);
}