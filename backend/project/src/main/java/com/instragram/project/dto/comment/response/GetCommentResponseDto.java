package com.instragram.project.dto.comment.response;

import java.time.LocalDateTime;

import com.instragram.project.dto.user.response.GetUserResponseDto;

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
