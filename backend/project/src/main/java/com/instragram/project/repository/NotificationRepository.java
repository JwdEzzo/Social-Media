package com.instragram.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.instragram.project.enums.NotificationType;
import com.instragram.project.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    List<Notification> findByRecipientIdAndIsRead(Long recipientId, boolean isRead);
    long countByRecipientIdAndIsRead(Long recipientId, boolean isRead);
    boolean existsByIdAndRecipientId(Long notificationId, Long recipientId);

    // Delete by all three fields — uniquely identifies the notification
    void deleteByRecipientIdAndSenderIdAndNotificationTypeAndEntityId(Long recipientId, Long senderId, NotificationType type, Long entityId);

    // For follow/follow request — no entityId involved
    void deleteByRecipientIdAndSenderIdAndNotificationType(Long recipientId, Long senderId, NotificationType type);
}