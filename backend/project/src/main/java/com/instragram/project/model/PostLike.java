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
import lombok.ToString;

@Entity
@Table(name = "post_likes", //
            uniqueConstraints = @UniqueConstraint( //
                        columnNames = { "app_user_id", "post_id" } //
            )) // 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostLike {

      @Id
      @GeneratedValue(strategy = GenerationType.AUTO)
      private Long id;

      @ManyToOne
      @JoinColumn(name = "app_user_id", nullable = false)
      @ToString.Exclude
      private AppUser appUser;

      @ManyToOne
      @JoinColumn(name = "post_id", nullable = false)
      @ToString.Exclude
      private Post post;

      private LocalDateTime createdAt;

      @PrePersist
      public void onCreate() {
            createdAt = LocalDateTime.now();
      }

}
