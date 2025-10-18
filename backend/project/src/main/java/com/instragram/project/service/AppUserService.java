package com.instragram.project.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.instragram.project.dto.request.LoginRequestDto;
import com.instragram.project.dto.request.SignUpRequestDto;
import com.instragram.project.dto.request.UpdateCredentialsRequestDto;
import com.instragram.project.dto.request.UpdateProfileRequestDto;
import com.instragram.project.dto.response.GetUserResponseDto;
import com.instragram.project.dto.response.LoginResponseDto;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.FollowRepository;
import com.instragram.project.security.jwt.JwtService;

@Service
public class AppUserService {

   @Autowired
   private AppUserRepository appUserRepository;

   private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

   @Autowired
   private JwtService jwtService;

   @Autowired
   private AuthenticationManager authenticationManager;

   private final Logger log = LoggerFactory.getLogger(AppUserService.class);

   @Autowired
   private FollowRepository followRepository;

   @Autowired
   private final MappingMethods mappingMethods = new MappingMethods();

   // Sign Up User
   public void signUp(SignUpRequestDto requestDto) {

      if (appUserRepository.findByUsername(requestDto.getUsername()) != null) {
         throw new RuntimeException("User already exists with username: " + requestDto.getUsername());

      }

      AppUser appUser = mappingMethods.convertSignUpRequestToAppUserEntity(requestDto);
      appUserRepository.save(appUser);

   }

   // Get User by username
   public GetUserResponseDto getUserByUsername(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }
      return mappingMethods.convertAppUserEntityToGetUserResponse(user);
   }

   // Get User By Id
   public GetUserResponseDto getUserById(Long id) {
      AppUser user = appUserRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
      return mappingMethods.convertAppUserEntityToGetUserResponse(user);
   }

   // Get all Users
   public List<GetUserResponseDto> getAllUsers() {
      List<AppUser> users = appUserRepository.findAll();
      return users
            .stream()
            .map(user -> mappingMethods.convertAppUserEntityToGetUserResponse(user))
            .collect(Collectors.toList());
   }

   // Get all Users excluding the logged in
   public List<GetUserResponseDto> getAllUsersExcludingCurrentUser(String username) {
      List<AppUser> users = appUserRepository.findByUsernameNot(username);
      return users
            .stream()
            .map(user -> mappingMethods.convertAppUserEntityToGetUserResponse(user))
            .collect(Collectors.toList());
   }

   // Find all followers of a certain user
   public List<GetUserResponseDto> getAllFollowers(Long userId) {
      AppUser user = appUserRepository.findById(userId).get();

      if (user == null) {
         throw new RuntimeException("User not found: " + user);
      }
      List<AppUser> followersOfUser = followRepository.findFollowersByUserId(userId);
      return followersOfUser
            .stream()
            .map(follower -> mappingMethods
                  .convertAppUserEntityToGetUserResponse(follower))
            .collect(Collectors.toList());
   }

   // Find the users that are followed by a certain user
   public List<GetUserResponseDto> getAllFollowings(Long userId) {
      AppUser user = appUserRepository.findById(userId).get();

      if (user == null) {
         throw new RuntimeException("User not found: " + user);
      }
      List<AppUser> followingsOfUser = followRepository.findFollowingsByUserId(userId);
      return followingsOfUser
            .stream()
            .map(follower -> mappingMethods
                  .convertAppUserEntityToGetUserResponse(follower))
            .collect(Collectors.toList());
   }

   // Delete user by username
   public void deleteUser(String username, String password) {
      // Find the user
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }

      // Verify the password
      if (!encoder.matches(password, user.getPassword())) {
         throw new RuntimeException("Invalid credentials. Account deletion failed.");
      }

      // Delete the user
      appUserRepository.delete(user);
      log.info("User account deleted successfully: " + username);
   }

   // Update User Credentials
   public void updateUserCredentials(String username, UpdateCredentialsRequestDto newUser) {
      // Get old user
      AppUser oldUser = appUserRepository.findByUsername(username);

      // Set updatedAt to now
      LocalDateTime updatedNow = LocalDateTime.now();
      if (oldUser == null) {
         throw new RuntimeException("Error 404 === User with username: " + username + " not found");
      }

      // Check if old password is correct
      if (!encoder.matches(newUser.getOldPassword(), oldUser.getPassword())) {
         throw new RuntimeException("Invalid credentials. Account update failed.");
      }

      // Check if email already exists and if it is not the same as the old email
      if (appUserRepository.findByEmail(newUser.getEmail()) != null && !newUser.getEmail().equals(oldUser.getEmail())) {
         throw new RuntimeException("Email already exists. Account update failed.");
      }

      oldUser.setEmail(newUser.getEmail());

      // Check if username already exists
      if (appUserRepository.findByUsername(newUser.getUsername()) != null
            && !newUser.getUsername().equals(oldUser.getUsername())) {
         throw new RuntimeException("Username already exists. Account update failed.");
      }
      oldUser.setUsername(newUser.getUsername());

      // Check if new password is the same as the old password
      if (encoder.matches(newUser.getNewPassword(), oldUser.getPassword())) {
         throw new RuntimeException("Invalid credentials. Account update failed.");

      }

      oldUser.setPassword(encoder.encode(newUser.getNewPassword()));
      oldUser.setUpdatedAt(updatedNow);
      appUserRepository.save(oldUser);
   }

   // Update User Profile
   public void updateUserProfile(String username, UpdateProfileRequestDto newUser) {
      AppUser oldUser = appUserRepository.findByUsername(username);
      LocalDateTime updatedNow = LocalDateTime.now();
      if (oldUser == null) {
         throw new RuntimeException("Error 404 === User with username: " + username + " not found");
      }
      log.info("Checking if bio text is the same as the old bio text");
      if (Objects.equals(newUser.getBioText(), oldUser.getBioText())
            && Objects.equals(newUser.getProfilePictureUrl(), oldUser.getProfilePictureUrl())) {
         throw new RuntimeException("Bio text and profile pic is the same as the old bio text and profile pic.");
      }

      oldUser.setBioText(newUser.getBioText());
      oldUser.setProfilePictureUrl(newUser.getProfilePictureUrl());
      oldUser.setUpdatedAt(updatedNow);
      appUserRepository.save(oldUser);
   }

   // Verify Login
   public LoginResponseDto verify(LoginRequestDto loginRequestDto) {
      try {
         AppUser appUser = appUserRepository.findByUsername(loginRequestDto.getUsername());
         if (appUser == null) {
            throw new RuntimeException("User not found with username: " + loginRequestDto.getUsername());
         }

         Authentication authentication = authenticationManager.authenticate(
               new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword()));

         if (authentication.isAuthenticated()) {
            String token = jwtService.generateToken(loginRequestDto.getUsername());
            return new LoginResponseDto(token, loginRequestDto.getUsername(), "Login successful");
         }
      } catch (RuntimeException e) {
         log.error("Authentication failed for user: " + loginRequestDto.getUsername(), e);
         throw new RuntimeException("Invalid credentials");
      }

      return null;
   }

   // Delete User
   public void deleteUser(String username) {
      AppUser user = appUserRepository.findByUsername(username);
      if (user == null) {
         throw new RuntimeException("User not found with username: " + username);
      }
      appUserRepository.delete(user);
   }
}