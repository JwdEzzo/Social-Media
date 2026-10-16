package com.instragram.project.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"appUser", "post"}) // Exclude relationships to prevent circular reference
public class Comment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Content is required")
	private String content;

	private LocalDateTime createdAt;

	@ManyToOne
	@JoinColumn(name = "app_user_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private AppUser appUser;

	@ManyToOne
	@JoinColumn(name = "post_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Post post;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}

}
