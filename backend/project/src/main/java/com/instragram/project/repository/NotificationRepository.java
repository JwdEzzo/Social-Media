package com.instragram.project.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.instragram.project.enums.NotificationType;
import com.instragram.project.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Ordering comes from the Pageable so the caller can sort, hence no OrderBy in the name
    Page<Notification> findByRecipientId(Long recipientId, Pageable pageable);
    List<Notification> findByRecipientIdAndIsRead(Long recipientId, boolean isRead);
    long countByRecipientIdAndIsRead(Long recipientId, boolean isRead);
    boolean existsByIdAndRecipientId(Long notificationId, Long recipientId);

    // Delete by all three fields — uniquely identifies the notification
    void deleteByRecipientIdAndSenderIdAndNotificationTypeAndEntityId(Long recipientId, Long senderId, NotificationType type, Long entityId);

    // For follow/follow request — no entityId involved
    void deleteByRecipientIdAndSenderIdAndNotificationType(Long recipientId, Long senderId, NotificationType type);

    // Get the first 3 notifications
    List<Notification> findFirst3ByRecipientIdOrderByCreatedAtDesc(Long recipientId);
}