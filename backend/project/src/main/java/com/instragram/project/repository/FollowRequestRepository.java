package com.instragram.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.instragram.project.enums.FollowRequestStatus;
import com.instragram.project.model.FollowRequest;

@Repository
public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {

    // Check if a pending request already exists between two users
    boolean existsByRequesterIdAndTargetIdAndStatus(Long requesterId, Long targetId, FollowRequestStatus status);

    // Get all incoming requests for a private account owner
    List<FollowRequest> findAllByTargetIdAndStatus(Long targetId, FollowRequestStatus status);

    // Get all outgoing requests made by a user
    List<FollowRequest> findAllByRequesterIdAndStatus(Long requesterId, FollowRequestStatus status);

    // Used when cancelling a request or checking before following
    Optional<FollowRequest> findByRequesterIdAndTargetId(Long requesterId, Long targetId);
}