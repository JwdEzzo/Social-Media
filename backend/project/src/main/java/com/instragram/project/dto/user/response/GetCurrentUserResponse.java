package com.instragram.project.dto.user.response;

import com.instragram.project.enums.AccountStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The logged-in user's own account, returned only by {@code GET /users/me}.
 * Unlike {@link GetUserResponse}, it carries private fields such as the email,
 * so never use it to describe another user. <br>
 * <br>
 * {@code Long} id <br>
 * {@code String} email <br>
 * {@code String} username <br>
 * {@code String} bioText <br>
 * {@code String} profilePictureUrl <br>
 * {@code AccountStatus} accountStatus <br>
 * {@code LocalDateTime} createdAt <br>
 * {@code LocalDateTime} updatedAt <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetCurrentUserResponse {

	private Long id;
	private String email;
	private String username;
	private String bioText;
	private String profilePictureUrl;
	private AccountStatus accountStatus;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
