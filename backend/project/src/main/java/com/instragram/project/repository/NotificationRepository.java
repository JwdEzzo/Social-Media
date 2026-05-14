package com.instragram.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByRecipientOrderByCreatedAtDesc(AppUser recipient);
    
    List<Notification> findByRecipientAndIsRead(AppUser recipient, boolean isRead);
    
    long countByRecipientAndIsRead(AppUser recipient, boolean isRead);
}