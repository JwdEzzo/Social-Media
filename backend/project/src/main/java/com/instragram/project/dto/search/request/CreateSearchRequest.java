package com.instragram.project.dto.search.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * {@code String} searchTerm <br>
 */
@NoArgsConstructor
@Getter
@Setter
public class CreateSearchRequest {

   @NotBlank(message = "Search term is required.")
   @Size(max = 150, message = "Search term must be at most {max} characters.")
   private String searchTerm;

}
