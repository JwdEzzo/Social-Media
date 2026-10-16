package com.instragram.project.model;

import com.instragram.project.enums.FollowRequestStatus;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "follow_requests")
public class FollowRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "requester_user_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private AppUser requester; // The user who sent the follow request

	@ManyToOne
	@JoinColumn(name = "receiver_user_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private AppUser target; // The user who received the follow request, the private account being requested

	@Enumerated(EnumType.STRING)
	private FollowRequestStatus status;

	private LocalDateTime createdAt;

	@PrePersist()
	public void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.status = FollowRequestStatus.PENDING;
	}

}
