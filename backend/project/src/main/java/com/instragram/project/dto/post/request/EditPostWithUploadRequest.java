package com.instragram.project.dto.post.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

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
