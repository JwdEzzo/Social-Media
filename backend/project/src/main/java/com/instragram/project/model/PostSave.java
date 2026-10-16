package com.instragram.project.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
@ToString(exclude = {"appUser", "post"})
@Table(name = "post_saves", uniqueConstraints = @UniqueConstraint(name = "uq_post_save", columnNames = {"app_user_id",
		"post_id"}))
public class PostSave {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

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
