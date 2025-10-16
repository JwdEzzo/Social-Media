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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "follows", //
      uniqueConstraints = @UniqueConstraint( //
            columnNames = { "follower_id", "following_id" })) //
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Follow {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY instead of AUTO
   private Long id;

   @ManyToOne
   @JoinColumn(name = "follower_id", nullable = false)
   private AppUser follower;

   @ManyToOne
   @JoinColumn(name = "following_id", nullable = false)
   private AppUser following;

   private LocalDateTime followedAt;

   @PrePersist
   public void onCreate() {
      followedAt = LocalDateTime.now();
   }
}