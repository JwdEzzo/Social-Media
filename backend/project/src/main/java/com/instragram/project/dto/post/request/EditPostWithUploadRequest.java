package com.instragram.project.dto.post.request;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code String} description <br>
 * {@code MultipartFile} image <br>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditPostWithUploadRequest {

   private String description;
   private MultipartFile image;
}
