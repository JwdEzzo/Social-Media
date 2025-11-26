package com.instragram.project.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchUserResponseDto {

   private Long id;
   private String username;
   private String bioText;
   private String profilePictureUrl;

}
