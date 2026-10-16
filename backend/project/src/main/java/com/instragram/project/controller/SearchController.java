package com.instragram.project.controller;

import com.instragram.project.dto.post.response.GetPostResponse;
import com.instragram.project.dto.search.request.CreateSearchRequest;
import com.instragram.project.dto.search.response.GetSearchResponse;
import com.instragram.project.dto.user.request.SearchUserResponse;
import com.instragram.project.service.AppUserService;
import com.instragram.project.service.PostService;
import com.instragram.project.service.SearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instagram/searches")
@RequiredArgsConstructor
public class SearchController {

   private final PostService postService;
   private final AppUserService appUserService;
   private final SearchService searchService;

   // GET : Get posts by searching description, paginated
   @GetMapping("/search-posts/containing/{description}")
   public ResponseEntity<PagedModel<GetPostResponse>> getPostsByDescription(@PathVariable String description,
         @PageableDefault(size = 10, sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
      Page<GetPostResponse> posts = searchService.getPostsByDescription(description, pageable);
      return ResponseEntity.status(HttpStatus.OK).body(new PagedModel<>(posts));
   }

   // GET: Search users by username, paginated — ?page=0&size=20&sort=username,asc
   @GetMapping("/search/{username}")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<PagedModel<SearchUserResponse>> searchUsers(@PathVariable String username,
         @PageableDefault(size = 10, sort = "id") Pageable pageable) {
      Page<SearchUserResponse> page = searchService.searchUsers(username, pageable);
      return ResponseEntity.ok(new PagedModel<>(page));
   }

   // POST: Save a search to the logged-in user's recent searches
   @PostMapping("/recent")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<GetSearchResponse> createSearch(@Valid @RequestBody CreateSearchRequest request,
         Authentication authentication) {
      GetSearchResponse response = searchService.createSearch(request, authentication.getName());
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
   }

}
