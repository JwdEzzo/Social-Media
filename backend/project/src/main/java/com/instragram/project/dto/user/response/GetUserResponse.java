package com.instragram.project.dto.user.response;

import com.instragram.project.dto.post.response.GetPostResponse;
import com.instragram.project.enums.AccountStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A user as anyone may see them: profiles, comment and reply authors,
 * notification senders. Keep private fields (email) out of here; the
 * logged-in user's own account uses {@link GetCurrentUserResponse}. <br>
 * <br>
 * {@code Long} id <br>
 * {@code String} username <br>
 * {@code String} bioText <br>
 * {@code String} profilePictureUrl <br>
 * {@code AccountStatus} accountStatus <br>
 * {@code LocalDateTime} createdAt <br>
 * {@code LocalDateTime} updatedAt <br>
 * {@code List<GetPostResponse>} posts <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetUserResponse {

	private Long id;
	private String username;
	private String bioText;
	private String profilePictureUrl;
	private AccountStatus accountStatus;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	private List<GetPostResponse> posts;
}
