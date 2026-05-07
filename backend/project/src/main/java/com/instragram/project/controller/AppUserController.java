package com.instragram.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.instragram.project.dto.request.LoginRequestDto;
import com.instragram.project.dto.request.SignUpRequestDto;
import com.instragram.project.dto.request.UpdateCredentialsRequestDto;
import com.instragram.project.dto.request.UpdateProfileRequestDto;
import com.instragram.project.dto.response.GetUserResponseDto;
import com.instragram.project.dto.response.LoginResponseDto;
import com.instragram.project.dto.response.SearchUserResponseDto;
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

    // POST: Login
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        LoginResponseDto response = appUserService.verify(loginRequestDto);
        return ResponseEntity.ok(response);
    }

    // POST: Sign Up
    @PostMapping("/sign-up")
    public ResponseEntity<Void> register(@Valid @RequestBody SignUpRequestDto requestDto) {
        appUserService.signUp(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // POST: Toggle account status
    @PostMapping("/toggle-account-status/{targetUserId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> toggleAccountStatus(
            @PathVariable Long targetUserId,
            Authentication authentication) {

        Long requestingUserId = appUserService.getUserByUsername(authentication.getName()).getId();
        appUserService.toggleAccountStatus(requestingUserId, targetUserId);
        return ResponseEntity.noContent().build();
    }

   // GET: All users
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GetUserResponseDto>> getAllUsers() {
        List<GetUserResponseDto> responses = appUserService.getAllUsers();
        return ResponseEntity.ok(responses);
    }

    // GET: User by username
    @GetMapping("/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GetUserResponseDto> getUserByUsername(@PathVariable String username) {
        GetUserResponseDto response = appUserService.getUserByUsername(username);
        return ResponseEntity.ok(response);
    }

    // GET: All users except the currently logged in user
    @GetMapping("/excluded")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GetUserResponseDto>> getAllUsersExcludingCurrentUser(Authentication authentication) {
        List<GetUserResponseDto> users = appUserService.getAllUsersExcludingCurrentUser(authentication.getName());
        return ResponseEntity.ok(users);
    }

    // GET: All followers of a user
    @GetMapping("/followers/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GetUserResponseDto>> getAllFollowers(@PathVariable Long userId) {
        List<GetUserResponseDto> followers = appUserService.getAllFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    // GET: All users that a user follows
    @GetMapping("/followings/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GetUserResponseDto>> getAllFollowings(@PathVariable Long userId) {
        List<GetUserResponseDto> followings = appUserService.getAllFollowings(userId);
        return ResponseEntity.ok(followings);
    }

    // GET: Search users by username
    @GetMapping("/search/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SearchUserResponseDto>> searchUsers(@PathVariable String username) {
        List<SearchUserResponseDto> users = appUserService.searchUsers(username);
        return ResponseEntity.ok(users);
    }

    // GET: serve image bytes for a post
    @GetMapping(value = "/{username}/profile-image/preview")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String username) {
        byte[] bytes = appUserService.getProfileImageBytes(username);
        String contentType = appUserService.getProfileImageContentType(username);
        ByteArrayResource resource = new ByteArrayResource(bytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(bytes.length))
                .contentType(MediaType
                    .parseMediaType(contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                .body(resource);
    }

    // PUT: Update credentials (email, username, password)
    @PutMapping("/{username}/update-credentials")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateUserCredentials(
            @PathVariable String username,
            @RequestBody UpdateCredentialsRequestDto requestDto,
            Authentication authentication) {

        if (!authentication.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        appUserService.updateUserCredentials(username, requestDto);
        return ResponseEntity.noContent().build();
    }

    // PUT: Update profile with URL
    @PutMapping(value = "/{username}/update-profile-url", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateUserProfileWithUrl(
            @PathVariable String username,
            @RequestBody UpdateProfileRequestDto updateDto,
            Authentication authentication) {

        if (!authentication.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        appUserService.updateUserProfileWithUrl(username, updateDto);
        return ResponseEntity.noContent().build();
    }

    // PUT: Update profile with image upload
    @PutMapping(value = "/{username}/update-profile-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateUserProfileWithUpload(
            @PathVariable String username,
            @RequestParam(value = "bioText", required = false) String bioText,
            @RequestParam(value = "profileImage", required = false) MultipartFile image,
            Authentication authentication) {

        if (!authentication.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UpdateProfileRequestDto dto = new UpdateProfileRequestDto();
        if (bioText != null && !bioText.trim().isEmpty()) {
            dto.setBioText(bioText);
        }

        appUserService.updateUserProfileWithUpload(username, dto, image);
        return ResponseEntity.noContent().build();
    }

    // DELETE: Delete own account
    @DeleteMapping("/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteUser(
            @PathVariable String username,
            Authentication authentication) {

        if (!authentication.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        appUserService.deleteUser(username);
        return ResponseEntity.noContent().build();
    }


}