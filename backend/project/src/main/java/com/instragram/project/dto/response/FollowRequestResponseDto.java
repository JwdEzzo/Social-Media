package com.instragram.project.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowRequestResponseDto {

    private Long requestId;
    private String requesterUsername;
    private String requesterProfilePictureUrl;
    private String targetUsername;
    private String targetProfilePictureUrl;
    private String status;
    private LocalDateTime createdAt;
}