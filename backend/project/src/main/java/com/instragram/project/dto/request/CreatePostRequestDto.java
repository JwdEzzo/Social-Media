package com.instragram.project.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequestDto {

   @NotNull(message = "Description is required")
   private String description;

   @NotBlank(message = "Image URL is required")
   private String imageUrl;
}