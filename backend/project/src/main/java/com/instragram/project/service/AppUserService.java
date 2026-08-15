package com.instragram.project.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.instragram.project.dto.security.request.LoginRequestDto;
import com.instragram.project.dto.security.request.SignUpRequestDto;
import com.instragram.project.dto.security.response.LoginResponseDto;
import com.instragram.project.dto.user.request.SearchUserResponseDto;
import com.instragram.project.dto.user.request.UpdateCredentialsRequestDto;
import com.instragram.project.dto.user.request.UpdateProfileRequestDto;
import com.instragram.project.dto.user.response.GetUserResponseDto;
import com.instragram.project.enums.AccountStatus;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.ProfilePicture;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.FollowRepository;
import com.instragram.project.repository.ProfilePictureRepository;
import com.instragram.project.security.jwt.JwtService;

import jakarta.transaction.Transactional;

@Service
public class AppUserService {

   private final AppUserRepository appUserRepository;
   private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
   private final JwtService jwtService;
   private final AuthenticationManager authenticationManager;
   private final Logger log = LoggerFactory.getLogger(AppUserService.class);
   private final FollowRepository followRepository;
   private final MappingMethods mappingMethods;
   private final ProfilePictureRepository profilePictureRepository;

   public AppUserService(AppUserRepository appUserRepository, JwtService jwtService,
         AuthenticationManager authenticationManager, FollowRepository followRepository,
         MappingMethods mappingMethods, ProfilePictureRepository profilePictureRepository) {
      this.appUserRepository = appUserRepository;
      this.jwtService = jwtService;
      this.authenticationManager = authenticationManager;
      this.followRepository = followRepository;
      this.mappingMethods = mappingMethods;
      this.profilePictureRepository = profilePictureRepository;
   }

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

   // Set account to private
   public void toggleAccountStatus(Long requestingUserId, Long targetUserId) {

      if (!requestingUserId.equals(targetUserId)) {
         throw new AccessDeniedException("You can't toggle the account status of another user.");
      }

      AppUser user = appUserRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + targetUserId));

      if (user.getAccountStatus() == AccountStatus.PUBLIC) {
         user.setAccountStatus(AccountStatus.PRIVATE);
      } else {
         user.setAccountStatus(AccountStatus.PUBLIC);
      }

      appUserRepository.save(user);
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

   public List<SearchUserResponseDto> searchUsers(String username) {
      List<AppUser> users = appUserRepository.findByUsernameContaining(username);
      return users.stream()
            .map(user -> mappingMethods.convertAppUserEntityToSearchUserResponse(user))
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

   // Update User Profile With Url
   @Transactional
   public void updateUserProfileWithUrl(String username, UpdateProfileRequestDto updateDto) {
      AppUser user = appUserRepository.findByUsername(username);
      LocalDateTime updatedNow = LocalDateTime.now();

      if (user == null) {
         throw new RuntimeException("Error 404 === User with username: " + username + " not found");
      }

      // Update bio if provided
      if (updateDto.getBioText() != null) {
         user.setBioText(updateDto.getBioText());
      }

      // Update profile picture URL if provided
      if (updateDto.getProfilePictureUrl() != null && !updateDto.getProfilePictureUrl().trim().isEmpty()) {
         user.setProfilePictureUrl(updateDto.getProfilePictureUrl());
         // Switching to an external URL — drop any previously uploaded bytes.
         profilePictureRepository.deleteByAppUserUsername(username);
      }

      user.setUpdatedAt(updatedNow);
      appUserRepository.save(user);
   }

   // Update User Profile With Upload
   @Transactional
   public void updateUserProfileWithUpload(String username, UpdateProfileRequestDto updateDto, MultipartFile image) {
      AppUser user = appUserRepository.findByUsername(username);
      LocalDateTime updatedNow = LocalDateTime.now();

      if (user == null) {
         throw new RuntimeException("Error 404 === User with username: " + username + " not found");
      }

      // If no image is provided, only update bio
      if (image == null || image.isEmpty()) {
         if (updateDto.getBioText() != null) {
            user.setBioText(updateDto.getBioText());
         }
         user.setUpdatedAt(updatedNow);
         appUserRepository.save(user);
         return;
      }

      try {
         // Update bio if provided
         if (updateDto.getBioText() != null) {
            user.setBioText(updateDto.getBioText());
         }

         user.setUpdatedAt(updatedNow);
         user.setProfilePictureUrl("http://localhost:8080/api/instagram/users/" + username + "/profile-image/preview");
         appUserRepository.save(user);

         ProfilePicture picture = profilePictureRepository.findByAppUserUsername(username)
               .orElseGet(ProfilePicture::new);
         picture.setAppUser(user);
         picture.setImageData(image.getBytes());
         picture.setImageName(image.getOriginalFilename());
         picture.setImageType(image.getContentType());
         picture.setImageSize(image.getSize());
         profilePictureRepository.save(picture);
      } catch (IOException e) {
         throw new RuntimeException("Failed to save uploaded image", e);
      }
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

   @Transactional
   public byte[] getProfileImageBytes(String username) {
      return profilePictureRepository.findByAppUserUsername(username)
            .map(ProfilePicture::getImageData)
            .orElseThrow(() -> new RuntimeException(
                  "No image data stored for User Profile Picture: " + username));
   }

   @Transactional
   public String getProfileImageContentType(String username) {
      return profilePictureRepository.findByAppUserUsername(username)
            .map(ProfilePicture::getImageType)
            .orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
   }
}