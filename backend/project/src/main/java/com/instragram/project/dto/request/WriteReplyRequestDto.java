package com.instragram.project.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WriteReplyRequestDto {
   private String content;

   @NotBlank(message = "Comment ID is required")
   private Long commentId;
}
