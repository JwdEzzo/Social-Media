package com.instragram.project.model;

import java.time.LocalDateTime;

import com.instragram.project.enums.FollowRequestStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "follow_requests",
        uniqueConstraints = @UniqueConstraint(
                columnNames = { "requester_id", "target_id" })) // prevent duplicate requests
public class FollowRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="requester_user_id" , nullable=false)
    private AppUser requester; // The user who sent the follow request

    @ManyToOne
    @JoinColumn(name="receiver_user_id" , nullable=false)
    private AppUser target; // The user who received the follow request, the private account being requested

    @Enumerated(EnumType.STRING)
    private FollowRequestStatus status;

    private LocalDateTime createdAt;

    @PrePersist() 
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = FollowRequestStatus.PENDING;
    }


}
