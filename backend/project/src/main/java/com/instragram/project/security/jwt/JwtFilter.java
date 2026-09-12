package com.instragram.project.security.jwt;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import com.instragram.project.exception.UnauthorizedException;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class JwtFilter extends OncePerRequestFilter {

   private final JwtService jwtService;
   private final UserDetailsService userDetailsService;
   private final HandlerExceptionResolver handlerExceptionResolver;

   public JwtFilter(JwtService jwtService, UserDetailsService userDetailsService,
      @Qualifier("handlerExceptionResolver") HandlerExceptionResolver handlerExceptionResolver) {
      this.jwtService = jwtService;
      this.userDetailsService = userDetailsService;
      this.handlerExceptionResolver = handlerExceptionResolver;
   }

   @Override
   protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

      try {
         String authHeader = request.getHeader("Authorization"); // "Bearer eyJhbG..."
         String token = null;
         String username = null;

         if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);  // strip "Bearer " → the raw token
            username = jwtService.extractUsername(token);  // ← verifies signature, reads username
         }

         if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username); // load from DB
            if (jwtService.validateToken(token, userDetails)) { // token matches user + not expired?
               // build an "authenticated" stamp and put it in the security context
               UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                     userDetails, null, userDetails.getAuthorities());
               authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
               SecurityContextHolder.getContext().setAuthentication(authToken); // ← "this request is legit"
            }
         }
      } catch (ExpiredJwtException ex) {
         logger.warn("Expired JWT on " + request.getRequestURI());
         handlerExceptionResolver.resolveException(request, response, null,
               new UnauthorizedException("error.token.expired"));
         return; // must not continue the chain because it failed.

      } catch (JwtException | IllegalArgumentException ex) {
         logger.warn("Rejected JWT on " + request.getRequestURI() + ": " + ex.getMessage());
         handlerExceptionResolver.resolveException(request, response, null,
               new UnauthorizedException("error.token.invalid"));
         return;
      }

      filterChain.doFilter(request, response);  // hand off to the next filter
   }


   @Override
   protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
      String path = request.getRequestURI();
      // Allow login/register endpoints to bypass JWT
      return path.startsWith("/api/instagram/users/login") || path.startsWith("/api/instagram/users/signup");
   }
}