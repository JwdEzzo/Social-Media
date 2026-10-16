package com.instragram.project.repository;

import com.instragram.project.model.AppUser;
import com.instragram.project.model.RecentSearch;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecentSearchRepository extends JpaRepository<RecentSearch, Long> {

   // Find a user's search by its term
   Optional<RecentSearch> findByAppUserAndSearchTerm(AppUser appUser, String searchTerm);

   // Insert a search, or bump created_at when the user already searched this term,
   // so it moves back to the top.
   // Safe under concurrent requests: the second one updates the row the first
   // inserted instead of failing.
   // Native because JPQL has no ON CONFLICT; @PrePersist does not run here, so
   // created_at is set in SQL.
   @Modifying
   @Query(value = """
         INSERT INTO recent_searches (app_user_id, search_term, created_at)
         VALUES (:userId, :searchTerm, now())
         ON CONFLICT (app_user_id, search_term) DO UPDATE SET created_at = EXCLUDED.created_at
         """, nativeQuery = true)
   int upsert(@Param("userId") Long userId, @Param("searchTerm") String searchTerm);
}
