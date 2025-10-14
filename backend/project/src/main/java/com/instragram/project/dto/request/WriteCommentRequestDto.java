package com.instragram.project.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WriteCommentRequestDto {

   @NotBlank(message = "Content is required")
   private String content;

   @NotBlank(message = "Post ID is required")
   private Long postId;

   // VERY IMPORTANT !!!!!!!!!!!
   // Regarding the appUser field:
   // The authenticated user ID should come from security context
}
