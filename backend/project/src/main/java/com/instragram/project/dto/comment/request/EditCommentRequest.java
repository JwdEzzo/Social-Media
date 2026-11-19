package com.instragram.project.dto.comment.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code String} content <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditCommentRequest {

	@NotBlank(message = "Comment content is required")
	private String content;
}
