package com.instragram.project.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comment_likes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentLike {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

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
