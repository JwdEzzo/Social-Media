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
import com.instragram.project.repository.SearchRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {

	private static final int MAX_RECENT_SEARCHES = 20;
	private final AppUserRepository appUserRepository;
	private final PostRepository postRepository;
	private final MappingMethods mappingMethods;
	private final SearchRepository searchRepository;

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
		// New term at 20 searches: the row is inserted, the user briefly has 21, and
		// the oldest is deleted.
		// Repeated term: the existing row is bumped, the count stays at 20, and nothing
		// is deleted.
		searchRepository.upsert(user.getId(), term);
		searchRepository.trimToMostRecent(user.getId(), MAX_RECENT_SEARCHES);
		RecentSearch recentSearch = getRecentSearchOrThrow(username, term);

		return mappingMethods.mapRecentSearchToGetSearchResponse(recentSearch);
	}

	public Page<GetSearchResponse> getSearchesForUser(String username, Pageable pageable) {
		AppUser user = getUserOrThrow(username);
		return searchRepository.findByAppUser(user, pageable).map(mappingMethods::mapRecentSearchToGetSearchResponse);
	}

	// Another user's search id gives the same 404 as a missing one, so callers
	// can't probe which ids exist
	@Transactional
	public void deleteSearchForUser(String username, Long searchId) {
		AppUser appUser = getUserOrThrow(username);
		int deleted = searchRepository.deleteByIdAndAppUser(searchId, appUser);
		if (deleted == 0) {
			throw new NotFoundException("Search " + searchId + " was not found.");
		}
	}

	@Transactional
	public void deleteAllSearchesForUser(String username) {
		AppUser appUser = getUserOrThrow(username);
		searchRepository.deleteAllByAppUser(appUser);
	}

	private AppUser getUserOrThrow(String username) {
		return appUserRepository.findByUsername(username)
				.orElseThrow(() -> new NotFoundException("User '" + username + "' was not found."));
	}

	private RecentSearch getRecentSearchOrThrow(String username, String searchTerm) {
		return searchRepository.findByAppUserAndSearchTerm(getUserOrThrow(username), searchTerm)
				.orElseThrow(() -> new NotFoundException("Search '" + searchTerm + "' was not found."));
	}
}
