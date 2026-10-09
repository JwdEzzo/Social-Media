package com.instragram.project.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * {@code String} bioText <br>
 * {@code String} profilePictureUrl <br>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileResponse {
    private String bioText;
    private String profilePictureUrl;
}
