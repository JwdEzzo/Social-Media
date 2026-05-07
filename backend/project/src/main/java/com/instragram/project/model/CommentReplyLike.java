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
@Table(name = "comment_reply_likes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentReplyLike {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @ManyToOne
   @JoinColumn(name = "app_user_id", nullable = false)
   private AppUser appUser;

   @ManyToOne
   @JoinColumn(name = "comment_reply_id", nullable = false)
   private CommentReply commentReply;

   private LocalDateTime createdAt;

   @PrePersist
   public void onCreate() {
      createdAt = LocalDateTime.now();
   }
}