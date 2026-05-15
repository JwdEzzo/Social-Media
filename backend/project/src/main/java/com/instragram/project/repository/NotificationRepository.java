package com.instragram.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    
    List<Notification> findByRecipientAndIsRead(AppUser recipient, boolean isRead);
    
    long countByRecipientIdAndIsRead(Long recipientId, boolean isRead);

    List<Notification> findByRecipientIdAndIsRead(Long recipientId, boolean isRead);

    boolean existsByIdAndRecipientId(Long notificationId, Long recipientId);
    
}