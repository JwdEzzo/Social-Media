package com.instragram.project.dto.reply.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code String} content <br>
 * {@code Long} commentId <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WriteReplyRequest {

	@NotBlank(message = "Content is required")
	private String content;

	// @NotNull, not @NotBlank: @NotBlank only works on text and would crash on a
	// Long
	@NotNull(message = "Comment ID is required")
	private Long commentId;
}
