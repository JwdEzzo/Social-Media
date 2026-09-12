package com.instragram.project.dto.notification;

import java.time.LocalDateTime;

import com.instragram.project.dto.user.response.GetUserResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    
    private Long id;

    private GetUserResponse sender;

    private String notificationType;

    private Long entityId;

    private boolean isRead;

    private LocalDateTime createdAt;

}
