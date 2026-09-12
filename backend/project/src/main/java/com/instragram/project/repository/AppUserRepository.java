package com.instragram.project.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.instragram.project.model.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

   Optional<AppUser> findByUsername(String username);

   Optional<AppUser> findByEmail(String email);

   // Existence checks for sign-up: cheaper than findBy*, and they state intent.
   boolean existsByUsername(String username);

   boolean existsByEmail(String email);

   // Find users excluding the current user
   List<AppUser> findByUsernameNot(String username);

   @Query("SELECT au FROM AppUser au WHERE LOWER(au.username) LIKE LOWER(CONCAT('%', :username, '%'))")
   List<AppUser> findByUsernameContaining(@Param("username") String username);
}