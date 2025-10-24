package com.instragram.project.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditPostWithUrlRequestDto {
   private String description;
   private String imageUrl;
}
