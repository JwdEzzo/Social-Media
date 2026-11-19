package com.instragram.project.dto.reply.request;

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
public class EditReplyRequest {

   @NotBlank(message = "Reply content is required")
   private String content;
}
