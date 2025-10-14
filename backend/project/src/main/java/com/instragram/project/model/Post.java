package com.instragram.project.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "posts")
@ToString(exclude = { "appUser", "comments" }) // Exclude relationships to prevent circular reference
public class Post {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @NotNull(message = "Description is required")
   private String description;

   @NotBlank(message = "Image URL is required")
   private String imageUrl;

   private LocalDateTime createdAt;

   private LocalDateTime updatedAt;

   @ManyToOne
   @JoinColumn(name = "app_user_id", nullable = false)
   private AppUser appUser;

   @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
   private List<Comment> comments;

   @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
   private List<PostLike> postLikes;

   @PrePersist
   public void onCreate() {
      createdAt = LocalDateTime.now();
   }
}
