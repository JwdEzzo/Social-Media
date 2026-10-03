package com.instragram.project.controller;

import java.net.URI;
import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.instragram.project.dto.security.request.LoginRequest;
import com.instragram.project.dto.security.request.SignUpRequest;
import com.instragram.project.dto.security.response.LoginResponse;
import com.instragram.project.dto.user.request.SearchUserResponse;
import com.instragram.project.dto.user.request.UpdateCredentialsRequest;
import com.instragram.project.dto.user.request.UpdateProfileRequest;
import com.instragram.project.dto.user.response.GetUserResponse;
import com.instragram.project.dto.user.response.SignUpResponse;
import com.instragram.project.enums.AccountStatus;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.service.AppUserService;
import com.instragram.project.utils.ApiResponse;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/users")
@Slf4j
public class AppUserController {

   private final AppUserService appUserService;
   private final MappingMethods mappingMethods;

    public AppUserController(AppUserService appUserService, MappingMethods mappingMethods) {
        this.appUserService = appUserService;
        this.mappingMethods = mappingMethods;
    }

    // POST: Login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse data = appUserService.verify(loginRequest);
        ApiResponse<LoginResponse> response = mappingMethods.mapToApiResponse(data, "Logged in successfully!");
        return ResponseEntity.ok(response);
    }

    // POST: Sign Up
    @PostMapping("/sign-up")
    public ResponseEntity<ApiResponse<SignUpResponse>> signUp(@Valid @RequestBody SignUpRequest request) {
        SignUpResponse data = appUserService.signUp(request);
        ApiResponse<SignUpResponse> response = mappingMethods.mapToApiResponse(data, "User registered successfully!");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PATCH: Toggle the caller's own account status
    @PatchMapping("/toggle-account-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AccountStatus>> toggleAccountStatus(Authentication authentication) {
        AccountStatus newStatus = appUserService.toggleAccountStatus(authentication.getName());
        ApiResponse<AccountStatus> response = mappingMethods.mapToApiResponse(newStatus, "Account status toggled successfully!");
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

   // GET: All users, paginated — ?page=0&size=20&sort=username,asc
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedModel<GetUserResponse>>> getAllUsers(
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        Page<GetUserResponse> page = appUserService.getAllUsers(pageable);
        ApiResponse<PagedModel<GetUserResponse>> response = mappingMethods.mapToApiResponse(new PagedModel<>(page), "Fetched users successfully!");
        return ResponseEntity.ok(response);
    }

    // GET: User by username
    @GetMapping("/username/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GetUserResponse> getUserByUsername(@PathVariable String username) {
        GetUserResponse response = appUserService.getUserByUsername(username);
        return ResponseEntity.ok(response);
    }

    // GET: User by ID
    @GetMapping("/id/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GetUserResponse> getUserById(@PathVariable Long id) {
        GetUserResponse response = appUserService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    // GET: All users except the currently logged in user
    @GetMapping("/excluded")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GetUserResponse>> getAllUsersExcludingCurrentUser(Authentication authentication) {
        List<GetUserResponse> users = appUserService.getAllUsersExcludingCurrentUser(authentication.getName());
        return ResponseEntity.ok(users);
    }

    // GET: All followers of a user, paginated — ?page=0&size=20&sort=username,asc
    @GetMapping("/followers/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedModel<GetUserResponse>>> getAllFollowers(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        Page<GetUserResponse> page = appUserService.getAllFollowers(userId, pageable);
        ApiResponse<PagedModel<GetUserResponse>> response = mappingMethods.mapToApiResponse(new PagedModel<>(page), "Fetched followers successfully!");
        return ResponseEntity.ok(response);
    }

    // GET: All users that a user follows, paginated — ?page=0&size=20&sort=username,asc
    @GetMapping("/followings/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedModel<GetUserResponse>>> getAllFollowings(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        Page<GetUserResponse> page = appUserService.getAllFollowings(userId, pageable);
        ApiResponse<PagedModel<GetUserResponse>> response = mappingMethods.mapToApiResponse(new PagedModel<>(page), "Fetched followings successfully!");
        return ResponseEntity.ok(response);
    }

    // GET: Search users by username, paginated — ?page=0&size=20&sort=username,asc
    @GetMapping("/search/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedModel<SearchUserResponse>>> searchUsers(
            @PathVariable String username,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        Page<SearchUserResponse> page = appUserService.searchUsers(username, pageable);
        ApiResponse<PagedModel<SearchUserResponse>> response = mappingMethods.mapToApiResponse(new PagedModel<>(page), "Fetched search results successfully!");
        return ResponseEntity.ok(response);
    }

    // GET: serve image bytes for a post
    @GetMapping(value = "/{id}/profile-image/preview")
    public ResponseEntity<Resource> getProfileImage(@PathVariable Long id) {
        byte[] bytes = appUserService.getProfileImageBytes(id);
        String contentType = appUserService.getProfileImageContentType(id);
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
            @RequestBody UpdateCredentialsRequest request,
            Authentication authentication) {

        if (!authentication.getName().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        appUserService.updateUserCredentials(username, request);
        return ResponseEntity.noContent().build();
    }

    // PUT: Update profile with URL
    @PutMapping(value = "/{actorUsername}/update-profile-url", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> updateUserProfileWithUrl(
        @PathVariable String actorUsername,
        @RequestBody UpdateProfileRequest request,
        Authentication authentication
    ){
        appUserService.updateUserProfileWithUrl(actorUsername, authentication.getName(), request);
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

        UpdateProfileRequest update = new UpdateProfileRequest();
        if (bioText != null && !bioText.trim().isEmpty()) {
            update.setBioText(bioText);
        }

        appUserService.updateUserProfileWithUpload(username, update, image);
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