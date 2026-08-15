package com.instragram.project.model;

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
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "profile_pictures")
public class ProfilePicture {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @OneToOne(fetch = FetchType.LAZY, optional = false)
   @JoinColumn(name = "app_user_id", nullable = false, unique = true)
   private AppUser appUser;

   @Column(name = "image_data", nullable = false)
   @JsonIgnore
   private byte[] imageData;

   @Column(name = "image_name")
   private String imageName;

   @Column(name = "image_type")
   private String imageType;

   @Column(name = "image_size")
   private Long imageSize; // File size in bytes

   @Override
   public boolean equals(Object o) {
      if (this == o) {
         return true;
      }
      if (!(o instanceof ProfilePicture other)) {
         return false;
      }
      return id != null && id.equals(other.getId());
   }

   @Override
   public int hashCode() {
      return getClass().hashCode();
   }
}
