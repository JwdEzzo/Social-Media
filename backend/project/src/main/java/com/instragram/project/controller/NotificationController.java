package com.instragram.project.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.dto.response.NotificationResponseDto;
import com.instragram.project.service.AppUserService;
import com.instragram.project.service.NotificationService;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    private final AppUserService  appUserService;

    public NotificationController(NotificationService notificationService, AppUserService appUserService) {
        this.notificationService = notificationService;
        this.appUserService = appUserService;
    }

    // GET: All notifications for the logged in user
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getNotifications(
            Authentication authentication) {

        Long userId = getAuthenticatedUserId(authentication);
        List<NotificationResponseDto> notifications =
                notificationService.getNotificationsForUser(userId, userId);
        return ResponseEntity.ok(notifications);
    }

    // GET: Unread notification count (for bell icon badge)
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        Long userId = getAuthenticatedUserId(authentication);
        long count = notificationService.getUnreadCount(userId, userId);
        return ResponseEntity.ok(count);
    }

    // PUT: Mark a single notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {

        Long userId = getAuthenticatedUserId(authentication);
        notificationService.markAsRead(notificationId, userId);
        return ResponseEntity.noContent().build();
    }

    // PUT: Mark all notifications as read
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        Long userId = getAuthenticatedUserId(authentication);
        notificationService.markAllAsRead(userId, userId);
        return ResponseEntity.noContent().build();
    }

    // Helper : resolves authenticated username to userId once per request
    private Long getAuthenticatedUserId(Authentication authentication) {
        return appUserService.getUserByUsername(authentication.getName()).getId();
    }
}