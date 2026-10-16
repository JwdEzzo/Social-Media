package com.instragram.project.dto.search.response;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * {@code Long} id <br>
 * {@code String} searchTerm <br>
 * {@code LocalDateTime} createdAt <br>
 */
@Getter
@Setter
@NoArgsConstructor
public class GetSearchResponse {
	private Long id;
	private String searchTerm;
	private LocalDateTime createdAt;
}
