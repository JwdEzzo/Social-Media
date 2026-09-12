package com.instragram.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.instragram.project.dto.notification.NotificationResponse;
import com.instragram.project.enums.NotificationType;
import com.instragram.project.exception.ForbiddenException;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.Notification;
import com.instragram.project.repository.NotificationRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MappingMethods mappingMethods;

    public NotificationService(
            NotificationRepository notificationRepository,
            MappingMethods mappingMethods) {
        this.notificationRepository = notificationRepository;
        this.mappingMethods = mappingMethods;
    }

    // Create notification by recepient, sender, type and entityId
    // Internal — called in follow service , comment service , comment reply service and like service
    public void createNotification(
            AppUser recipient,
            AppUser sender,
            NotificationType type,
            Long entityId) {

        // Entities are already loaded by the calling service, no extra DB call needed
        if (recipient.getId().equals(sender.getId())) return;

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSender(sender);
        notification.setNotificationType(type);
        notification.setEntityId(entityId);

        notificationRepository.save(notification);
    }

    // Read operations : query by id directly, no AppUser fetch needed , to avoid heavy DB calls
    public List<NotificationResponse> getNotificationsForUser(Long recipientId, Long requestingUserId) {
        verifyOwnership(recipientId, requestingUserId);

        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
        return mappingMethods.convertListNotificationToListNotificationResponseDto(notifications);
    }

    public long getUnreadCount(Long recipientId, Long requestingUserId) {
        verifyOwnership(recipientId, requestingUserId);
        return notificationRepository.countByRecipientIdAndIsRead(recipientId, false);
    }

    public List<NotificationResponse> getLatest3Notifications(Long recipientId, Long requestingUserId) {
        verifyOwnership(recipientId, requestingUserId);
        List<Notification> notifications = notificationRepository.findFirst3ByRecipientIdOrderByCreatedAtDesc(recipientId);
        return mappingMethods.convertListNotificationToListNotificationResponseDto(notifications);
    }

    // Mark as read operations
    public void markAsRead(Long notificationId, Long requestingUserId) {
        // Single query — checks existence and ownership together
        if (!notificationRepository.existsByIdAndRecipientId(notificationId, requestingUserId)) {
            throw new ForbiddenException("notification.forbidden.access");
        }

        Notification notification = getNotificationOrThrow(notificationId);

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long recipientId, Long requestingUserId) {
        log.info("Marking all notifications as read for user: {}", recipientId);
        verifyOwnership(recipientId, requestingUserId);

        log.info("Checking for unread notifications for user: {}", recipientId);
        List<Notification> unread =
                notificationRepository.findByRecipientIdAndIsRead(recipientId, false);

        if (unread.isEmpty()) return;

        log.info("Marking {} notifications as read for user: {}", unread.size(), recipientId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        log.info("Successfully marked all notifications as read for user: {}", recipientId);
    }

    // Helper Method
    private void verifyOwnership(Long recipientId, Long requestingUserId) {
        if (!recipientId.equals(requestingUserId)) {
            throw new ForbiddenException("notification.forbidden.access");
        }
    }

    // Called when a like is removed : entityId identifies which post/comment was unliked
    public void deleteEntityNotification(Long recipientId, Long senderId,
                                NotificationType type, Long entityId) {
        notificationRepository
                .deleteByRecipientIdAndSenderIdAndNotificationTypeAndEntityId(
                        recipientId, senderId, type, entityId);
    }

    // Called when a follow is removed : no entityId involved
    public void deleteFollowNotification(Long recipientId, Long senderId, NotificationType type) {
        notificationRepository
                .deleteByRecipientIdAndSenderIdAndNotificationType(
                        recipientId, senderId, type);
    }

    private Notification getNotificationOrThrow(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("notification.notfound", id));
    }

}