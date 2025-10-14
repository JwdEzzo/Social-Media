package com.instragram.project.security.jwt;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

   private final String secretKey = "oOH5jWkeT6vxI1BOz3CH6pM4xyWNjfs6hsCFSveApo8=";

   public String generateToken(String username) {
      Map<String, Object> claims = new HashMap<>();
      claims.put("role", "ROLE_USER");
      return Jwts.builder()
            .claims()
            .add(claims)
            .subject(username)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hours
            .and()
            .signWith(getKey())
            .compact();
   }

   private Key getKey() {
      return Keys.hmacShaKeyFor(secretKey.getBytes());
   }

   public String extractUsername(String token) {
      return extractClaim(token, Claims::getSubject);
   }

   public String extractRole(String token) {
      return extractClaim(token, claims -> claims.get("role", String.class));
   }

   private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
      final Claims claims = extractAllClaims(token);
      return claimsResolver.apply(claims);
   }

   private Claims extractAllClaims(String token) {
      return Jwts.parser()
            .verifyWith((SecretKey) getKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
   }

   public Boolean validateToken(String token, UserDetails userDetails) {
      String username = extractUsername(token);
      return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
   }

   private Boolean isTokenExpired(String token) {
      return extractExpiration(token).before(new Date());
   }

   private Date extractExpiration(String token) {
      return extractClaim(token, Claims::getExpiration);
   }
}