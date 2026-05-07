package com.instragram.project.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.instragram.project.enums.AccountStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetUserResponseDto {

   private Long id;
   private String email;
   private String username;
   private String bioText;
   private String profilePictureUrl;
   private AccountStatus accountStatus;
   private LocalDateTime createdAt;
   private LocalDateTime updatedAt;

   private List<GetPostResponseDto> posts;
}
