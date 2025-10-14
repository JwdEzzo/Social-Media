package com.instragram.project.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetPostResponseDto {

   private Long id;
   private String username;
   private String profilePictureUrl;
   private String imageUrl;
   private String description;
   private LocalDateTime createdAt;
   private LocalDateTime updatedAt;

   private List<GetCommentResponseDto> comments;

}
