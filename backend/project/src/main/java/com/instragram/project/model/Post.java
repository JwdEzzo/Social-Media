package com.instragram.project.model;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
@ToString(exclude = { "appUser", "comments" }) // Exclude relationships to prevent circular reference
public class Post {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(name = "id")
   private Long id;

   @Column(name = "description")
   private String description;

   @Column(name = "created_at")
   private LocalDateTime createdAt;

   @Column(name = "updated_at")
   private LocalDateTime updatedAt;

   @ManyToOne
   @JoinColumn(name = "app_user_id", nullable = false)
   @OnDelete(action = OnDeleteAction.CASCADE)
   private AppUser appUser;

   @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
   private List<Comment> comments;

   @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
   private List<PostLike> postLikes;

   @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
   private List<PostSave> postSaves;

   @PrePersist
   public void onCreate() {
      createdAt = LocalDateTime.now();
   }
}
