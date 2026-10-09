package com.instragram.project.dto.reply.request;

import jakarta.validation.constraints.NotBlank;
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
   private String content;

   @NotBlank(message = "Comment ID is required")
   private Long commentId;
}
