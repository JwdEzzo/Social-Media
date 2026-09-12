package com.instragram.project.dto.user.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Long} id <br>
 * {@code String} username <br>
 * {@code String} bioText <br>
 * {@code String} profilePictureUrl <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchUserResponse {

   private Long id;
   private String username;
   private String bioText;
   private String profilePictureUrl;
}
