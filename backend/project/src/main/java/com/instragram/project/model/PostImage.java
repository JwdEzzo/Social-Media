package com.instragram.project.model;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The image bytes of a post, kept out of {@link Post} so that loading posts (feed, search,
 * profile) doesn't pull every image into memory. Only the image endpoint reads this.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "post_images")
public class PostImage {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   // ON DELETE CASCADE in the database, so every way a post is deleted (directly, deleteAll,
   // or through its user) also removes the image without loading it
   @OneToOne(fetch = FetchType.LAZY, optional = false)
   @JoinColumn(name = "post_id", nullable = false, unique = true)
   @OnDelete(action = OnDeleteAction.CASCADE)
   private Post post;

   @Column(name = "image_data", nullable = false)
   @JsonIgnore
   private byte[] imageData;

   @Column(name = "image_name")
   private String imageName;

   @Column(name = "image_type")
   private String imageType; // MIME type (e.g., "image/jpeg", "image/png")

   @Column(name = "image_size")
   private Long imageSize; // File size in bytes

   @Override
   public boolean equals(Object o) {
      if (this == o) {
         return true;
      }
      if (!(o instanceof PostImage other)) {
         return false;
      }
      return id != null && id.equals(other.getId());
   }

   @Override
   public int hashCode() {
      return getClass().hashCode();
   }
}
