package com.instragram.project.dto.user.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code String} email <br>
 * {@code String} username <br>
 * {@code String} oldPassword <br>
 * {@code String} newPassword <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCredentialsRequest {

   @Email
   private String email;

   @Size(min = 8, message = "Username must be at least 8 characters long")
   private String username;

   @Size(min = 8, message = "Password must be at least 8 characters long")
   private String oldPassword;

   @Size(min = 8, message = "Password must be at least 8 characters long")
   private String newPassword;

}
