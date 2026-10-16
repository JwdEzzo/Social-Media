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
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "comment_likes", uniqueConstraints = @UniqueConstraint(name = "uq_comment_like", columnNames = {
		"app_user_id", "comment_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentLike {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "app_user_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private AppUser appUser;

	@ManyToOne
	@JoinColumn(name = "comment_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Comment comment;

	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}
}
