package com.instragram.project.repository;

import com.instragram.project.enums.FollowRequestStatus;
import com.instragram.project.model.FollowRequest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {

	// Check if a pending request already exists between two users
	boolean existsByRequesterIdAndTargetIdAndStatus(Long requesterId, Long targetId, FollowRequestStatus status);

	// Insert a PENDING request unless one is already pending between the two users;
	// returns the rows inserted.
	// The ON CONFLICT target repeats the WHERE of the partial index
	// uq_pending_follow_request, so
	// declined/accepted history never blocks a new request. Native because JPQL has
	// no ON CONFLICT;
	// @PrePersist does not run here, so status and created_at are set in SQL.
	@Modifying
	@Query(value = """
			INSERT INTO follow_requests (requester_user_id, receiver_user_id, status, created_at)
			VALUES (:requesterId, :targetId, 'PENDING', now())
			ON CONFLICT (requester_user_id, receiver_user_id) WHERE status = 'PENDING' DO NOTHING
			""", nativeQuery = true)
	int insertPendingIfAbsent(@Param("requesterId") Long requesterId, @Param("targetId") Long targetId);

	// Get all incoming requests for a private account owner, one page at a time
	Page<FollowRequest> findAllByTargetIdAndStatus(Long targetId, FollowRequestStatus status, Pageable pageable);

	// Unpaged variant: acceptAllPendingRequests has to walk every pending request,
	// not one page
	List<FollowRequest> findAllByTargetIdAndStatus(Long targetId, FollowRequestStatus status);

	// Get all outgoing requests made by a user, one page at a time
	Page<FollowRequest> findAllByRequesterIdAndStatus(Long requesterId, FollowRequestStatus status, Pageable pageable);

	// Used when cancelling a request or checking before following
	Optional<FollowRequest> findByRequesterIdAndTargetId(Long requesterId, Long targetId);

	// If a user makes a request and gets accepted, then unfollows, then requests
	// again, we use this in order to respond to the request that is pending, not
	// the old one that was declined
	Optional<FollowRequest> findByRequesterIdAndTargetIdAndStatus(Long requesterId, Long targetId,
			FollowRequestStatus status);

	// Count all incoming requests for a private account owner
	long countByTargetIdAndStatus(Long targetId, FollowRequestStatus status);

	// Count all outgoing requests for a user
	long countByRequesterIdAndStatus(Long requesterId, FollowRequestStatus status);
}