package com.instragram.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.instragram.project.model.ProfilePicture;

public interface ProfilePictureRepository extends JpaRepository<ProfilePicture, Long> {

   // No *OrThrowNotFound variant: every call site here treats a missing picture as a
   // normal case (orElseGet / orElse a default content type), not as a 404.
   Optional<ProfilePicture> findByAppUserUsername(String username);

   Optional<ProfilePicture> findByAppUserId(Long userId);

   void deleteByAppUserUsername(String username);

   void deleteByAppUserId(Long userId);
}
