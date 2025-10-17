package com.instragram.project.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "posts")
@ToString(exclude = { "appUser", "comments", "imageData" }) // Exclude relationships to prevent circular reference
public class Post {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(name = "id")
   private Long id;

   @Column(name = "description")
   private String description;

   @Column(name = "image_url")
   private String imageUrl;

   // New fields for file upload
   @Lob
   @Column(name = "image_data")
   @JsonIgnore
   private byte[] imageData;

   @Column(name = "image_name")
   private String imageName;

   @Column(name = "image_type")
   private String imageType; // MIME type (e.g., "image/jpeg", "image/png")

   @Column(name = "image_size")
   private Long imageSize; // File size in bytes

   @Column(name = "created_at")
   private LocalDateTime createdAt;

   @Column(name = "updated_at")
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
