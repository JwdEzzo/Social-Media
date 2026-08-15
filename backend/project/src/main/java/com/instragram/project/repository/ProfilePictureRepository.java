package com.instragram.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.instragram.project.model.ProfilePicture;

public interface ProfilePictureRepository extends JpaRepository<ProfilePicture, Long> {

   Optional<ProfilePicture> findByAppUserUsername(String username);

   void deleteByAppUserUsername(String username);
}
