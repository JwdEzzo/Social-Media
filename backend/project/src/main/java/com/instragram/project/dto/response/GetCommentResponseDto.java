package com.instragram.project.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetCommentResponseDto {

   private Long id;
   private String content;
   private LocalDateTime createdAt;
   private GetUserResponseDto appUser;
}
