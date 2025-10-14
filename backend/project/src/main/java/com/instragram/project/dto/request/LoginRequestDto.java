package com.instragram.project.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {

   @NotBlank(message = "Username is required")
   @Size(min = 8, message = "Username must be at least 8 characters long")
   private String username;

   @NotBlank(message = "Password is required")
   @Size(min = 8, message = "Password must be at least 8 characters long")
   private String password;

}
