package com.instragram.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.dto.request.LoginRequestDto;
import com.instragram.project.dto.request.SignUpRequestDto;
import com.instragram.project.dto.request.UpdateCredentialsRequestDto;
import com.instragram.project.dto.request.UpdateProfileRequestDto;
import com.instragram.project.dto.response.GetUserResponseDto;
import com.instragram.project.dto.response.LoginResponseDto;
import com.instragram.project.service.AppUserService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/users")
@Slf4j
public class AppUserController {

   @Autowired
   private AppUserService appUserService;

   // Login
   @PostMapping("/login")
   public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequestDto) {
      try {
         LoginResponseDto response = appUserService.verify(loginRequestDto);
         return ResponseEntity.ok(response);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
               .body(new LoginResponseDto(null, null, "Invalid credentials"));
      }
   }

   // Sign Up
   @PostMapping("/sign-up")
   public ResponseEntity<Void> register(@Valid @RequestBody SignUpRequestDto requestDto) {

      try {
         appUserService.signUp(requestDto);
         return ResponseEntity.status(HttpStatus.CREATED).build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
      }
   }

   // Get All Users
   @GetMapping
   public ResponseEntity<List<GetUserResponseDto>> getAllUsers() {
      try {
         List<GetUserResponseDto> responses = appUserService.getAllUsers();
         return ResponseEntity.status(HttpStatus.OK).body(responses);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Get User by Username
   @GetMapping("/{username}")
   public ResponseEntity<GetUserResponseDto> getUserByUsername(@PathVariable String username) {
      try {
         GetUserResponseDto response = appUserService.getUserByUsername(username);
         return ResponseEntity.status(HttpStatus.OK).body(response);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Get all Users excluding the logged in User
   @GetMapping("/excluded")
   public ResponseEntity<List<GetUserResponseDto>> getAllUsersExcludingCurrentUser() {
      try {
         String currentUser = getAuthenticatedUsername();
         List<GetUserResponseDto> includedUsers = appUserService.getAllUsersExcludingCurrentUser(currentUser);
         return ResponseEntity.status(HttpStatus.OK).body(includedUsers);
      } catch (RuntimeException e) {
         if (e.getMessage() != null && e.getMessage().contains("authenticated")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
         }
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // GET : All users following a certain user
   @GetMapping("/followers/{userId}")
   public ResponseEntity<List<GetUserResponseDto>> getAllFollowers(@PathVariable Long userId) {
      try {
         List<GetUserResponseDto> followers = appUserService.getAllFollowers(userId);
         return ResponseEntity.status(HttpStatus.OK).body(followers);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // GET : All users that a certain user follows
   @GetMapping("/followings/{userId}")
   public ResponseEntity<List<GetUserResponseDto>> getAllFollowings(@PathVariable Long userId) {
      try {

         List<GetUserResponseDto> followings = appUserService.getAllFollowings(userId);
         return ResponseEntity.status(HttpStatus.OK).body(followings);
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Update User Credentials
   @PutMapping("/{username}/update-credentials")
   public ResponseEntity<Void> updateUserCredentials(@PathVariable String username,
         @RequestBody UpdateCredentialsRequestDto requestDto) {
      try {
         appUserService.updateUserCredentials(username, requestDto);
         return ResponseEntity.status(HttpStatus.OK).build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Update User Profile
   @PutMapping("/{username}/update-profile")
   public ResponseEntity<Void> updateUserProfile(@PathVariable String username,
         @RequestBody UpdateProfileRequestDto requestDto) {
      try {
         appUserService.updateUserProfile(username, requestDto);
         return ResponseEntity.status(HttpStatus.OK).build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Delete User
   @DeleteMapping("/{username}")
   public ResponseEntity<Void> deleteUser(@PathVariable String username) {
      try {
         appUserService.deleteUser(username);
         return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
      } catch (Exception e) {
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
   }

   // Helper method to get authenticated user
   private String getAuthenticatedUsername() {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth == null || !auth.isAuthenticated() ||
            "anonymousUser".equals(auth.getName())) {
         throw new RuntimeException("User not authenticated");
      }
      return auth.getName();
   }

}