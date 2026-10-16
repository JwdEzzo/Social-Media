package com.instragram.project.service;

import com.instragram.project.dto.post.response.GetPostResponse;
import com.instragram.project.dto.search.request.CreateSearchRequest;
import com.instragram.project.dto.search.response.GetSearchResponse;
import com.instragram.project.dto.user.request.SearchUserResponse;
import com.instragram.project.exception.NotFoundException;
import com.instragram.project.mapper.MappingMethods;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.RecentSearch;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.PostRepository;
import com.instragram.project.repository.RecentSearchRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {

	private final AppUserRepository appUserRepository;
	private final PostRepository postRepository;
	private final MappingMethods mappingMethods;
	private final RecentSearchRepository recentSearchRepository;

	/**
	 * Search for users by their username and return a page of SearchUserResponse.
	 */
	public Page<SearchUserResponse> searchUsers(String username, Pageable pageable) {
		return appUserRepository.findByUsernameContaining(username, pageable)
				.map(mappingMethods::convertAppUserEntityToSearchUserResponse);
	}

	// Search post by description (not case sensitive), one page at a time
	public Page<GetPostResponse> getPostsByDescription(String description, Pageable pageable) {
		return postRepository.findByDescriptionContaining(description, pageable)
				.map(mappingMethods::convertPostEntityToGetPostResponse);
	}

	// Save a search to the user's recents; searching the same term again bumps it
	// to the top
	@Transactional
	public GetSearchResponse createSearch(CreateSearchRequest request, String username) {
		AppUser user = getUserOrThrow(username);
		String term = request.getSearchTerm().trim();

		// Insert or bump in one statement, then read the row back for the response
		recentSearchRepository.upsert(user.getId(), term);
		RecentSearch recentSearch = recentSearchRepository.findByAppUserAndSearchTerm(user, term)
				.orElseThrow(() -> new NotFoundException("Search '" + term + "' was not found."));
		return mappingMethods.mapRecentSearchToGetSearchResponse(recentSearch);
	}

	private AppUser getUserOrThrow(String username) {
		return appUserRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
	}
}
