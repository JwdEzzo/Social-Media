package com.instragram.project.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.dto.follow.response.FollowRequestResponse;
import com.instragram.project.service.FollowService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/follow-requests")
@PreAuthorize("isAuthenticated()") // all endpoints here require auth
public class FollowRequestController {

    private final FollowService followService;

    public FollowRequestController(FollowService followService) {
        this.followService = followService;
    }

    // GET: Get all outgoing follow requests (the notification list), paginated
    @GetMapping("/outgoing")
    public ResponseEntity<PagedModel<FollowRequestResponse>> getOutgoingRequests(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {

        Page<FollowRequestResponse> requests =
                followService.getAllOutgoingRequests(authentication.getName(), pageable);
        return ResponseEntity.ok(new PagedModel<>(requests));
    }

    // GET: Get count of outgoing follow requests
    @GetMapping("/outgoing/count")
    public ResponseEntity<Long> getOutgoingRequestsCount(Authentication authentication) {
        long count = followService.getOutgoingRequestsCount(authentication.getName());
        return ResponseEntity.ok(count);
    }

    // GET: Get all pending incoming follow requests (the notification list), paginated
    @GetMapping("/incoming")
    public ResponseEntity<PagedModel<FollowRequestResponse>> getIncomingRequests(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {

        Page<FollowRequestResponse> requests =
                followService.getAllPendingIncomingRequests(authentication.getName(), pageable);
        return ResponseEntity.ok(new PagedModel<>(requests));
    }

    // GET: Get count of follow requests for an account
    @GetMapping("/incoming/count")
    public ResponseEntity<Long> getFollowRequestsCount(Authentication authentication) {
        long count = followService.getFollowRequestsCount(authentication.getName());
        return ResponseEntity.ok(count);
    }

    // PUT: Accept a follow request
    @PutMapping("/{requestId}/accept")
    public ResponseEntity<Void> acceptFollowRequest(
            @PathVariable Long requestId,
            Authentication authentication) {

        followService.respondToFollowRequest(requestId, authentication.getName(), true);
        return ResponseEntity.noContent().build();
    }

    // PUT: Decline a follow request
    @PutMapping("/{requestId}/decline")
    public ResponseEntity<Void> declineFollowRequest(
            @PathVariable Long requestId,
            Authentication authentication) {

        followService.respondToFollowRequest(requestId, authentication.getName(), false);
        return ResponseEntity.noContent().build();
    }

    // DELETE: Cancel an outgoing follow request (requester withdraws it)
    @DeleteMapping("/{requestId}/cancel")
    public ResponseEntity<Void> cancelFollowRequest(
            @PathVariable Long requestId,
            Authentication authentication) {

        followService.cancelFollowRequest(requestId, authentication.getName());
        return ResponseEntity.noContent().build();
    }


}
