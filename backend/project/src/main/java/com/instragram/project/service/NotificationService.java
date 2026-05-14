package com.instragram.project.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.instragram.project.dto.response.NotificationResponseDto;
import com.instragram.project.enums.NotificationType;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Notification;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.NotificationRepository;

@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;

    private final AppUserRepository appUserRepository;

    private final MappingMethods mappingMethods;

    public NotificationService(NotificationRepository notificationRepository , AppUserRepository appUserRepository , MappingMethods mappingMethods) {
        this.notificationRepository = notificationRepository;
        this.appUserRepository = appUserRepository;
        this.mappingMethods = mappingMethods;
    }

    // Private method to get a verified user
    private AppUser getVerifiedUser(Long userId, Long requestingUserId) {
        if (!userId.equals(requestingUserId)) {
            throw new AccessDeniedException("You cannot access another user's notifications");
        }
        return appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    // Create a notification using the recepient,sender, the type and the entityId
    public void createNotification(AppUser recipient, 
                                   AppUser sender, 
                                   NotificationType type, Long entityId) {
        
        // Don't notify if the user is performing an action on their own content
        if (recipient.getId().equals(sender.getId())) {
            return;
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSender(sender);
        notification.setNotificationType(type);
        notification.setEntityId(entityId);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    // Get all notifications for a user , ordered by date , authorization in the controller
    public List<NotificationResponseDto> getNotificationsForUser(Long userId, Long requestingUserId) {
        AppUser user = getVerifiedUser(userId, requestingUserId);
        List<Notification> notifications =
                notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
        return mappingMethods.convertListNotificationToListNotificationResponseDto(notifications);
    }

    // Get count of unread notifications for a user
    public long getUnreadCount(Long userId, Long requestingUserId) {
       AppUser user = getVerifiedUser(userId, requestingUserId);
        return notificationRepository.countByRecipientAndIsRead(user, false);
    }

    // Mark a single notification as read
    public void markAsRead(Long notificationId, Long requestingUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        if (!notification.getRecipient().getId().equals(requestingUserId)) {
            throw new AccessDeniedException("You cannot modify this notification");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }


    // Mark all notifications as read
    public void markAllAsRead(Long userId, Long requestingUserId) {
    
        AppUser user = getVerifiedUser(userId, requestingUserId);
    
        List<Notification> unread =
                notificationRepository.findByRecipientAndIsRead(user, false);
    
                unread.forEach(n -> n.setRead(true));
    
                notificationRepository.saveAll(unread);
    }

}
