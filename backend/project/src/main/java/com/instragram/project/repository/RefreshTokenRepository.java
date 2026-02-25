package com.instragram.project.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.instragram.project.model.RefreshToken;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
   Optional<RefreshToken> findByToken(String token);

   List<RefreshToken> findByAppUserId(Long appUserId);

   void deleteByExpiryDateBefore(Instant date);

   @Query("SELECT rt FROM RefreshToken rt WHERE rt.appUser.id = :userId AND rt.revoked = false ORDER BY rt.createdAt DESC")
   List<RefreshToken> findActiveTokensByUserId(@Param("userId") Long userId);

   @Query("DELETE FROM RefreshToken rt WHERE rt.appUser.id = :appUserId")
   void deleteByAppUserId(@Param("appUserId") Long appUserId);

}
