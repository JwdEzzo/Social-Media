package com.instragram.project.dto.comment.response;

import java.time.LocalDateTime;

import com.instragram.project.dto.user.response.GetUserResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetCommentResponse {

   private Long id;
   private String content;
   private LocalDateTime createdAt;
   private GetUserResponse appUser;
}
