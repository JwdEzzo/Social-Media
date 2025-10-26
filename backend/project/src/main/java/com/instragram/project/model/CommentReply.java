package com.instragram.project.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "appUser", "comment" })
public class CommentReply {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @NotBlank(message = "Content is required")
   private String content;

   @ManyToOne
   @JoinColumn(name = "app_user_id", nullable = false)
   private AppUser appUser;

   @ManyToOne
   @JoinColumn(name = "comment_id", nullable = false)
   private Comment comment;

   private LocalDateTime createdAt;

   @PrePersist
   public void onCreate() {
      createdAt = LocalDateTime.now();
   }
}
