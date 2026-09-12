package com.instragram.project.dto.security.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code String} token <br>
 * {@code String} username <br>
 * {@code String} message <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
   private String token;
   private String username;
}