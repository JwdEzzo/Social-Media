package com.instragram.project.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "app_users")
@ToString(exclude = { "posts", "comments" }) // Exclude collections to prevent circular reference
public class AppUser {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @Email(message = "Email is not valid")
   @NotBlank(message = "Email is required")
   private String email;

   @NotBlank(message = "Username is required")
   @Size(min = 8, message = "Username must be at least 8 characters long")
   private String username;

   @NotBlank(message = "Password is required")
   @Size(min = 8, message = "Username must be at least 8 characters long")
   private String password;

   private String bioText;

   private String profilePictureUrl;

   private LocalDateTime createdAt;

   private LocalDateTime updatedAt;

   @OneToMany(mappedBy = "appUser", cascade = CascadeType.ALL)
   private List<Post> posts;

   @OneToMany(mappedBy = "appUser", cascade = CascadeType.ALL)
   private List<Comment> comments;

   @OneToMany(mappedBy = "appUser", cascade = CascadeType.ALL)
   private List<PostLike> likes;

   @PrePersist
   public void onCreate() {
      createdAt = LocalDateTime.now();
   }
}
