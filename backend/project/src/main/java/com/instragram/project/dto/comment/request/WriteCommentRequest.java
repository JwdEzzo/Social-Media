package com.instragram.project.dto.comment.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code String} content <br>
 * {@code Long} postId <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WriteCommentRequest {

   @NotBlank(message = "Content is required")
   private String content;

   @NotBlank(message = "Post ID is required")
   private Long postId;

   // VERY IMPORTANT !!!!!!!!!!!
   // Regarding the appUser field:
   // The authenticated user ID should come from security context
}
