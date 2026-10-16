package com.instragram.project.model;

import com.instragram.project.enums.NotificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Notification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recipient_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private AppUser recipient;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sender_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private AppUser sender;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private NotificationType notificationType;

	@Column(name = "entity_id")
	private Long entityId;

	@Column(name = "is_read", nullable = false)
	private boolean isRead = false;

	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		isRead = false;
	}
}
