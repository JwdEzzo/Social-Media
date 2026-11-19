package com.instragram.project.dto.user.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * email, username and newPassword are optional: {@code null} means "leave
 * unchanged". {@code @Email}, {@code @Size} and {@code @Pattern} all treat
 * {@code null} as valid, so they only check a value that was actually sent, and
 * a new value must follow the same rules as
 * {@link com.instragram.project.dto.security.request.SignUpRequest}. <br>
 * oldPassword is only checked for presence: whether it is correct is the
 * service's job, and a length rule would only reject it with a misleading
 * message. <br>
 * {@code String} email <br>
 * {@code String} username <br>
 * {@code String} oldPassword <br>
 * {@code String} newPassword <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCredentialsRequest {

	@Email(message = "Email is not valid.")
	@Size(max = 254, message = "Email must be at most {max} characters.")
	private String email;

	@Size(min = 8, max = 20, message = "Username must be between {min} and {max} characters.")
	@Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "Username can only contain letters, numbers, dots, and underscores.")
	private String username;

	@NotBlank(message = "Current password is required.")
	private String oldPassword;

	@Size(min = 8, max = 20, message = "Password must be between {min} and {max} characters.")
	private String newPassword;

}
