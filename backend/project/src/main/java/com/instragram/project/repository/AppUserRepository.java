package com.instragram.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.instragram.project.model.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

   AppUser findByUsername(String username);

   AppUser findByEmail(String email);

   // Find users excluding the current user
   List<AppUser> findByUsernameNot(String username);
}
