package com.instragram.project.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefreshToken {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @Column(nullable = false, unique = true)
   private String token;

   @ManyToOne()
   @JoinColumn(name = "app_user_id", referencedColumnName = "id")
   private AppUser appUser;

   @Column(nullable = false)
   private Instant expiryDate;

   @Column(nullable = false)
   public boolean revoked = false;

   @Column(nullable = false)
   public Instant createdAt;
}
