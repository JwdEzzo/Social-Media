package com.instragram.project.dto.reply.response;

import java.time.LocalDateTime;

import com.instragram.project.dto.user.response.GetUserResponseDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetReplyResponseDto {
   private Long id;
   private String content;
   private LocalDateTime createdAt;
   private GetUserResponseDto appUser;
}
