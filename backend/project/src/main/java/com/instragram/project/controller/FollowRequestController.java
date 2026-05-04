package com.instragram.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.dto.response.FollowRequestResponseDto;
import com.instragram.project.service.FollowService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/follow-requests")
@PreAuthorize("isAuthenticated()") // all endpoints here require auth
public class FollowRequestController {

    @Autowired
    private FollowService followService;

    // POST: Send a follow request (or direct follow if public account)
    // This replaces your existing toggle-follow endpoint
    @PostMapping("/follow/{targetUsername}")
    public ResponseEntity<Void> toggleFollow(
            @PathVariable String targetUsername,
            Authentication authentication) {

        followService.toggleFollow(authentication.getName(), targetUsername);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // GET: Get all pending incoming follow requests (the notification list)
    @GetMapping("/incoming")
    public ResponseEntity<List<FollowRequestResponseDto>> getIncomingRequests(
            Authentication authentication) {

        List<FollowRequestResponseDto> requests =
                followService.getAllPendingIncomingRequests(authentication.getName());
        return ResponseEntity.ok(requests);
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