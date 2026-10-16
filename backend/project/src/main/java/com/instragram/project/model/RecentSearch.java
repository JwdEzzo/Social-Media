package com.instragram.project.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Setter
@Getter
@Table(name = "recent_searches", uniqueConstraints = @UniqueConstraint(name = "uq_recent_search", columnNames = {
		"app_user_id", "search_term"}))
public class RecentSearch {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "app_user_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private AppUser appUser;

	@Column(length = 150, nullable = false)
	private String searchTerm;

	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}
}
