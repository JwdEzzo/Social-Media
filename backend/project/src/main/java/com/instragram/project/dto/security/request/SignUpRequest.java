package com.instragram.project.dto.security.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Messages are {@code {key}} references rather than literals, so they resolve against the same
 * localization bundle the rest of the API uses - {@code LocaleConfig} points Bean Validation's
 * interpolator at it. {@code {min}} and {@code {max}} are filled in from the constraint itself. <br>
 * Hibernate Validator does not fail fast, so every constraint below is evaluated on every request
 * and the caller is told about all of its problems at once.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignUpRequest {

   // @Email and @Size both treat a blank value as valid, so @NotBlank is what catches a missing
   // one. Without it, an empty field would pass every other constraint here and report nothing.
   @NotBlank(message = "{validation.email.required}")
   @Email(message = "{validation.email.invalid}")
   @Size(max = 254, message = "{validation.email.size}")
   private String email;

   @NotBlank(message = "{validation.username.required}")
   @Size(min = 8, max = 20, message = "{validation.username.size}")
   @Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "{validation.username.charset}")
   private String username;

   @NotBlank(message = "{validation.password.required}")
   @Size(min = 8, max = 20, message = "{validation.password.size}")
   // @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "{validation.password.strength}")
   private String password;

}
