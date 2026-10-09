package com.instragram.project.dto.follow.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Long} requestId <br>
 * {@code String} requesterUsername <br>
 * {@code String} requesterProfilePictureUrl <br>
 * {@code String} targetUsername <br>
 * {@code String} targetProfilePictureUrl <br>
 * {@code String} status <br>
 * {@code LocalDateTime} createdAt <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowRequestResponse {

    private Long requestId;
    private String requesterUsername;
    private String requesterProfilePictureUrl;
    private String targetUsername;
    private String targetProfilePictureUrl;
    private String status;
    private LocalDateTime createdAt;
}