package com.instragram.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.instragram.project.service.PostSaveService;

import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/instagram/post-saves")
@Slf4j
public class PostSaveController {

   @Autowired
   private PostSaveService postSaveService;

   // POST : Toggle Save
   @PostMapping("/post/{postId}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Void> toggleSave(@PathVariable Long postId, Authentication authentication) {
      log.info("Toggle Save: postId={}, username={}", postId, authentication.getName());
      String username = authentication.getName();
      postSaveService.toggleSave(username, postId);
      log.info("Save toggled successfully");
      return ResponseEntity.noContent().build();
   }

   // GET : Get a Post's save count
   @GetMapping("/post/{postId}/save-count")
   public ResponseEntity<Long> getSaveCount(@PathVariable Long postId) {
      long count = postSaveService.getSaveCount(postId);
      return ResponseEntity.ok(count);
   }

   // GET boolean : Check if a user saved a post
   @GetMapping("/post/{postId}/is-saved")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<Boolean> isSavedByCurrentUser(@PathVariable Long postId, Authentication authentication) {
      String username = authentication.getName();
      boolean isSaved = postSaveService.isSavedByUser(username, postId);
      return ResponseEntity.ok(isSaved);
   }

}
