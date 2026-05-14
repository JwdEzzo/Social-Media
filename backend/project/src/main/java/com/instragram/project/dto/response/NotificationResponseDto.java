package com.instragram.project.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    
    private Long id;

    private GetUserResponseDto sender;

    private String notificationType;

    private Long entityId;

    private boolean isRead;

    private LocalDateTime createdAt;

}
