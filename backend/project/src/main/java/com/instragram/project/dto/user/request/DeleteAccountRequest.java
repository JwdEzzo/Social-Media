package com.instragram.project.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code String} password <br>
 * <p>
 * Carries the password confirmation that account deletion requires. Sent as a body rather
 * than a query parameter so the password does not end up in access logs or browser history.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeleteAccountRequest {

   @NotBlank(message = "Password is required to delete your account")
   private String password;

}
