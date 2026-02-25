package com.instragram.project.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.instragram.exception.TokenRefreshException;
import com.instragram.project.model.AppUser;
import com.instragram.project.model.RefreshToken;
import com.instragram.project.repository.AppUserRepository;
import com.instragram.project.repository.RefreshTokenRepository;

import jakarta.transaction.Transactional;

@Service
public class RefreshTokenService {

   @Value("${jwt.refresh.expiration}")
   private Long refreshTokenDurationMs;

   @Autowired
   private RefreshTokenRepository refreshTokenRepository;

   @Autowired
   private AppUserRepository appUserRepository;

   // Create new refresh token (doesnt delete old one)
   public RefreshToken createRefreshToken(Long appUserId) {
      AppUser appUser = appUserRepository.findById(appUserId).get();

      RefreshToken refreshToken = new RefreshToken();
      refreshToken.setAppUser(appUser);
      refreshToken.setToken(UUID.randomUUID().toString());
      refreshToken.setRevoked(false);
      refreshToken.setCreatedAt(Instant.now());
      refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));

      refreshTokenRepository.save(refreshToken);
      return refreshToken;
   }

   public Optional<RefreshToken> findByToken(String token) {
      return refreshTokenRepository.findByToken(token);
   }

   public RefreshToken verifyExpiration(RefreshToken token) {
      if (token.getExpiryDate().isBefore(Instant.now())) {
         refreshTokenRepository.delete(token);
         throw new TokenRefreshException("Refresh token is expired. Please login again");
      }

      if (token.isRevoked()) {
         throw new TokenRefreshException("Refresh token was revoked. Please login again");
      }
      return token;
   }

   @Transactional
   public void revokeToken(String token) {
      refreshTokenRepository.findByToken(token).ifPresent(refreshToken -> {
         refreshToken.setRevoked(true);
         refreshTokenRepository.save(refreshToken);
      });
   }

   @Transactional
   public void revokeAllAppUserTokens(Long appUserId) {
      // Get all tokens of a user
      List<RefreshToken> tokens = refreshTokenRepository.findByAppUserId(appUserId);

      // set revoked to true for each one
      tokens.forEach((token) -> token.setRevoked(true));

      // save all with the revoked status to true
      refreshTokenRepository.saveAll(tokens);
   }

   @Transactional
   public void deleteAllAppUserTokens(Long appUserId) {
      refreshTokenRepository.deleteByAppUserId(appUserId);
   }

   public List<RefreshToken> getActiveTokens(Long userId) {
      return refreshTokenRepository.findActiveTokensByUserId(userId);
   }

   // Scheduled task to clean up expired tokens (runs daily at 2 AM)
   @Scheduled(cron = "0 0 2 * * ?")
   @Transactional
   public void cleanupExpiredTokens() {
      refreshTokenRepository.deleteByExpiryDateBefore(Instant.now());
   }

   // Add this method to implement proper security
   public RefreshToken rotateToken(String oldToken, AppUser appUser) {
      // 1. Revoke the old token
      revokeToken(oldToken);

      // 2. Create new refresh token
      return this.createRefreshToken(appUser.getId());

   }

}
