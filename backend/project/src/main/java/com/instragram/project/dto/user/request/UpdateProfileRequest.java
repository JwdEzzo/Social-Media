package com.instragram.project.dto.user.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code String} bioText <br>
 * {@code String} profilePictureUrl <br>
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

   private String bioText;

   private String profilePictureUrl;
}