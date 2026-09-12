package com.instragram.project.dto.post.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditPostWithUrlRequest {
   private String description;
   private String imageUrl;
}
