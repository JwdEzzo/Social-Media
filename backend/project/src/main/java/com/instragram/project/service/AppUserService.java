package com.instragram.project.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.instragram.project.dto.security.request.LoginRequest;
import com.instragram.project.dto.security.request.SignUpRequest;
import com.instragram.project.dto.security.response.LoginResponse;
import com.instragram.project.dto.user.response.SignUpResponse;
import com.instragram.project.dto.user.response.UpdateUserProfileResponse;
import com.instragram.project.dto.user.request.SearchUserResponse;
import com.instragram.project.dto.user.request.UpdateCredentialsRequest;
import com.instragram.project.dto.user.request.UpdateProfileRequest;
import com.instragram.project.dto.user.response.GetUserResponse;
import com.instragram.project.enums.AccountStatus;
import com.instragram.project.exception.BadRequestException;
import com.instragram.project.exception.ConflictException;
import com.instragram.project.exception.ForbiddenException;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.exception.UnauthorizedException;
import com.instragram.project.exception.AlreadyExistsException;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.ProfilePicture;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.FollowRepository;
import com.instragram.project.repository.ProfilePictureRepository;
import com.instragram.project.security.jwt.JwtService;
import com.instragram.project.utils.FieldViolation;

import jakarta.transaction.Transactional;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class AppUserService {

   private final AppUserRepository appUserRepository;
   private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
   private final JwtService jwtService;
   private final AuthenticationManager authenticationManager;
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

   /**
    * Sign up a new user with the {@link SignUpRequest} <br>
    * Checks if the data already exists in DB <br>
    * @return {@link SignUpResponse} with the newly created user data and a JWT token. <br>
    */
   @Transactional
   public SignUpResponse signUp(SignUpRequest request) {

      // Step 1: Validate request
      validateSignUpRequestOrThrow(request);

      // Step 2: Convert the request DTO to an AppUser entity
      AppUser appUser = mappingMethods.convertSignUpRequestToAppUserEntity(request);

      // TODO: needs locking
      try {
         // saveAndFlush forces the INSERT here, inside the try, so a constraint violation
         // is thrown where we can translate it. Plain save() defers the flush to commit,
         // after this method has returned. It also guarantees the generated id and the
         // @PrePersist createdAt are populated before we map the response.
         AppUser saved = appUserRepository.saveAndFlush(appUser);
         return mappingMethods.convertAppUserEntityToSignUpResponse(saved);
      } catch (DataIntegrityViolationException e) {
         // Lost the race: another request claimed this username or email between the
         // checks above and this insert. Which of the two it was would mean parsing the
         // constraint name out of the exception, so the message stays deliberately vague.
         throw new AlreadyExistsException("signup.conflict", e);
      }
   }

   public GetUserResponse getUserByUsername(String username) {
      AppUser user = getUserByUsernameOrThrow(username);
      return mappingMethods.convertAppUserEntityToGetUserResponse(user);
   }

   public GetUserResponse getUserById(Long id) {
      AppUser user = getUserByIdOrThrow(id);
      return mappingMethods.convertAppUserEntityToGetUserResponse(user);
   }

   /**
    *  Get a page of {@code AppUser}s and return it as a page of GetUserResponse.
    *  The {@code Pageable} carries the page number, size and sort, and the returned
    *  {@link Page} carries the total count so the caller can render pagination controls.
    */
   public Page<GetUserResponse> getAllUsers(Pageable pageable) {
      // map() keeps the page metadata (number, size, totalElements) and only
      // converts the content, so no second count query is issued.
      return appUserRepository
            .findAll(pageable)
            .map(mappingMethods::convertAppUserEntityToGetUserResponse);
   }

   public List<GetUserResponse> getAllUsersExcludingCurrentUser(String username) {
      List<AppUser> users = appUserRepository.findByUsernameNot(username);
      return users
            .stream()
            .map(user -> mappingMethods.convertAppUserEntityToGetUserResponse(user))
            .collect(Collectors.toList());
   }

   /**
    * Toggle the account status of the caller between PUBLIC and PRIVATE.
    *
    * @param username the caller's own username, resolved from the SecurityContext.
    *                 Never accept this from the request.
    */
   public AccountStatus toggleAccountStatus(String username) {

      // Step 1: Retrieve the caller.
      // There is no target to authorize against — the principal *is* the target.
      AppUser user = getUserByUsernameOrThrow(username);

      // Step 2: Toggle the account status.
      if (user.getAccountStatus() == AccountStatus.PUBLIC) {
         user.setAccountStatus(AccountStatus.PRIVATE);
      } else {
         user.setAccountStatus(AccountStatus.PUBLIC);
      }

      // Step 3: Save the change and return the new status.
      appUserRepository.save(user);
      return user.getAccountStatus();
   }
   
   /**
    * Find all followers of a certain user and return a list of GetUserResponse.
    */
   public List<GetUserResponse> getAllFollowers(Long userId) {
      
      getUserByIdOrThrow(userId);

      List<AppUser> followersOfUser = followRepository.findFollowersByUserId(userId);
      
      return followersOfUser
            .stream()
            .map(follower -> mappingMethods.convertAppUserEntityToGetUserResponse(follower))
            .collect(Collectors.toList());
   }

   /**
    * Find the users that are followed by a certain user and return a list of GetUserResponse.
    */
   public List<GetUserResponse> getAllFollowings(Long userId) {

      getUserByIdOrThrow(userId);

      List<AppUser> followingsOfUser = followRepository.findFollowingsByUserId(userId);
      return followingsOfUser
            .stream()
            .map(follower -> mappingMethods.convertAppUserEntityToGetUserResponse(follower))
            .collect(Collectors.toList());
   }

   /**
    * Search for users by their username and return a list of SearchUserResponse.
    */
   public List<SearchUserResponse> searchUsers(String username) {

      List<AppUser> users = appUserRepository.findByUsernameContaining(username);

      return users
            .stream()
            .map(user -> mappingMethods.convertAppUserEntityToSearchUserResponse(user))
            .collect(Collectors.toList());
   }

   /**
    * Update the credentials of the caller, including email, username, and password. <br>
    * The old password must be provided for verification. <br>
    * Every field is optional: a blank one leaves that credential untouched. <br>
    * A field that carries the value the account already has is an error, throws {@code 400} instead of succeeding. <br>
    * A field that collides with <b>another</b> account still answers {@code 409}.
    *
    * @param username the caller's own username, resolved from the SecurityContext.
    *                 Never accept this from the request.
    */
   public UpdateUserProfileResponse updateUserCredentials(String username, UpdateCredentialsRequest newUser) {

      // Step 1: Get the caller by username or throw NotFoundException if not found
      AppUser user = getUserByUsernameOrThrow(username);

      // Step 2: The old password proves the caller owns the account; every change below depends on it.
      if (!encoder.matches(newUser.getOldPassword(), user.getPassword())) {
         throw new BadRequestException("error.old.password.different");
      }
      // Step 3: Check and update email if provided
      if (StringUtils.hasText(newUser.getEmail())) {
         if (newUser.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException("error.same.email");
         }
         checkUserExistsByEmailOrThrow(newUser.getEmail());
         user.setEmail(newUser.getEmail());
      }
      // Step 4: Check and update username if provided
      if (StringUtils.hasText(newUser.getUsername())) {
         if (newUser.getUsername().equals(user.getUsername())) {
            throw new BadRequestException("error.same.username");
         }
         checkUserExistsByUsernameOrThrow(newUser.getUsername());
         user.setUsername(newUser.getUsername());
      }
      // Step 5: Check and update password if provided
      if (StringUtils.hasText(newUser.getNewPassword())) {
         if (encoder.matches(newUser.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("error.same.password");
         }
         user.setPassword(encoder.encode(newUser.getNewPassword()));
      }
      // Step 6: Update the timestamp, save, and return the user
      user.setUpdatedAt(LocalDateTime.now());
      appUserRepository.save(user);
      return new UpdateUserProfileResponse(user.getBioText(), user.getProfilePictureUrl());
   }

   /**
    * Update the caller's profile, including bio and profile picture URL.
    * If a new profile picture URL is provided, any previously uploaded bytes are deleted.
    *
    * @param username the caller's own username, resolved from the SecurityContext.
    *                 Never accept this from the request.
    */
   @Transactional
   public void updateUserProfileWithUrl(String username, UpdateProfileRequest updateDto) {

      // Step 1: Get the caller
      AppUser user = getUserByUsernameOrThrow(username);

      // Step 2: Update bio if provided
      if (StringUtils.hasText(updateDto.getBioText())) {
         user.setBioText(updateDto.getBioText());
      }

      // Step 3: Update profile picture URL if provided
      if (StringUtils.hasText(updateDto.getProfilePictureUrl())) {

         user.setProfilePictureUrl(updateDto.getProfilePictureUrl());
         // Switching to an external URL — drop any previously uploaded bytes.
         profilePictureRepository.deleteByAppUserId(user.getId());
      }

      // Step 4: Update the timestamp and save the user
      user.setUpdatedAt(LocalDateTime.now());
      appUserRepository.save(user);
   }

   /**
    * Update the caller's profile, including bio and profile picture upload.
    * If a new image is provided, it replaces any previously uploaded profile picture.
    *
    * @param username the caller's own username, resolved from the SecurityContext.
    *                 Never accept this from the request.
    */
   @Transactional
   public void updateUserProfileWithUpload(String username, UpdateProfileRequest updateDto, MultipartFile image) {

      // Step 1: Get the caller
      AppUser user = getUserByUsernameOrThrow(username);

      // Step 2: If no image is provided, only update bio
      if (image == null || image.isEmpty()) {
         if (StringUtils.hasText(updateDto.getBioText())) {
            user.setBioText(updateDto.getBioText());
         }
         user.setUpdatedAt(LocalDateTime.now());
         appUserRepository.save(user);
         return;
      }
      try {
         // Step 3: Update bio if provided
         if (StringUtils.hasText(updateDto.getBioText())) {
            user.setBioText(updateDto.getBioText());
         }

         // Step 4: Update the timestamp, set profile picture URL, and save the user
         user.setUpdatedAt(LocalDateTime.now());
         user.setProfilePictureUrl("http://localhost:8080/api/instagram/users/" + user.getId() + "/profile-image/preview");
         appUserRepository.save(user);

         ProfilePicture picture = profilePictureRepository.findByAppUserId(user.getId())
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


   /**
    * Verify user credentials and generate a JWT token if valid. <br>
    * No lookup for the user in DB.
    * {@code AuthenticationManager.authenticate(..)} already resolves the user through
    * AppUserDetailsService, which throws UsernameNotFoundException (an
    * AuthenticationException), gets caught. <br> 
    */
   public LoginResponse verify(LoginRequest loginRequestDto) {
      try {
         // Step 1: Authenticate the user with the provided credentials
         authenticationManager.authenticate(
               new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword()));

         // Step 2: Generate a JWT token for the authenticated user and return LoginResponse
         String token = jwtService.generateToken(loginRequestDto.getUsername());
         return new LoginResponse(token, loginRequestDto.getUsername());

         // Step 3: Catch if Step 1 throws
      } catch (AuthenticationException e) {
         log.warn("Failed login attempt for username: {}", loginRequestDto.getUsername());
         throw new UnauthorizedException("error.invalid.credentials");
      }
   }

   /**
    * Delete the caller's account after verifying the password.
    *
    * @param username the caller's own username, resolved from the SecurityContext.
    *                 Never accept this from the request.
    */
   public void deleteUser(String username, String password) {
      // Step 1: Retrieve the caller and verify the password
      AppUser user = getUserByUsernameOrThrow(username);
      if (!encoder.matches(password, user.getPassword())) {
         throw new ForbiddenException("error.invalid.credentials");
      }
      // Step 2: Delete the user
      appUserRepository.delete(user);
      log.info("User account deleted successfully: " + username);
   }

   /**
    * Get the profile image bytes of a user by their id.
    * Throws NotFoundException if the profile picture is not found.
    */
   @Transactional
   public byte[] getProfileImageBytes(Long id) {
      return profilePictureRepository.findByAppUserId(id)
            .map(ProfilePicture::getImageData)
            .orElseThrow(() -> new NotFoundException("user.profile.picture.notfound", id));
   }

   /**
    * Get the content type of a user's profile image by their id.
    * Returns APPLICATION_OCTET_STREAM if the profile picture is not found.
    */
   @Transactional
   public String getProfileImageContentType(Long id) {
      return profilePictureRepository.findByAppUserId(id)
            .map(ProfilePicture::getImageType)
            .orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
   }

   // ===================== PRIVATE HELPERS =====================
   //
   //
   //
   //

   /**
    * Get user by username or throw NotFoundException if not found.
    */
   private AppUser getUserByUsernameOrThrow(String username) {
      return appUserRepository.findByUsername(username)
            .orElseThrow(() -> new NotFoundException("user.notfound", username));
   }

   /**
    * Get user by id or throw NotFoundException if not found.
    */
   private AppUser getUserByIdOrThrow(Long id) {
      return appUserRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("user.notfound.id", id));
   }

   /**
    * Check if a user exists by username and throw AlreadyExistsException if it does.
    */
   private void checkUserExistsByUsernameOrThrow(String username) {
      if (appUserRepository.existsByUsername(username)) {
            throw new AlreadyExistsException("user.exists", username);
      }
   }

   /**
    * Check if a user exists by email and throw AlreadyExistsException if it does.
    */
   private void checkUserExistsByEmailOrThrow(String email) {
      if (appUserRepository.existsByEmail(email)) {
         throw new AlreadyExistsException("email.exists", email);
      }
   }

   /**
    * Validate the sign-up request and throw a ConflictException if there are any conflicts (e.g., username or email already exists). <br>
    * Our logic before sent out only 1 conflict at a time, but now we collect all conflicts and report them together.
    * @param request
    */
   private void validateSignUpRequestOrThrow(SignUpRequest request) {
      List<FieldViolation> conflicts = new ArrayList<>();
      if (appUserRepository.existsByUsername(request.getUsername())) {
         conflicts.add(new FieldViolation("username", "user.exists", request.getUsername()));
      }
      if (appUserRepository.existsByEmail(request.getEmail())) {
         conflicts.add(new FieldViolation("email", "email.exists", request.getEmail()));
      }
      if (!conflicts.isEmpty()) {
         throw new ConflictException("signup.conflict", conflicts);
      }
   }
}