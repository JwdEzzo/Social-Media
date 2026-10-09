package com.instragram.project.dto.security.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Hibernate Validator does not fail fast, so every constraint below is evaluated on every request
 * and the caller is told about all of its problems at once. {@code {min}} and {@code {max}} in the
 * messages are filled in from the constraint itself.
 * {@code String} email <br>
 * {@code String} username <br>
 * {@code String} password <br>
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignUpRequest {

   // @Email and @Size both treat a blank value as valid, so @NotBlank is what catches a missing
   // one. Without it, an empty field would pass every other constraint here and report nothing.
   @NotBlank(message = "Email is required.")
   @Email(message = "Email is not valid.")
   @Size(max = 254, message = "Email must be at most {max} characters.")
   private String email;

   @NotBlank(message = "Username is required.")
   @Size(min = 8, max = 20, message = "Username must be between {min} and {max} characters.")
   @Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "Username can only contain letters, numbers, dots, and underscores.")
   private String username;

   @NotBlank(message = "Password is required.")
   @Size(min = 8, max = 20, message = "Password must be between {min} and {max} characters.")
   // @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "Password must contain at least one lowercase letter, one uppercase letter, and one digit.")
   private String password;

}
